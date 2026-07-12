-- ==========================================================================
-- LENO-RAA COLD PROCESS SOAP - SUPABASE DATABASE SCHEMA MIGRATION
-- ==========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================================================
-- 1. TABLES DEFINITIONS
-- ==========================================================================

-- Products Table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    offer_price NUMERIC(10, 2) CHECK (offer_price >= 0 AND offer_price <= price),
    category TEXT NOT NULL, -- 'oily', 'dry', 'normal', etc.
    skin_type TEXT,
    ingredients TEXT[] DEFAULT '{}',
    benefits TEXT[] DEFAULT '{}',
    image TEXT NOT NULL,
    gallery_images TEXT[] DEFAULT '{}',
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    rating NUMERIC(3, 2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    reviews_count INTEGER DEFAULT 0 CHECK (reviews_count >= 0),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Profiles Table (Linked to Supabase Auth)
CREATE TABLE public.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    postal_code TEXT,
    profile_image TEXT,
    is_admin BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Shopping Cart Table
CREATE TABLE public.cart_items (
    cart_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE, -- Nullable for custom soaps
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    is_custom BOOLEAN DEFAULT false NOT NULL,
    custom_details JSONB, -- For doctor-formulated custom soap configurations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Prevent duplicate entries of standard products in same user's cart
    CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

-- Wishlist Table
CREATE TABLE public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_wishlist UNIQUE (user_id, product_id)
);

-- Address Book Table
CREATE TABLE public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    address_type TEXT NOT NULL CHECK (address_type IN ('Home', 'Office', 'Other')),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    street_address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT DEFAULT 'India' NOT NULL,
    postal_code TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders Table
CREATE TABLE public.orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_status TEXT NOT NULL DEFAULT 'Pending' CHECK (order_status IN ('Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Failed', 'Refunded')),
    payment_method TEXT NOT NULL, -- 'cod', 'razorpay', 'upi', etc.
    shipping_address JSONB NOT NULL, -- Snapshot of address at time of order
    billing_address JSONB NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    delivery_charge NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (delivery_charge >= 0),
    discount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (discount >= 0),
    tax NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (tax >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    tracking_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Order Items Table (Line items details)
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(order_id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL, -- Nullable if product is deleted
    is_custom BOOLEAN DEFAULT false NOT NULL,
    custom_details JSONB,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0)
);

-- Search History Table
CREATE TABLE public.search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Recently Viewed Table
CREATE TABLE public.recently_viewed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_recently_viewed UNIQUE (user_id, product_id)
);

-- Reviews Table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_images TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Notifications Table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Order Status', 'Payment', 'Offer', 'Announcement'
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Coupons Table
CREATE TABLE public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    min_purchase NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (min_purchase >= 0),
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================================
-- 2. SECURITY HELPER FUNCTIONS
-- ==========================================================================

-- Check if current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()),
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has purchased the product (Must have a 'Delivered' order containing the product)
CREATE OR REPLACE FUNCTION public.has_purchased_product(user_uuid UUID, prod_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.orders o
    JOIN public.order_items oi ON o.order_id = oi.order_id
    WHERE o.user_id = user_uuid
      AND o.order_status = 'Delivered'
      AND oi.product_id = prod_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================================================
-- 3. TRIGGERS & AUTOMATION FUNCTIONS
-- ==========================================================================

-- Auto create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, profile_image)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Guest Soap Lover'),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Protect profile is_admin flag from being edited by non-admins
CREATE OR REPLACE FUNCTION public.protect_profile_admin_flag()
RETURNS TRIGGER AS $$
BEGIN
  -- If is_admin is altered, verify auth user is admin
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
    IF NOT COALESCE((SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()), false) THEN
      NEW.is_admin := OLD.is_admin; -- Revert changes
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER tr_protect_profile_admin_flag
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_admin_flag();


-- Automatically handle product stock checks and decrements
CREATE OR REPLACE FUNCTION public.process_order_item_stock()
RETURNS TRIGGER AS $$
DECLARE
  v_stock INTEGER;
BEGIN
  -- If product_id is null or it is custom soap batch, skip stock decrement
  IF NEW.product_id IS NULL OR NEW.is_custom = true THEN
    RETURN NEW;
  END IF;

  -- Lock the product row and query stock to avoid race conditions
  SELECT stock INTO v_stock 
  FROM public.products 
  WHERE id = NEW.product_id 
  FOR UPDATE;
  
  IF v_stock IS NULL THEN
    RAISE EXCEPTION 'Product with ID % does not exist.', NEW.product_id;
  END IF;

  IF v_stock < NEW.quantity THEN
    RAISE EXCEPTION 'Insufficient stock for product ID %. Requested: %, Available: %', NEW.product_id, NEW.quantity, v_stock;
  END IF;

  -- Update catalog stock
  UPDATE public.products
  SET stock = stock - NEW.quantity
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER tr_process_order_item_stock
  BEFORE INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.process_order_item_stock();


-- Auto-calculate product rating and reviews count on new review
CREATE OR REPLACE FUNCTION public.update_product_reviews_aggregate()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.products
    SET rating = (SELECT ROUND(AVG(rating), 2) FROM public.reviews WHERE product_id = NEW.product_id),
        reviews_count = reviews_count + 1
    WHERE id = NEW.product_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.products
    SET rating = COALESCE((SELECT ROUND(AVG(rating), 2) FROM public.reviews WHERE product_id = OLD.product_id), 0.00),
        reviews_count = GREATEST(0, reviews_count - 1)
    WHERE id = OLD.product_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER tr_update_product_reviews_aggregate
  AFTER INSERT OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_reviews_aggregate();


-- Automatic timestamps trigger
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_products_modtime BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE OR REPLACE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE OR REPLACE TRIGGER update_cart_items_modtime BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE OR REPLACE TRIGGER update_addresses_modtime BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE OR REPLACE TRIGGER update_orders_modtime BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- RPC Function to safely cancel an order
CREATE OR REPLACE FUNCTION public.cancel_order(p_order_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_status TEXT;
  v_user_id UUID;
BEGIN
  SELECT order_status, user_id INTO v_status, v_user_id FROM public.orders WHERE order_id = p_order_id;
  
  IF v_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Order not found');
  END IF;
  
  IF v_user_id != auth.uid() AND NOT public.is_admin() THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized action');
  END IF;
  
  IF v_status != 'Pending' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Only orders in Pending status can be cancelled.');
  END IF;
  
  -- Restore stock when cancelled
  UPDATE public.products p
  SET stock = p.stock + oi.quantity
  FROM public.order_items oi
  WHERE oi.order_id = p_order_id 
    AND oi.product_id = p.id 
    AND oi.is_custom = false;
  
  -- Update order status
  UPDATE public.orders
  SET order_status = 'Cancelled', updated_at = now()
  WHERE order_id = p_order_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Order cancelled successfully and inventory restored.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC Function to execute checkout order and order items insert atomically
CREATE OR REPLACE FUNCTION public.place_order_transaction(
  p_payment_method TEXT,
  p_shipping_address JSONB,
  p_billing_address JSONB,
  p_subtotal NUMERIC,
  p_delivery_charge NUMERIC,
  p_discount NUMERIC,
  p_tax NUMERIC,
  p_total_amount NUMERIC,
  p_tracking_number TEXT,
  p_items JSONB
)
RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
BEGIN
  -- Insert order
  INSERT INTO public.orders (
    user_id, order_status, payment_status, payment_method, 
    shipping_address, billing_address, subtotal, delivery_charge, 
    discount, tax, total_amount, tracking_number
  ) VALUES (
    auth.uid(), 'Pending', 'Pending', p_payment_method,
    p_shipping_address, p_billing_address, p_subtotal, p_delivery_charge,
    p_discount, p_tax, p_total_amount, p_tracking_number
  ) RETURNING order_id INTO v_order_id;

  -- Insert order items (this will invoke the stock decrement trigger)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.order_items (
      order_id,
      product_id,
      is_custom,
      custom_details,
      quantity,
      price,
      total
    ) VALUES (
      v_order_id,
      CASE WHEN (v_item->>'product_id') IS NULL THEN NULL ELSE (v_item->>'product_id')::UUID END,
      COALESCE((v_item->>'is_custom')::BOOLEAN, false),
      v_item->'custom_details',
      (v_item->>'quantity')::INTEGER,
      (v_item->>'price')::NUMERIC,
      (v_item->>'total')::NUMERIC
    );
  END LOOP;

  -- Clear shopping cart for user
  DELETE FROM public.cart_items WHERE user_id = auth.uid();

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Products Policies
CREATE POLICY "Products: select anyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Products: admin manage" ON public.products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Profiles Policies
CREATE POLICY "Profiles: owner or admin select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Profiles: owner or admin update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Cart Items Policies
CREATE POLICY "Cart: owner or admin select" ON public.cart_items FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Cart: owner manage" ON public.cart_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Wishlist Policies
CREATE POLICY "Wishlist: owner select" ON public.wishlist FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Wishlist: owner manage" ON public.wishlist FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Addresses Policies
CREATE POLICY "Addresses: owner select" ON public.addresses FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Addresses: owner manage" ON public.addresses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Orders Policies
CREATE POLICY "Orders: owner or admin select" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Orders: owner insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Orders: admin manage" ON public.orders FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Orders: admin delete" ON public.orders FOR DELETE TO authenticated USING (public.is_admin());

-- Order Items Policies
CREATE POLICY "OrderItems: owner or admin select" ON public.order_items FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.order_id = order_items.order_id AND (o.user_id = auth.uid() OR public.is_admin())));
CREATE POLICY "OrderItems: owner insert" ON public.order_items FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.order_id = order_items.order_id AND o.user_id = auth.uid()));

-- Search History Policies
CREATE POLICY "SearchHistory: owner manage" ON public.search_history FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Recently Viewed Policies
CREATE POLICY "RecentlyViewed: owner manage" ON public.recently_viewed FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reviews Policies
CREATE POLICY "Reviews: public select" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Reviews: owner insert purchased" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND public.has_purchased_product(auth.uid(), product_id));
CREATE POLICY "Reviews: owner update" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Reviews: owner or admin delete" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- Notifications Policies
CREATE POLICY "Notifications: owner select" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Notifications: owner update" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id AND is_read = true); -- can only set to read
CREATE POLICY "Notifications: admin manage" ON public.notifications FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Coupons Policies
CREATE POLICY "Coupons: active select" ON public.coupons FOR SELECT USING (is_active = true AND expiry_date > now());
CREATE POLICY "Coupons: admin manage" ON public.coupons FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ==========================================================================
-- 5. STORAGE BUCKETS POLICIES ON storage.objects
-- ==========================================================================

-- Products Bucket Policies (Public read, admin write)
CREATE POLICY "Products storage: public read" ON storage.objects FOR SELECT USING (bucket_id = 'products');
CREATE POLICY "Products storage: admin write" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'products' AND public.is_admin()) WITH CHECK (bucket_id = 'products' AND public.is_admin());

-- Profiles Bucket Policies (Public read, owner write structure: profiles/{user_id}/...)
CREATE POLICY "Profiles storage: public read" ON storage.objects FOR SELECT USING (bucket_id = 'profiles');
CREATE POLICY "Profiles storage: owner write" ON storage.objects FOR ALL TO authenticated 
  USING (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text) 
  WITH CHECK (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Reviews Bucket Policies (Public read, authenticated user write structure: reviews/{user_id}/...)
CREATE POLICY "Reviews storage: public read" ON storage.objects FOR SELECT USING (bucket_id = 'reviews');
CREATE POLICY "Reviews storage: auth user write" ON storage.objects FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'reviews' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Reviews storage: owner edit delete" ON storage.objects FOR ALL TO authenticated 
  USING (bucket_id = 'reviews' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Banners Bucket Policies (Public read, admin write)
CREATE POLICY "Banners storage: public read" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "Banners storage: admin write" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'banners' AND public.is_admin()) WITH CHECK (bucket_id = 'banners' AND public.is_admin());
