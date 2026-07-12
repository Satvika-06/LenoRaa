# Leno-Raa Cold Process Soaps Backend Deployment Guide

This folder contains the complete, production-ready Supabase backend files for the **Leno-Raa Cold Process Soaps** e-commerce application.

## Folder Structure

```
/supabase
├── migrations/
│   └── 20260711000000_init_schema.sql  # Database schema, triggers, and RLS/storage policies
├── supabaseClient.js                    # CDN-based Supabase client initializer
├── api.js                               # Customer API layer (Cart, Wishlist, Auth, Checkout, Reviews)
├── admin.js                             # Admin Panel APIs (CRUD products, adjust stock, order status, metrics)
└── README.md                            # Setup and deployment manual (This file)
```

---

## 1. Supabase Database Deployment Instructions

To set up the database tables, security policies, triggers, and helper functions on your Supabase project:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and open your project.
2. Navigate to the **SQL Editor** tab from the left sidebar.
3. Click **New Query** to open a blank editor.
4. Copy the entire contents of the migration script: [20260711000000_init_schema.sql](file:///c:/Users/LENOVO/OneDrive/Documents/Lenoraa%20soaps/supabase/migrations/20260711000000_init_schema.sql)
5. Paste it into the SQL Editor and click the **Run** button at the bottom right.
6. Verify that it executes successfully without errors. This will create:
   - All 12 core relational tables (`profiles`, `products`, `cart_items`, `wishlist`, `orders`, `order_items`, `addresses`, `search_history`, `recently_viewed`, `reviews`, `notifications`, `coupons`).
   - Standard indices for performance optimization on search columns and foreign keys.
   - Row Level Security (RLS) policies on all tables.
   - Database trigger functions (`handle_new_user`, `process_order_item_stock`, `protect_profile_admin_flag`, `update_product_reviews_aggregate`).
   - Special transaction RPC function `place_order_transaction` and cancel order RPC `cancel_order`.

---

## 2. Storage Buckets Setup

To configure Supabase Storage for product images, user profile avatars, reviews media, and homepage banners:

1. In your Supabase Dashboard, click on **Storage** in the left navigation sidebar.
2. Click **New Bucket** and create the following four buckets:
   - Name: `products` | Toggle **Public bucket** to `ON`.
   - Name: `profiles` | Toggle **Public bucket** to `ON`.
   - Name: `reviews`  | Toggle **Public bucket** to `ON`.
   - Name: `banners`  | Toggle **Public bucket** to `ON`.
3. The policies for reading and writing files to these buckets were already generated and deployed in Step 1 (the migration script defines policies on the `storage.objects` table).
   - Anyone can read files from any bucket (Public).
   - Only authenticated users can write to `profiles` and `reviews` in folders corresponding to their UUID (e.g. `profiles/{user_id}/avatar.jpg`).
   - Only administrative accounts can write files to the `products` and `banners` buckets.

---

## 3. Frontend Script Integration

To load Supabase in your HTML pages:

1. Add the Supabase JS SDK CDN script tag inside the `<head>` or at the end of `index.html`, right before your custom scripts:
   ```html
   <!-- Supabase Client SDK -->
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   ```
2. Include the client configuration and API layers in the correct order:
   ```html
   <!-- Supabase Custom API Integrations -->
   <script src="supabase/supabaseClient.js"></script>
   <script src="supabase/api.js"></script>
   <script src="supabase/admin.js"></script>
   
   <!-- Main E-Commerce Application Engine -->
   <script src="app.js"></script>
   ```
3. Set your project credentials on the global window context inside `index.html` (or modify the placeholders directly in [supabaseClient.js](file:///c:/Users/LENOVO/OneDrive/Documents/Lenoraa%20soaps/supabase/supabaseClient.js)):
   ```html
   <script>
     window.ENV_SUPABASE_URL = "https://your-project-ref.supabase.co";
     window.ENV_SUPABASE_ANON_KEY = "your-anon-key-here";
   </script>
   ```

---

## 4. Key Architectural Flows

### A. Authentication Flow
- **Email/Password Signup**: Users sign up via `LenoRaaAPI.signup()`. Supabase creates the credentials in `auth.users`.
- **Profile Synchronization**: The Postgres trigger `on_auth_user_created` intercepts the signup and inserts a profile row into `public.profiles` automatically, copying their name, email, and avatar metadata.
- **Session Persistence**: Sessions are cached in localStorage by the Supabase SDK. When a user returns, the session restores, and `LenoRaaAPI.getCurrentUser()` loads their credentials.
- **Admin Assignment**: To make a profile an Admin, modify their row in the `public.profiles` table and set `is_admin` to `true`. The trigger `tr_protect_profile_admin_flag` prevents non-admins from changing this column via API client updates.

### B. Cart & Wishlist Sync Flow
- **Persisted Carts**: When a logged-in user changes their cart (adding, removing, adjusting quantity), `LenoRaaAPI.saveCart(cart)` updates the `public.cart_items` table.
- **Multi-Device Support**: When a user logs in, `LenoRaaAPI.loadCart()` fetches their remote cart. Standard items are mapped by `product_id`. Custom items are stored as `is_custom = true` with all configurations serialized into a JSONB `custom_details` object.
- **Wishlist Sync**: Wishlisted items are synced using `LenoRaaAPI.saveWishlist()` and restored using `LenoRaaAPI.loadWishlist()`.

### C. Order Flow (Transactional & Stock Secure)
- **Atomics**: Placed orders run via the RPC function `place_order_transaction`. This wraps order insertion, itemized loops, and cart clearing into a single database transaction.
- **Race Condition Protection**: The before-insert trigger on `order_items` queries product stock using `FOR UPDATE` row lock. If `stock < quantity`, the database raises an exception and automatically rolls back the entire order checkout, preventing over-ordering or double-selling.
- **Refunds / Cancellations**: If an order status is updated to `'Cancelled'` via `LenoRaaAPI.cancelOrder()`, a trigger or RPC automatically increments the product's catalog stock back by the order items' quantities.

### D. Admin Flow
- **Analytics Dashboard**: The function `LenoRaaAdminAPI.getAdminDashboardStats()` runs analytical aggregates on the server to compute Total Users, Today's Orders, Pending Orders, Revenue, and Top Selling products, feeding the admin interface.
- **Realtime Monitors**: Realtime Postgres changes are subscribed to via `LenoRaaAdminAPI.subscribeToOrders()` and `subscribeToProducts()`. Any change to order statuses or catalog stock in the database triggers an instant update on the Admin Dashboard client screen without requiring refreshes.
- **Inventory CRUD**: Admin panel actions (Adding products, editing, deleting, updating stock counts, uploading images to buckets) utilize RLS policies that assert `public.is_admin() IS TRUE` on the client's auth session.
