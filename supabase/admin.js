// ==========================================================================
// LENO-RAA COLD PROCESS SOAP - ADMIN PANEL JS API LAYER
// ==========================================================================

/**
 * Administrative panel integration library.
 * Assumes window.supabaseClient has been initialized via supabaseClient.js.
 */

// Helper to grab initialized client
const getClient = () => {
    if (!window.supabaseClient) {
        throw new Error("Supabase Client is not initialized. Please load supabaseClient.js first.");
    }
    return window.supabaseClient;
};

// ==========================================================================
// 1. DASHBOARD ANALYTICS API
// ==========================================================================

/**
 * Fetches aggregated statistics for the Admin Dashboard.
 */
async function getAdminDashboardStats() {
    const supabase = getClient();
    try {
        // 1. Total Registered Users
        const { count: totalUsers, error: usersError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (usersError) throw usersError;

        // 2. Today's Orders count
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const { count: todaysOrders, error: todayOrdersError } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startOfToday.toISOString());

        if (todayOrdersError) throw todayOrdersError;

        // 3. Pending Orders count
        const { count: pendingOrders, error: pendingOrdersError } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('order_status', 'Pending');

        if (pendingOrdersError) throw pendingOrdersError;

        // 4. Revenue (Sum of total_amount of non-cancelled orders)
        const { data: revenueData, error: revenueError } = await supabase
            .from('orders')
            .select('total_amount')
            .neq('order_status', 'Cancelled');

        if (revenueError) throw revenueError;
        const totalRevenue = revenueData.reduce((sum, o) => sum + parseFloat(o.total_amount), 0.00);

        // 5. Recent Orders List
        const { data: recentOrders, error: recentOrdersError } = await supabase
            .from('orders')
            .select('*, profiles(full_name, email)')
            .order('created_at', { ascending: false })
            .limit(10);

        if (recentOrdersError) throw recentOrdersError;

        // 6. Customers list
        const { data: customerList, error: customersError } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (customersError) throw customersError;

        // 7. Top Selling Products
        const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select('product_id, quantity, total, products(name, image)');

        if (itemsError) throw itemsError;

        // Aggregate top selling products
        const topProductsMap = {};
        orderItems.forEach(item => {
            if (!item.product_id) return; // skip custom
            const pId = item.product_id;
            const pName = item.products?.name || "Unknown Product";
            const pImg = item.products?.image || "";
            if (!topProductsMap[pId]) {
                topProductsMap[pId] = { id: pId, name: pName, image: pImg, quantity: 0, sales: 0 };
            }
            topProductsMap[pId].quantity += item.quantity;
            topProductsMap[pId].sales += parseFloat(item.total);
        });

        const topProducts = Object.values(topProductsMap)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        return {
            success: true,
            stats: {
                totalUsers,
                todaysOrders,
                pendingOrders,
                totalRevenue,
                topProducts,
                recentOrders,
                customerList
            }
        };
    } catch (error) {
        console.error("Dashboard stats error:", error.message);
        return { success: false, error: error.message };
    }
}

// ==========================================================================
// 2. ORDER MANAGEMENT API
// ==========================================================================

/**
 * Updates order status. Can trigger stock restorations if status is Cancelled.
 * @param {string} orderId 
 * @param {string} status - 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'
 */
async function updateOrderStatus(orderId, status) {
    const supabase = getClient();
    try {
        // If updating status to Cancelled, use cancel_order RPC to safely restore stock
        if (status === 'Cancelled') {
            const { data, error } = await supabase.rpc('cancel_order', { p_order_id: orderId });
            if (error) throw error;
            return { success: data.success, message: data.message };
        }

        // Standard updates
        const { data, error } = await supabase
            .from('orders')
            .update({ order_status: status, updated_at: new Date() })
            .eq('order_id', orderId)
            .select()
            .single();

        if (error) throw error;

        // Sync order status change notification to customer
        await supabase.from('notifications').insert({
            user_id: data.user_id,
            title: `Order Status Updated: ${status}`,
            message: `Your order status for order ID ${orderId} has been updated to '${status}'.`,
            type: "Order Status"
        });

        return { success: true, data };
    } catch (error) {
        console.error("Update order status error:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Quick Actions: Confirm an order
 * @param {string} orderId 
 */
async function confirmOrder(orderId) {
    return await updateOrderStatus(orderId, 'Confirmed');
}

/**
 * Quick Actions: Reject/Cancel an order
 * @param {string} orderId 
 */
async function rejectOrder(orderId) {
    return await updateOrderStatus(orderId, 'Cancelled');
}

// ==========================================================================
// 3. PRODUCT CATALOG MANAGEMENT (CRUD)
// ==========================================================================

/**
 * Adds a new cold process soap to the inventory.
 * @param {object} productData 
 */
async function addProduct(productData) {
    const supabase = getClient();
    try {
        const { data, error } = await supabase
            .from('products')
            .insert({
                name: productData.name,
                description: productData.description,
                price: productData.price,
                offer_price: productData.offerPrice || null,
                category: productData.category,
                skin_type: productData.skinType || null,
                ingredients: productData.ingredients || [],
                benefits: productData.benefits || [],
                image: productData.image,
                gallery_images: productData.galleryImages || [],
                stock: productData.stock || 0,
                is_featured: productData.isFeatured || false
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("Add product error:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Edits an existing soap catalog entry.
 * @param {string} productId 
 * @param {object} productData 
 */
async function editProduct(productId, productData) {
    const supabase = getClient();
    try {
        const { data, error } = await supabase
            .from('products')
            .update({
                name: productData.name,
                description: productData.description,
                price: productData.price,
                offer_price: productData.offerPrice || null,
                category: productData.category,
                skin_type: productData.skinType || null,
                ingredients: productData.ingredients || [],
                benefits: productData.benefits || [],
                image: productData.image,
                gallery_images: productData.galleryImages || [],
                stock: productData.stock,
                is_featured: productData.isFeatured,
                updated_at: new Date()
            })
            .eq('id', productId)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("Edit product error:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Deletes a soap catalog entry.
 * @param {string} productId 
 */
async function deleteProduct(productId) {
    const supabase = getClient();
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Delete product error:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Adjusts inventory stock for a product catalog item.
 * @param {string} productId 
 * @param {number} newStock 
 */
async function updateProductStock(productId, newStock) {
    const supabase = getClient();
    try {
        const { data, error } = await supabase
            .from('products')
            .update({ stock: newStock, updated_at: new Date() })
            .eq('id', productId)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("Update stock error:", error.message);
        return { success: false, error: error.message };
    }
}

// ==========================================================================
// 4. REALTIME MONITORING API
// ==========================================================================

/**
 * Subscribes to realtime updates for Orders table.
 * Useful for refreshing admin lists automatically.
 * @param {function} callback 
 */
function subscribeToOrders(callback) {
    const supabase = getClient();
    return supabase.channel('admin-orders-channel')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            payload => {
                console.log("Realtime order database update received:", payload);
                callback(payload);
            }
        )
        .subscribe();
}

/**
 * Subscribes to realtime updates for Products table.
 * @param {function} callback 
 */
function subscribeToProducts(callback) {
    const supabase = getClient();
    return supabase.channel('admin-products-channel')
        .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'products' },
            payload => {
                console.log("Realtime product stock/catalog update received:", payload);
                callback(payload);
            }
        )
        .subscribe();
}

// ==========================================================================
// EXPOSE APIs TO GLOBAL WINDOW
// ==========================================================================

// ==========================================================================
// 5. SHIPMENT TRACKING MANAGEMENT
// ==========================================================================

/**
 * Creates tracking details for a confirmed order.
 */
async function createTracking(orderId, courierName, trackingNumber, trackingUrl = '', estDelivery = null) {
    const supabase = getClient();
    try {
        const { data, error } = await supabase
            .from('tracking')
            .insert({
                order_id: orderId,
                tracking_number: trackingNumber,
                courier_name: courierName,
                tracking_url: trackingUrl,
                estimated_delivery: estDelivery,
                status: 'In Transit',
                delivery_updates: JSON.stringify([{
                    time: new Date().toISOString(),
                    status: 'In Transit',
                    description: 'Shipment handed over to courier partner.'
                }])
            })
            .select()
            .single();

        if (error) throw error;

        // Also update tracking number in orders table
        await supabase
            .from('orders')
            .update({ tracking_number: trackingNumber })
            .eq('order_id', orderId);

        // Notify user about tracking details
        const { data: order } = await supabase.from('orders').select('user_id').eq('order_id', orderId).single();
        if (order) {
            await supabase.from('notifications').insert({
                user_id: order.user_id,
                title: "Order Shipped / Tracking Created",
                message: `Your order has been shipped via ${courierName}. Tracking: ${trackingNumber}`,
                type: "Order Status"
            });
        }

        await auditAdminAction('TRACKING_CREATED', `Shipped order ID ${orderId} via tracking ${trackingNumber}`);
        return { success: true, data };
    } catch (error) {
        console.error("Create tracking error:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Updates status and appends live location checkpoints.
 */
async function updateTracking(trackingId, status, currentLocation, comment = '') {
    const supabase = getClient();
    try {
        // Fetch current tracking checkpoints
        const { data: currentTracking, error: fetchError } = await supabase
            .from('tracking')
            .select('*')
            .eq('tracking_id', trackingId)
            .single();

        if (fetchError) throw fetchError;

        let updatesList = [];
        try {
            updatesList = typeof currentTracking.delivery_updates === 'string'
                ? JSON.parse(currentTracking.delivery_updates)
                : currentTracking.delivery_updates || [];
        } catch (e) {
            updatesList = [];
        }

        updatesList.push({
            time: new Date().toISOString(),
            status: status,
            location: currentLocation,
            description: comment
        });

        const { data, error } = await supabase
            .from('tracking')
            .update({
                status: status,
                current_location: currentLocation,
                delivery_updates: updatesList,
                updated_at: new Date()
            })
            .eq('tracking_id', trackingId)
            .select()
            .single();

        if (error) throw error;

        // Sync order status automatically if tracking status is Delivered
        if (status === 'Delivered') {
            await updateOrderStatus(currentTracking.order_id, 'Delivered');
        } else if (status === 'Out for Delivery') {
            await updateOrderStatus(currentTracking.order_id, 'Out for Delivery');
        }

        return { success: true, data };
    } catch (error) {
        console.error("Update tracking error:", error.message);
        return { success: false, error: error.message };
    }
}

// ==========================================================================
// 6. DATABASE MANUAL BACKUPS & RESTORE API
// ==========================================================================

/**
 * Generates database backup, uploads it to backups bucket, and logs it.
 */
async function backupDatabase(backupName) {
    const supabase = getClient();
    try {
        const tables = ['products', 'profiles', 'orders', 'order_items', 'addresses', 'support_tickets', 'support_messages', 'reviews', 'coupons'];
        const backupData = {
            timestamp: new Date().toISOString(),
            tables: {}
        };

        // Query all public tables data
        for (const tableName of tables) {
            const { data, error } = await supabase.from(tableName).select('*');
            if (error) throw error;
            backupData.tables[tableName] = data || [];
        }

        const serialized = JSON.stringify(backupData, null, 2);
        const fileName = `${backupName.replace(/[^a-zA-Z0-9_-]/g, "_")}_${Date.now()}.json`;
        
        // Convert to Blob and upload
        const blob = new Blob([serialized], { type: "application/json" });
        const file = new File([blob], fileName, { type: "application/json" });

        const { error: uploadError } = await supabase.storage
            .from('backups')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Retrieve public or signed download link
        const { data: { publicUrl } } = supabase.storage
            .from('backups')
            .getPublicUrl(fileName);

        // Record backup in backups table
        const { data: logRecord, error: dbError } = await supabase
            .from('backups')
            .insert({
                backup_name: backupName,
                file_url: publicUrl,
                backup_type: 'Manual',
                status: 'Completed'
            })
            .select()
            .single();

        if (dbError) throw dbError;

        await auditAdminAction('BACKUP_CREATED', `Database manual backup generated: ${backupName} (${fileName})`);
        return { success: true, data: logRecord };
    } catch (error) {
        console.error("Backup database error:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Restores database state using a specific backup file.
 */
async function restoreBackup(backupId) {
    const supabase = getClient();
    try {
        const { data: backupRecord, error: fetchError } = await supabase
            .from('backups')
            .select('*')
            .eq('backup_id', backupId)
            .single();

        if (fetchError) throw fetchError;

        // Extract filename from URL
        const fileName = backupRecord.file_url.split('/').pop();
        
        const { data: fileBlob, error: downloadError } = await supabase.storage
            .from('backups')
            .download(fileName);

        if (downloadError) throw downloadError;

        const text = await fileBlob.text();
        const parsed = JSON.parse(text);

        if (!parsed.tables) throw new Error("Invalid backup format structure.");

        // Clear and insert table records in dependency order
        // 1. Clear tables (dependent tables first to avoid reference blocks)
        const tablesToClear = ['support_messages', 'support_tickets', 'reviews', 'order_items', 'orders', 'addresses', 'profiles', 'products', 'coupons'];
        for (const tbl of tablesToClear) {
            await supabase.from(tbl).delete().neq('id', '00000000-0000-0000-0000-000000000000'); // delete all (using dummy condition to bypass empty safety blocks)
        }

        // 2. Insert records (parent tables first)
        const tablesToRestore = ['coupons', 'products', 'profiles', 'addresses', 'orders', 'order_items', 'reviews', 'support_tickets', 'support_messages'];
        for (const tbl of tablesToRestore) {
            const rows = parsed.tables[tbl];
            if (rows && rows.length > 0) {
                const { error: insertError } = await supabase.from(tbl).insert(rows);
                if (insertError) throw insertError;
            }
        }

        await auditAdminAction('BACKUP_RESTORED', `Database state restored from backup ID ${backupId}`);
        return { success: true };
    } catch (error) {
        console.error("Restore backup error:", error.message);
        return { success: false, error: error.message };
    }
}

// ==========================================================================
// 7. EXPORT DATA TO CSV UTILITY
// ==========================================================================

/**
 * Fetches database table records and parses them into a downloadable CSV string.
 * @param {string} tableName - 'products', 'profiles', 'orders'
 */
async function exportTableToCSV(tableName) {
    const supabase = getClient();
    try {
        const { data, error } = await supabase.from(tableName).select('*');
        if (error) throw error;

        if (!data || data.length === 0) {
            return { success: false, error: "No records found to export." };
        }

        // Parse JSON object fields into columns headers
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(",")];

        data.forEach(row => {
            const values = headers.map(hdr => {
                const val = row[hdr];
                if (val === null || val === undefined) return '""';
                let strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
                // Escape quotes
                strVal = strVal.replace(/"/g, '""');
                return `"${strVal}"`;
            });
            csvRows.push(values.join(","));
        });

        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        await auditAdminAction('DATA_EXPORTED', `Exported table ${tableName} to CSV.`);
        return { success: true, url, fileName: `lenora_${tableName}_export_${Date.now()}.csv` };
    } catch (error) {
        console.error("Export error:", error.message);
        return { success: false, error: error.message };
    }
}

// ==========================================================================
// 8. SECURITY AUDIT LOGGING
// ==========================================================================

async function auditAdminAction(eventType, description) {
    const supabase = getClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('audit_logs').insert({
            event_type: eventType,
            description: description,
            actor_id: user?.id || null,
            ip_address: null, // security definer can capture this or we handle server-side
            user_agent: navigator.userAgent
        });
    } catch (e) {
        console.warn("Audit log warning:", e.message);
    }
}

// ==========================================================================
// 9. SUPPORT TICKETS REALTIME MONITORING
// ==========================================================================

function subscribeToSupportTickets(callback) {
    const supabase = getClient();
    return supabase.channel('admin-tickets-channel')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'support_tickets' },
            payload => {
                console.log("Realtime ticket DB change received:", payload);
                callback(payload);
            }
        )
        .subscribe();
}

// ==========================================================================
// EXPOSE APIs TO GLOBAL WINDOW
// ==========================================================================

window.LenoRaaAdminAPI = {
    getAdminDashboardStats,
    updateOrderStatus,
    confirmOrder,
    rejectOrder,
    addProduct,
    editProduct,
    deleteProduct,
    updateProductStock,
    subscribeToOrders,
    subscribeToProducts,
    createTracking,
    updateTracking,
    backupDatabase,
    restoreBackup,
    exportTableToCSV,
    auditAdminAction,
    subscribeToSupportTickets
};
