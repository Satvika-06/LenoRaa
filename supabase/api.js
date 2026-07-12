// ==========================================================================
// LENO-RAA COLD PROCESS SOAP - CUSTOMER JS API LAYER
// ==========================================================================

/**
 * Customer-facing Supabase backend integration library.
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
// 1. AUTHENTICATION FLOW API
// ==========================================================================

/**
 * Signs up a new customer with Email & Password.
 * Auto-triggers profile synchronization in database.
 * @param {string} email 
 * @param {string} password 
 * @param {string} fullName 
 */
async function signup(email, password, fullName) {
    const supabase = getClient();
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password: password,
            options: {
                data: {
                    full_name: fullName.trim()
                }
            }
        });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("Signup error:", error);
        let errVal = "Unknown signup error";
        if (error) {
            errVal = error.message || error.error_description || error.error || error.statusText || error.code || error.toString();
            if (typeof errVal === 'object') {
                try {
                    errVal = JSON.stringify(errVal);
                } catch (e) {
                    errVal = errVal.toString();
                }
            }
        }
        return { success: false, error: errVal };
    }
}

/**
 * Authenticates user via Email & Password.
 * Session is persisted in LocalStorage automatically.
 * @param {string} email 
 * @param {string} password 
 */
async function login(email, password) {
    const supabase = getClient();
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password: password
        });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("Login error:", error);
        let errVal = "Unknown login error";
        if (error) {
            errVal = error.message || error.error_description || error.error || error.statusText || error.code || error.toString();
            if (typeof errVal === 'object') {
                try {
                    errVal = JSON.stringify(errVal);
                } catch (e) {
                    errVal = errVal.toString();
                }
            }
        }
        return { success: false, error: errVal };
    }
}

/**
 * Logs out the current user session and purges local storage cache.
 */
async function logout() {
    const supabase = getClient();
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Logout error:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Password Reset: Sends instructions email to user.
 * @param {string} email 
 */
async function forgotPassword(email) {
    const supabase = getClient();
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
            redirectTo: window.location.origin + '/index.html#reset-password'
        });
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Forgot password error:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Password Reset: Updates password for active session.
 * @param {string} newPassword 
 */
async function resetPassword(newPassword) {
    const supabase = getClient();
    try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Reset password error:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Gets the current active user profile information.
 */
async function getCurrentUser() {
    const supabase = getClient();
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) return null;

        // Fetch custom profile data from public.profiles table
        let profile = null;
        const { data: fetchProfile, error: dbError } = await supabase
            .from('profiles')
            .select('*')
            .eq('auth_user_id', user.id)
            .maybeSingle();

        if (dbError) {
            console.warn("Profile fetch error, checking/creating fallback:", dbError.message);
        } else {
            profile = fetchProfile;
        }

        // Automatic creation fallback if user exists in auth but not in profiles table
        if (!profile) {
            console.log(`Auto-creating profiles entry for auth user: ${user.id}`);
            const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .insert({
                    auth_user_id: user.id,
                    full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Guest Soap Lover',
                    email: user.email || '',
                    phone: user.phone || null,
                    profile_image: user.user_metadata?.avatar_url || null
                })
                .select()
                .maybeSingle();

            if (insertError) {
                console.error("Profile auto-creation fallback error:", insertError.message);
            } else {
                profile = newProfile;
            }
        }

        // Return user metadata combined with custom database profiles row
        return { ...user, ...profile };
    } catch (error) {
        console.error("Get current user error:", error.message);
        return null;
    }
}

// ==========================================================================
// 2. USER PROFILE API
// ==========================================================================

/**
 * Updates profile metadata for the authenticated user.
 * @param {object} profileData - Fields to update.
 */
async function updateProfile(profileData) {
    const supabase = getClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Authentication required.");

        const { data, error } = await supabase
            .from('profiles')
            .update({
                full_name: profileData.fullName || profileData.full_name,
                phone: profileData.phone,
                profile_image: profileData.profileImage || profileData.profile_image,
                updated_at: new Date()
            })
            .eq('auth_user_id', user.id)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("Update profile error:", error.message);
        return { success: false, error: error.message };
    }
}

// ==========================================================================
// 3. SHOPPING CART PERSISTENCE API
// ==========================================================================

/**
 * Saves current shopping cart items state to database.
 * Replaces the database cart items array with current local items.
 * @param {Array} cartItems 
 */
async function saveCart(cartItems) {
    const supabase = getClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Authentication required to sync cart." };

        // Transaction simulation: delete then bulk insert
        const { error: deleteError } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        if (cartItems.length === 0) return { success: true };

        const dbItems = cartItems.map(item => ({
            user_id: user.id,
            product_id: item.isCustom ? null : item.id,
            quantity: item.quantity,
            price: item.price || 90, // defaults to aloe vera base price
            is_custom: item.isCustom || false,
            custom_details: item.isCustom ? item.customDetails : null
        }));

        const { data, error: insertError } = await supabase
            .from('cart_items')
            .insert(dbItems)
            .select();

        if (insertError) throw insertError;
        return { success: true, data };
    } catch (error) {
        console.error("Save cart error:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Reloads the cart items from the database.
 * Maps custom soaps and standard products correctly.
 */
async function loadCart() {
    const supabase = getClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('cart_items')
            .select('*');

        if (error) throw error;

        // Map database records back to client representation
        return data.map(item => {
            if (item.is_custom) {
                const details = item.custom_details;
                const descText = `${details.ingredients} for ${details.skinType} skin, aroma: ${details.fragrance}, tint: ${details.color}, shape: ${details.shape}, wrapping: ${details.packaging}`;
                return {
                    id: item.cart_id, // Client uses cart_id as unique key for custom rows
                    quantity: item.quantity,
                    isCustom: true,
                    customDetails: details,
                    price: item.price,
                    name: "Custom Doctor-Formulated Batch (5 Bars)",
                    description: descText,
                    image: "assets/handmade_process.jpg"
                };
            } else {
                return {
                    id: item.product_id,
                    quantity: item.quantity,
                    isCustom: false,
                    price: item.price
                };
            }
        });
    } catch (error) {
        console.error("Load cart error:", error.message);
        return [];
    }
}

// ==========================================================================
// 4. WISHLIST API
// ==========================================================================

/**
 * Saves current wishlist product IDs to database.
 * @param {Array<string>} productIds 
 */
async function saveWishlist(productIds) {
    const supabase = getClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Authentication required." };

        // Delete existing and insert new
        const { error: deleteError } = await supabase
            .from('wishlist')
            .delete()
            .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        if (productIds.length === 0) return { success: true };

        const dbWishlist = productIds.map(id => ({
            user_id: user.id,
            product_id: id
        }));

        const { data, error: insertError } = await supabase
            .from('wishlist')
            .insert(dbWishlist)
            .select();

        if (insertError) throw insertError;
        return { success: true, data };
    } catch (error) {
        console.error("Save wishlist error:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Retreives user wishlist product IDs from database.
 */
async function loadWishlist() {
    const supabase = getClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('wishlist')
            .select('product_id');

        if (error) throw error;
        return data.map(item => item.product_id);
    } catch (error) {
        console.error("Load wishlist error:", error.message);
        return [];
    }
}

// ==========================================================================
// 5. ADDRESS BOOK API
// ==========================================================================

/**
 * Saves address (inserts or updates) to user's address book.
 * Handles making it default if flag is checked.
 * @param {object} addressData 
 */
async function saveAddress(addressData) {
    const supabase = getClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Authentication required.");

        // If setting this address as default, unset others first
        if (addressData.isDefault) {
            await supabase
                .from('addresses')
                .update({ is_default: false })
                .eq('user_id', user.id);
        }

        let result;
        if (addressData.id) {
            // Update
            result = await supabase
                .from('addresses')
                .update({
                    address_type: addressData.addressType,
                    full_name: addressData.fullName,
                    phone: addressData.phone,
                    street_address: addressData.streetAddress,
                    city: addressData.city,
                    state: addressData.state,
                    country: addressData.country || 'India',
                    postal_code: addressData.postalCode,
                    is_default: addressData.isDefault
                })
                .eq('id', addressData.id)
                .select()
                .single();
        } else {
            // Insert new
            result = await supabase
                .from('addresses')
                .insert({
                    user_id: user.id,
                    address_type: addressData.addressType,
                    full_name: addressData.fullName,
                    phone: addressData.phone,
                    street_address: addressData.streetAddress,
                    city: addressData.city,
                    state: addressData.state,
                    country: addressData.country || 'India',
                    postal_code: addressData.postalCode,
                    is_default: addressData.isDefault
                })
                .select()
                .single();
        }

        if (result.error) throw result.error;
        return { success: true, data: result.data };
    } catch (error) {
        console.error("Save address error:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Loads address list.
 */
async function loadAddresses() {
    const supabase = getClient();
    try {
        const { data, error } = await supabase
            .from('addresses')
            .select('*')
            .order('is_default', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Load addresses error:", error.message);
        return [];
    }
}

// ==========================================================================
// 6. ORDER PROCESSING API
// ==========================================================================

/**
 * Places a customer order. Inserts order and order items inside a single database transaction.
 * Automatically clears user cart on success and triggers inventory stock check/decrement.
 * @param {object} orderDetails 
 * @param {Array} cartItems 
 */
async function placeOrder(orderDetails, cartItems) {
    const supabase = getClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Authentication required to place order.");

        // Fetch all products from DB to resolve names to UUIDs
        const { data: dbProducts } = await supabase
            .from('products')
            .select('id, name');

        // Map cart items to the database array format
        const itemsJson = cartItems.map(item => {
            let totalVal = item.price * item.quantity;
            
            // Resolve product_id by matching name
            let resolvedProductId = null;
            if (!item.isCustom && dbProducts) {
                const matched = dbProducts.find(p => p.name.toLowerCase() === item.name.toLowerCase());
                if (matched) {
                    resolvedProductId = matched.id;
                }
            }

            return {
                product_id: resolvedProductId,
                is_custom: item.isCustom || false,
                custom_details: item.isCustom ? item.customDetails : null,
                quantity: item.quantity,
                price: item.price,
                total: totalVal
            };
        });

        // Trigger transactional RPC function
        const { data: orderId, error } = await supabase.rpc('place_order_transaction', {
            p_payment_method: orderDetails.paymentMethod,
            p_shipping_address: orderDetails.shippingAddress,
            p_billing_address: orderDetails.billingAddress || orderDetails.shippingAddress,
            p_subtotal: orderDetails.subtotal,
            p_delivery_charge: orderDetails.deliveryCharge || 0.00,
            p_discount: orderDetails.discount || 0.00,
            p_tax: orderDetails.tax || 0.00,
            p_total_amount: orderDetails.totalAmount,
            p_tracking_number: orderDetails.trackingNumber || null,
            p_items: itemsJson
        });

        if (error) throw error;

        // Auto trigger a system notification for the confirmation of order
        await createNotification({
            userId: user.id,
            title: "Order Placed Successfully",
            message: `Your soap order order ID ${orderId} has been successfully recorded. Curing of soaps will begin soon!`,
            type: "Order Status"
        });

        return { success: true, orderId };
    } catch (error) {
        console.error("Place order error:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Retrieves past order history for the logged-in customer.
 */
async function getOrders() {
    const supabase = getClient();
    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    *,
                    products (name, image)
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Get orders error:", error.message);
        return [];
    }
}

/**
 * User cancels their own order if it's currently 'Pending'
 * @param {string} orderId 
 */
async function cancelOrder(orderId) {
    const supabase = getClient();
    try {
        const { data, error } = await supabase.rpc('cancel_order', {
            p_order_id: orderId
        });

        if (error) throw error;
        return { success: data.success, message: data.message };
    } catch (error) {
        console.error("Cancel order error:", error.message);
        return { success: false, error: error.message };
    }
}

// ==========================================================================
// 7. PRODUCT CATALOG SEARCH
// ==========================================================================

/**
 * Queries catalog products with filter supports.
 * @param {string} query 
 * @param {string} category 
 */
async function searchProducts(query = '', category = 'all') {
    const supabase = getClient();
    try {
        let sqlQuery = supabase.from('products').select('*');

        if (category !== 'all') {
            sqlQuery = sqlQuery.eq('category', category);
        }

        if (query) {
            sqlQuery = sqlQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
        }

        const { data, error } = await sqlQuery;
        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Search products error:", error.message);
        return [];
    }
}

// ==========================================================================
// 8. STORAGE UPLOADS API
// ==========================================================================

/**
 * Uploads media file to Specified Supabase Storage Bucket.
 * @param {string} bucket - 'products', 'profiles', 'reviews', 'banners'
 * @param {File} file - HTML File object
 * @param {string} folderName - Subfolder structure (typically auth.uid())
 */
async function uploadImage(bucket, file, folderName = '') {
    const supabase = getClient();
    try {
        const extension = file.name.split('.').pop();
        const randomName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${extension}`;
        const filePath = folderName ? `${folderName}/${randomName}` : randomName;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // Retrieve public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return { success: true, url: publicUrl };
    } catch (error) {
        console.error("Image upload error:", error.message);
        return { success: false, error: error.message };
    }
}

// ==========================================================================
// 9. RECENTLY VIEWED & SEARCH HISTORY PERSISTENCE
// ==========================================================================

async function saveSearch(queryText) {
    const supabase = getClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !queryText.trim()) return;

        await supabase.from('search_history').insert({
            user_id: user.id,
            query: queryText.trim()
        });
    } catch (e) {
        console.warn("Save search history warning:", e.message);
    }
}

async function loadSearchHistory() {
    const supabase = getClient();
    try {
        const { data, error } = await supabase
            .from('search_history')
            .select('query, created_at')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;
        return data.map(item => item.query);
    } catch (e) {
        console.warn("Load search history warning:", e.message);
        return [];
    }
}

async function saveRecentlyViewed(productId) {
    const supabase = getClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Upsert recently viewed
        await supabase.from('recently_viewed').upsert({
            user_id: user.id,
            product_id: productId,
            viewed_at: new Date()
        }, { onConflict: 'user_id,product_id' });
    } catch (e) {
        console.warn("Save recently viewed warning:", e.message);
    }
}

async function loadRecentlyViewed() {
    const supabase = getClient();
    try {
        const { data, error } = await supabase
            .from('recently_viewed')
            .select('product_id, products(*)')
            .order('viewed_at', { ascending: false })
            .limit(8);

        if (error) throw error;
        return data.map(item => item.products);
    } catch (e) {
        console.warn("Load recently viewed warning:", e.message);
        return [];
    }
}

// ==========================================================================
// 10. PRODUCT REVIEWS API
// ==========================================================================

async function addReview(productId, rating, reviewText, reviewImages = []) {
    const supabase = getClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Authentication required.");

        const { data, error } = await supabase
            .from('reviews')
            .insert({
                user_id: user.id,
                product_id: productId,
                rating: rating,
                review_text: reviewText,
                review_images: reviewImages
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("Add review error:", error.message);
        return { success: false, error: error.message };
    }
}

async function getReviews(productId) {
    const supabase = getClient();
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('*, profiles(full_name, profile_image)')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Get reviews error:", error.message);
        return [];
    }
}

// ==========================================================================
// 11. NOTIFICATIONS API
// ==========================================================================

async function createNotification(notifData) {
    const supabase = getClient();
    try {
        const { data, error } = await supabase
            .from('notifications')
            .insert({
                user_id: notifData.userId,
                title: notifData.title,
                message: notifData.message,
                type: notifData.type
            });
        if (error) throw error;
    } catch (e) {
        console.warn("Create notification warning:", e.message);
    }
}

async function getNotifications() {
    const supabase = getClient();
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Get notifications error:", error.message);
        return [];
    }
}

async function markNotificationRead(notificationId) {
    const supabase = getClient();
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error("Mark notification read error:", error.message);
        return { success: false, error: error.message };
    }
}

async function getUnreadNotificationsCount() {
    const supabase = getClient();
    try {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false);

        if (error) throw error;
        return count;
    } catch (error) {
        console.error("Get unread notifications count error:", error.message);
        return 0;
    }
}

// ==========================================================================
// 12. COUPONS API
// ==========================================================================

async function validateCoupon(code, purchaseAmount) {
    const supabase = getClient();
    try {
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', code.trim().toUpperCase())
            .single();

        if (error) {
            return { valid: false, message: "Coupon code does not exist." };
        }

        const now = new Date();
        const expiry = new Date(data.expiry_date);

        if (!data.is_active || expiry <= now) {
            return { valid: false, message: "This coupon is expired or inactive." };
        }

        if (purchaseAmount < parseFloat(data.min_purchase)) {
            return { valid: false, message: `Minimum purchase of ₹${data.min_purchase} required to use this coupon.` };
        }

        return {
            valid: true,
            discountType: data.discount_type,
            discountValue: parseFloat(data.discount_value),
            message: "Coupon applied successfully!"
        };
    } catch (error) {
        console.error("Validate coupon error:", error.message);
        return { valid: false, message: "Failed to validate coupon." };
    }
}

// ==========================================================================
// EXPOSE APIs TO GLOBAL WINDOW
// ==========================================================================

// ==========================================================================
// 13. PHONE OTP AUTHENTICATION
// ==========================================================================

/**
 * Sends SMS verification OTP to phone number.
 * @param {string} phone 
 */
async function sendOTP(phone) {
    const supabase = getClient();
    try {
        const { data, error } = await supabase.auth.signInWithOtp({
            phone: phone.trim()
        });
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("Send OTP error:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Verifies SMS verification OTP code.
 * @param {string} phone 
 * @param {string} token 
 */
async function verifyOTP(phone, token) {
    const supabase = getClient();
    try {
        const { data, error } = await supabase.auth.verifyOtp({
            phone: phone.trim(),
            token: token.trim(),
            type: 'sms'
        });
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("Verify OTP error:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Links a phone number to currently logged in email session.
 * User will receive SMS OTP that requires verification.
 * @param {string} phone 
 */
async function linkPhoneNumber(phone) {
    const supabase = getClient();
    try {
        const { data, error } = await supabase.auth.updateUser({
            phone: phone.trim()
        });
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("Link phone number error:", error.message);
        return { success: false, error: error.message };
    }
}

// ==========================================================================
// 14. GOOGLE OAUTH
// ==========================================================================

/**
 * Initiates Google Oauth Login flow.
 */
async function googleLogin() {
    const supabase = getClient();
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("Google OAuth error:", error.message);
        return { success: false, error: error.message };
    }
}

// ==========================================================================
// 15. PDF INVOICE MANAGEMENT
// ==========================================================================

/**
 * Saves generated invoice details in invoices DB table.
 * @param {string} orderId 
 * @param {string} invoiceNumber 
 * @param {string} pdfUrl 
 */
async function saveInvoiceRecord(orderId, invoiceNumber, pdfUrl) {
    const supabase = getClient();
    try {
        const { data, error } = await supabase
            .from('invoices')
            .insert({
                order_id: orderId,
                invoice_number: invoiceNumber,
                pdf_url: pdfUrl
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("Save invoice error:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Gets invoice URL for an order if already generated.
 * @param {string} orderId 
 */
async function getInvoice(orderId) {
    const supabase = getClient();
    try {
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('order_id', orderId)
            .maybeSingle();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Get invoice error:", error.message);
        return null;
    }
}

// ==========================================================================
// 16. DELIVERY SHIPMENT TRACKING
// ==========================================================================

/**
 * Gets tracking updates for tracking number (public access).
 * @param {string} trackingNumber 
 */
async function getTrackingInfo(trackingNumber) {
    const supabase = getClient();
    try {
        const { data, error } = await supabase
            .from('tracking')
            .select('*')
            .eq('tracking_number', trackingNumber.trim())
            .maybeSingle();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Get tracking error:", error.message);
        return null;
    }
}

/**
 * Gets tracking updates for a specific order.
 * @param {string} orderId 
 */
async function loadOrderTracking(orderId) {
    const supabase = getClient();
    try {
        const { data, error } = await supabase
            .from('tracking')
            .select('*')
            .eq('order_id', orderId)
            .maybeSingle();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Get order tracking error:", error.message);
        return null;
    }
}

// ==========================================================================
// 17. CUSTOMER SUPPORT CHAT & TICKETS
// ==========================================================================

/**
 * Creates support ticket.
 * @param {string} subject 
 * @param {string} priority - 'Low', 'Medium', 'High'
 */
async function openSupportTicket(subject, priority = 'Medium') {
    const supabase = getClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Auth required");

        const { data, error } = await supabase
            .from('support_tickets')
            .insert({
                user_id: user.id,
                subject: subject.trim(),
                priority
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("Open ticket error:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Sends a message in ticket chat.
 * @param {string} ticketId 
 * @param {string} messageText 
 * @param {Array<string>} attachments - Uploaded image/file URLs
 */
async function sendSupportMessage(ticketId, messageText, attachments = []) {
    const supabase = getClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Auth required");

        const { data, error } = await supabase
            .from('support_messages')
            .insert({
                ticket_id: ticketId,
                sender_id: user.id,
                message_text: messageText,
                attachments
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("Send support message error:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Loads support tickets.
 */
async function loadSupportTickets() {
    const supabase = getClient();
    try {
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Load support tickets error:", error.message);
        return [];
    }
}

/**
 * Loads messages for a support ticket.
 * @param {string} ticketId 
 */
async function loadSupportMessages(ticketId) {
    const supabase = getClient();
    try {
        const { data, error } = await supabase
            .from('support_messages')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Load support messages error:", error.message);
        return [];
    }
}

/**
 * Subscribes to realtime updates for ticket messages.
 * @param {string} ticketId 
 * @param {function} callback 
 */
function subscribeToSupportMessages(ticketId, callback) {
    const supabase = getClient();
    return supabase.channel(`ticket-messages-${ticketId}`)
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `ticket_id=eq.${ticketId}` },
            payload => {
                callback(payload.new);
            }
        )
        .subscribe();
}

// ==========================================================================
// 18. NOTIFICATION LOGGERS & ACTIVITY LOGGER
// ==========================================================================

async function logEmail(recipient, subject, templateName, status = 'Sent') {
    const supabase = getClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('email_logs').insert({
            user_id: user?.id || null,
            recipient,
            subject,
            template_name: templateName,
            status
        });
    } catch (e) {
        console.warn("Log email error:", e.message);
    }
}

async function logWhatsApp(recipientPhone, messageBody, status = 'Sent') {
    const supabase = getClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('whatsapp_logs').insert({
            user_id: user?.id || null,
            recipient_phone: recipientPhone,
            message_body: messageBody,
            status
        });
    } catch (e) {
        console.warn("Log WhatsApp error:", e.message);
    }
}

async function logActivity(activityType, details = {}) {
    const supabase = getClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from('activity_logs').insert({
            user_id: user.id,
            activity_type: activityType,
            details
        });
    } catch (e) {
        console.warn("Log activity error:", e.message);
    }
}

// ==========================================================================
// EXPOSE APIs TO GLOBAL WINDOW
// ==========================================================================

window.LenoRaaAPI = {
    signup,
    login,
    logout,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    updateProfile,
    saveCart,
    loadCart,
    saveWishlist,
    loadWishlist,
    saveAddress,
    loadAddresses,
    placeOrder,
    getOrders,
    cancelOrder,
    searchProducts,
    uploadImage,
    saveSearch,
    loadSearchHistory,
    saveRecentlyViewed,
    loadRecentlyViewed,
    addReview,
    getReviews,
    getNotifications,
    markNotificationRead,
    getUnreadNotificationsCount,
    validateCoupon,
    sendOTP,
    verifyOTP,
    linkPhoneNumber,
    googleLogin,
    saveInvoiceRecord,
    getInvoice,
    getTrackingInfo,
    loadOrderTracking,
    openSupportTicket,
    sendSupportMessage,
    loadSupportTickets,
    loadSupportMessages,
    subscribeToSupportMessages,
    logEmail,
    logWhatsApp,
    logActivity
};
