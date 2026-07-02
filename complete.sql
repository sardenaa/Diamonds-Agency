-- ==========================================
-- MAS AGENCY ENTERPRISE RELATIONAL SCHEMA
-- Platform Target: PostgreSQL 15+ (Enterprise Grade)
-- Designed for: Multi-country, Multi-currency, Multi-company, Offline-first & Real-time Sync
-- Primary Keys: BIGINT (Internal/Performance) + UUID v4 (Public/Distributed API security)
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. IDENTITY, ACCESS CONTROL & AUDITING
-- ==========================================

CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    registration_number VARCHAR(100),
    tax_identifier VARCHAR(100),
    domain VARCHAR(255) UNIQUE,
    logo_url TEXT,
    primary_email VARCHAR(255) NOT NULL,
    primary_phone VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'onboarding')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_companies_status ON companies(status);

CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    company_id BIGINT REFERENCES companies(id),
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (company_id, code)
);

CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    module VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_permissions_module ON permissions(module);

CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    company_id BIGINT REFERENCES companies(id),
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'archived')),
    email_verified_at TIMESTAMP WITH TIME ZONE,
    phone_verified_at TIMESTAMP WITH TIME ZONE,
    mfa_secret VARCHAR(255),
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (company_id, email)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE user_sessions (
    id BIGSERIAL PRIMARY KEY,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_fingerprint VARCHAR(255),
    device_type VARCHAR(50) NOT NULL,
    operating_system VARCHAR(100),
    browser VARCHAR(100),
    ip_address VARCHAR(45) NOT NULL,
    payload JSONB,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_expires_at ON user_sessions(expires_at);

CREATE TABLE api_keys (
    id BIGSERIAL PRIMARY KEY,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    scopes JSONB NOT NULL DEFAULT '[]',
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE oauth_accounts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(100) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token_hash TEXT,
    refresh_token_hash TEXT,
    scopes TEXT[],
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (provider, provider_user_id)
);

CREATE TABLE system_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT REFERENCES companies(id),
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id BIGINT,
    before_value JSONB,
    after_value JSONB,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_entity ON system_audit_logs(entity_name, entity_id);
CREATE INDEX idx_audit_logs_created_at ON system_audit_logs(created_at);

-- ==========================================
-- 2. CUSTOMERS & LOYALTY
-- ==========================================

CREATE TABLE customer_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    nationality_code CHAR(2) NOT NULL, -- ISO 3166-1 alpha-2
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
    date_of_birth DATE,
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    passport_number VARCHAR(100),
    passport_expiry DATE,
    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(50),
    marketing_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
    whatsapp_opt_in BOOLEAN NOT NULL DEFAULT TRUE,
    lifetime_value NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    tags VARCHAR(50)[],
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customer_nationality ON customer_profiles(nationality_code);
CREATE INDEX idx_customer_tags ON customer_profiles USING gin(tags);

CREATE TABLE traveler_profiles (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50), -- e.g., spouse, child, friend
    date_of_birth DATE,
    nationality_code CHAR(2),
    passport_number VARCHAR(100),
    passport_expiry DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE loyalty_accounts (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE UNIQUE,
    membership_tier VARCHAR(50) NOT NULL DEFAULT 'classic' CHECK (membership_tier IN ('classic', 'silver', 'gold', 'sovereign_diamond')),
    accrued_points INT NOT NULL DEFAULT 0,
    lifetime_points INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE loyalty_transactions (
    id BIGSERIAL PRIMARY KEY,
    loyalty_account_id BIGINT NOT NULL REFERENCES loyalty_accounts(id) ON DELETE CASCADE,
    points_delta INT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('accrual', 'redemption', 'expiry', 'bonus')),
    description TEXT,
    booking_id_reference BIGINT, -- Linked to booking if applicable
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_loyalty_tx_account ON loyalty_transactions(loyalty_account_id);

CREATE TABLE customer_wishlists (
    customer_id BIGINT NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    tour_id_reference BIGINT NOT NULL, -- Validated in application or via generic reference
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (customer_id, tour_id_reference)
);

-- ==========================================
-- 3. STAFF, ROSTERS & LOGISTICS
-- ==========================================

CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE employees (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    job_title VARCHAR(150) NOT NULL,
    hire_date DATE NOT NULL,
    termination_date DATE,
    hourly_rate NUMERIC(10, 2),
    payroll_identifier VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'suspended', 'terminated')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE driver_profiles (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE UNIQUE,
    license_number VARCHAR(100) NOT NULL,
    license_expiry DATE NOT NULL,
    assigned_vehicle_id_ref BIGINT, -- Checked in application
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE guide_profiles (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE UNIQUE,
    license_number VARCHAR(100) NOT NULL,
    license_expiry DATE NOT NULL,
    languages_spoken VARCHAR(10)[] NOT NULL, -- array of ISO codes
    specialties VARCHAR(100)[],
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guides_languages ON guide_profiles USING gin(languages_spoken);

CREATE TABLE rosters (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    roster_type VARCHAR(50) NOT NULL CHECK (roster_type IN ('shift', 'tour_assignment', 'on_call', 'off')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CHECK (end_time > start_time)
);

CREATE INDEX idx_rosters_time ON rosters(start_time, end_time);

-- ==========================================
-- 4. GEOGRAPHIC ENTITIES & HOTELS
-- ==========================================

CREATE TABLE countries (
    id BIGSERIAL PRIMARY KEY,
    iso_code CHAR(2) NOT NULL UNIQUE, -- ISO-3166-1 alpha-2
    name_translations JSONB NOT NULL, -- e.g., {"en": "Egypt", "ar": "مصر"}
    phone_prefix VARCHAR(10) NOT NULL,
    currency_code CHAR(3) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE locations (
    id BIGSERIAL PRIMARY KEY,
    country_code CHAR(2) NOT NULL REFERENCES countries(iso_code),
    name_translations JSONB NOT NULL, -- e.g., {"en": "Hurghada", "ar": "الغردقة"}
    slug VARCHAR(150) NOT NULL,
    latitude NUMERIC(9, 6) NOT NULL,
    longitude NUMERIC(9, 6) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (country_code, slug)
);

CREATE INDEX idx_locations_slug ON locations(slug);

CREATE TABLE pickup_zones (
    id BIGSERIAL PRIMARY KEY,
    location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    name_translations JSONB NOT NULL,
    bounding_polygon TEXT, -- Geo-fenced polygon
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE hotel_brands (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE hotels (
    id BIGSERIAL PRIMARY KEY,
    brand_id BIGINT REFERENCES hotel_brands(id) ON DELETE SET NULL,
    location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    pickup_zone_id BIGINT REFERENCES pickup_zones(id) ON DELETE SET NULL,
    name_translations JSONB NOT NULL, -- e.g., {"en": "Four Seasons Nile Plaza", "ar": "فور سيزونز نايل بلازا"}
    star_rating NUMERIC(2, 1) CHECK (star_rating >= 1.0 AND star_rating <= 5.0),
    address TEXT,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    transfer_pricing_extra NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hotels_rating ON hotels(star_rating);

-- ==========================================
-- 5. CATALOC & TOURS (MULTI-LANGUAGE DESIGN)
-- ==========================================

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    name_translations JSONB NOT NULL, -- {"en": "Island Trips", "ar": "رحلات الجزر"}
    description_translations JSONB,
    icon_class VARCHAR(100),
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE tours (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    primary_location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    slug VARCHAR(255) NOT NULL,
    title_translations JSONB NOT NULL, -- {"en": "Orange Bay Royal Cruise", "ar": "رحلة أورنج باي الملكية"}
    short_desc_translations JSONB NOT NULL,
    long_desc_translations JSONB NOT NULL,
    duration_minutes INT NOT NULL,
    difficulty_level VARCHAR(50) NOT NULL CHECK (difficulty_level IN ('easy', 'moderate', 'challenging', 'extreme')),
    minimum_age INT NOT NULL DEFAULT 0,
    languages_supported VARCHAR(10)[] NOT NULL,
    featured_status BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    seo_metadata_translations JSONB,
    rating_cache NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    reviews_count INT NOT NULL DEFAULT 0,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (company_id, slug)
);

CREATE INDEX idx_tours_slug ON tours(slug);
CREATE INDEX idx_tours_published ON tours(is_published) WHERE is_published = TRUE;

CREATE TABLE tour_medias (
    id BIGSERIAL PRIMARY KEY,
    tour_id BIGINT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(50) NOT NULL CHECK (media_type IN ('image', 'video', 'drone_footage', 'vr_360')),
    display_order INT NOT NULL DEFAULT 0,
    caption_translations JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE tour_itineraries (
    id BIGSERIAL PRIMARY KEY,
    tour_id BIGINT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    duration_minutes INT,
    title_translations JSONB NOT NULL,
    description_translations JSONB NOT NULL,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (tour_id, step_number)
);

CREATE TABLE tour_faqs (
    id BIGSERIAL PRIMARY KEY,
    tour_id BIGINT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    question_translations JSONB NOT NULL,
    answer_translations JSONB NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE tour_rules_policies (
    id BIGSERIAL PRIMARY KEY,
    tour_id BIGINT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    included_items_translations JSONB NOT NULL, -- {"en": ["Snorkeling gear", "Lobster Lunch"], "ar": [...]}
    excluded_items_translations JSONB NOT NULL,
    requirements_translations JSONB,
    cancellation_policy_translations JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 6. PRICING, COMMISSIONS & DYNAMIC RULES
-- ==========================================

CREATE TABLE currencies (
    code CHAR(3) PRIMARY KEY, -- USD, EUR, EGP, GBP
    symbol VARCHAR(10) NOT NULL,
    exchange_rate_to_usd NUMERIC(12, 6) NOT NULL DEFAULT 1.000000,
    decimal_digits INT NOT NULL DEFAULT 2,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE tour_base_prices (
    id BIGSERIAL PRIMARY KEY,
    tour_id BIGINT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    currency_code CHAR(3) NOT NULL REFERENCES currencies(code),
    adult_price NUMERIC(15, 4) NOT NULL,
    child_price NUMERIC(15, 4) NOT NULL,
    infant_price NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    senior_price NUMERIC(15, 4) NOT NULL,
    private_yacht_base_price NUMERIC(15, 4), -- Optional private base charter pricing
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (tour_id, currency_code)
);

CREATE TABLE pricing_seasonal_schedules (
    id BIGSERIAL PRIMARY KEY,
    tour_id BIGINT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    multiplier NUMERIC(5, 4) NOT NULL DEFAULT 1.0000, -- e.g., 1.25 for high season Christmas rates
    priority INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CHECK (end_date >= start_date)
);

CREATE INDEX idx_pricing_seasonal ON pricing_seasonal_schedules(start_date, end_date);

-- ==========================================
-- 7. THE BOOKING PIPELINE
-- ==========================================

CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id BIGINT NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    tour_id BIGINT NOT NULL REFERENCES tours(id) ON DELETE RESTRICT,
    scheduled_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'awaiting_payment', 'confirmed', 'assigned', 'pickup_scheduled', 'in_progress', 'completed', 'cancelled', 'refund_requested', 'refunded')),
    original_currency CHAR(3) NOT NULL REFERENCES currencies(code),
    total_amount_original NUMERIC(15, 4) NOT NULL,
    total_amount_usd NUMERIC(15, 4) NOT NULL,
    pickup_hotel_id BIGINT REFERENCES hotels(id) ON DELETE SET NULL,
    custom_pickup_location TEXT,
    pickup_time_scheduled TIME,
    assigned_guide_id BIGINT REFERENCES guide_profiles(id) ON DELETE SET NULL,
    qr_code_secure_hash VARCHAR(255) UNIQUE,
    checkout_completed_at TIMESTAMP WITH TIME ZONE,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(scheduled_date);

CREATE TABLE booking_travelers (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    traveler_type VARCHAR(50) NOT NULL CHECK (traveler_type IN ('adult', 'child', 'infant', 'senior')),
    passport_number VARCHAR(100),
    nationality_code CHAR(2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE booking_extras_catalog (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name_translations JSONB NOT NULL, -- {"en": "Private Photographer", "ar": "مصور خاص"}
    price_per_person_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE booking_extras_purchased (
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    extra_id BIGINT NOT NULL REFERENCES booking_extras_catalog(id) ON DELETE RESTRICT,
    quantity INT NOT NULL DEFAULT 1,
    unit_price_usd NUMERIC(10, 2) NOT NULL,
    PRIMARY KEY (booking_id, extra_id)
);

CREATE TABLE booking_status_history (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 8. TRANSACTIONAL GATEWAYS & ACCOUNTING
-- ==========================================

CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal_usd NUMERIC(15, 4) NOT NULL,
    discount_usd NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    taxes_usd NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    total_amount_usd NUMERIC(15, 4) NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partially_paid', 'paid', 'void', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_status ON invoices(payment_status);

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('stripe', 'paypal', 'visa', 'mastercard', 'google_pay', 'apple_pay', 'paymob', 'fawry', 'vodafone_cash', 'cash_pickup', 'bank_transfer')),
    transaction_reference VARCHAR(255) UNIQUE,
    original_currency CHAR(3) NOT NULL REFERENCES currencies(code),
    amount_original NUMERIC(15, 4) NOT NULL,
    amount_usd NUMERIC(15, 4) NOT NULL,
    gateway_fee_usd NUMERIC(10, 4) NOT NULL DEFAULT 0.0000,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'captured', 'failed', 'refunded', 'disputed')),
    gateway_response JSONB,
    idempotency_key VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_status ON payments(status);

CREATE TABLE payment_refunds (
    id BIGSERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
    amount_usd NUMERIC(15, 4) NOT NULL,
    reason TEXT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    gateway_refund_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 9. FLEET & LOGISTICS (BOATS & CARS)
-- ==========================================

CREATE TABLE vehicle_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g., Mercedes V-Class Executive
    seating_capacity INT NOT NULL,
    baggage_capacity_bags INT NOT NULL,
    is_luxury BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE vehicles (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    vehicle_type_id BIGINT NOT NULL REFERENCES vehicle_types(id) ON DELETE RESTRICT,
    license_plate VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(50),
    model_year INT,
    status VARCHAR(50) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'dispatched', 'maintenance', 'out_of_service')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE boat_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g., Private Sovereignty Sunseeker 75
    capacity_passengers INT NOT NULL,
    luxury_level VARCHAR(50) CHECK (luxury_level IN ('standard', 'vip_yacht', 'royal_sovereign'))
);

CREATE TABLE boats (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    boat_type_id BIGINT NOT NULL REFERENCES boat_types(id) ON DELETE RESTRICT,
    boat_name VARCHAR(150) NOT NULL,
    registration_code VARCHAR(100) NOT NULL UNIQUE,
    harbor_base VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'docked' CHECK (status IN ('docked', 'chartered', 'maintenance', 'out_of_service')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE logistical_assignments (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    vehicle_id BIGINT REFERENCES vehicles(id) ON DELETE SET NULL,
    driver_id BIGINT REFERENCES driver_profiles(id) ON DELETE SET NULL,
    boat_id BIGINT REFERENCES boats(id) ON DELETE SET NULL,
    assigned_role VARCHAR(100) NOT NULL DEFAULT 'primary',
    status VARCHAR(50) NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'completed', 'aborted')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assignments_booking ON logistical_assignments(booking_id);

-- ==========================================
-- 10. MARKETING, CRM & COUPON ENGINE
-- ==========================================

CREATE TABLE customer_segments (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    query_criteria JSONB NOT NULL, -- dynamic segment definition rules
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type VARCHAR(50) NOT NULL CHECK (discount_type IN ('percentage', 'flat_rate_usd')),
    value_usd NUMERIC(10, 2) NOT NULL,
    minimum_booking_amount_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    usage_limit INT, -- NULL means unlimited
    times_used INT NOT NULL DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CHECK (end_date >= start_date)
);

CREATE TABLE coupon_usage_history (
    id BIGSERIAL PRIMARY KEY,
    coupon_id BIGINT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id BIGINT NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    discount_applied_usd NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE crm_interaction_timeline (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    interaction_type VARCHAR(100) NOT NULL CHECK (interaction_type IN ('email', 'sms', 'whatsapp', 'call', 'face_to_face', 'system_event')),
    subject VARCHAR(255) NOT NULL,
    details TEXT,
    staff_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_crm_customer_timeline ON crm_interaction_timeline(customer_id, created_at DESC);

-- ==========================================
-- 11. CUSTOMER REVIEWS & MODERATION
-- ==========================================

CREATE TABLE tour_reviews (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    booking_id BIGINT REFERENCES bookings(id) ON DELETE SET NULL, -- Can review even if booking is completed
    tour_id BIGINT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    customer_id BIGINT NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    rating_score INT NOT NULL CHECK (rating_score >= 1 AND rating_score <= 5),
    comment TEXT,
    is_verified_booking BOOLEAN NOT NULL DEFAULT FALSE,
    moderation_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    moderated_by_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_tour ON tour_reviews(tour_id, rating_score);
CREATE INDEX idx_reviews_moderation ON tour_reviews(moderation_status) WHERE moderation_status = 'approved';

CREATE TABLE tour_review_medias (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL REFERENCES tour_reviews(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(50) NOT NULL CHECK (media_type IN ('image', 'video')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 12. AUTOMATION, WORKFLOWS & NOTIFICATIONS
-- ==========================================

CREATE TABLE automation_workflows (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    trigger_event VARCHAR(100) NOT NULL, -- e.g., 'booking.created'
    conditions JSONB, -- conditions to match
    actions JSONB NOT NULL, -- list of action payloads
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE notification_templates (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL UNIQUE,
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp', 'push', 'in_app')),
    subject_translations JSONB,
    body_translations JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications_outbox (
    id BIGSERIAL PRIMARY KEY,
    recipient_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    recipient_address VARCHAR(255) NOT NULL, -- phone, email, device token
    channel VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    body TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'retry')),
    retry_count INT NOT NULL DEFAULT 0,
    error_log TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_outbox_scheduled ON notifications_outbox(scheduled_for, status) WHERE status = 'pending';

-- ==========================================
-- 13. CONTENT MANAGEMENT (CMS) & BLOG
-- ==========================================

CREATE TABLE blog_articles (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID NOT NULL DEFAULT uuid_generate_v4() UNIQUE,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    author_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    slug VARCHAR(255) NOT NULL,
    title_translations JSONB NOT NULL,
    content_translations JSONB NOT NULL,
    featured_image_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    seo_metadata_translations JSONB,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (company_id, slug)
);

CREATE INDEX idx_blog_published_slug ON blog_articles(status, slug) WHERE status = 'published';

-- ==========================================
-- 14. MEDIA LIBRARY SYSTEM
-- ==========================================

CREATE TABLE media_folders (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    parent_id BIGINT REFERENCES media_folders(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (company_id, name, parent_id)
);

CREATE TABLE media_assets (
    id BIGSERIAL PRIMARY KEY,
    folder_id BIGINT REFERENCES media_folders(id) ON DELETE CASCADE,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    width INT,
    height INT,
    optimization_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 15. COGNITIVE AI CONCIERGE & RECOMMENDATIONS
-- ==========================================

CREATE TABLE ai_conversations (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customer_profiles(id) ON DELETE CASCADE,
    session_identifier VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE ai_messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    structured_data JSONB, -- Contains generated itineraries, pricing quotes
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_messages_conv ON ai_messages(conversation_id);

-- ==========================================
-- 16. ANALYTICS & BUSINESS INTELLIGENCE
-- ==========================================

CREATE TABLE bi_daily_financial_metrics (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    total_revenue_usd NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    gross_profit_usd NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    bookings_count INT NOT NULL DEFAULT 0,
    completed_bookings_count INT NOT NULL DEFAULT 0,
    cancellations_count INT NOT NULL DEFAULT 0,
    refunds_issued_usd NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    coupon_discounts_applied_usd NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (company_id, metric_date)
);

CREATE INDEX idx_bi_daily_metrics ON bi_daily_financial_metrics(metric_date);

CREATE TABLE bi_tour_performance_metrics (
    id BIGSERIAL PRIMARY KEY,
    tour_id BIGINT NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
    metric_month DATE NOT NULL, -- First day of month
    tickets_sold INT NOT NULL DEFAULT 0,
    revenue_generated_usd NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    average_review_rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    conversion_rate NUMERIC(5, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (tour_id, metric_month)
);

-- ==========================================
-- DB REPLICATION, RETENTION & SECURITY VIEWS
-- ==========================================

-- View for GDPR-compliant Customer Profiles
CREATE VIEW view_safe_customer_profiles AS
SELECT 
    cp.id,
    cp.user_id,
    cp.nationality_code,
    cp.preferred_language,
    MD5(cp.passport_number) AS masked_passport,
    cp.lifetime_value,
    cp.tags,
    cp.created_at
FROM customer_profiles cp;
