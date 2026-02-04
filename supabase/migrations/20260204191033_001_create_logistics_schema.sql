/*
  # Create Logistics Platform Schema

  ## Overview
  This migration sets up the complete database structure for a logistics platform connecting 
  truck owners with shippers. The schema includes user management, truck inventory, shipment 
  requests, and transaction tracking.

  ## New Tables
  1. **users** - User accounts with roles (shipper/driver)
  2. **user_profiles** - Extended user information
  3. **trucks** - Truck inventory for owners
  4. **truck_availability** - Track truck availability status
  5. **shipment_requests** - Shipment requests from shippers
  6. **shipment_bids** - Bids from truck owners
  7. **transactions** - Track all shipment transactions
  8. **admin_users** - Administrative users with special permissions

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies restrict users to their own data
  - Admin access for dashboard operations
*/

-- Create users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'shipper' CHECK (role IN ('shipper', 'driver', 'admin')),
  phone_number TEXT NOT NULL,
  city TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user profiles for extended information
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  rating DECIMAL(3, 2) DEFAULT 5.0,
  total_transactions INTEGER DEFAULT 0,
  bio TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create trucks table
CREATE TABLE IF NOT EXISTS trucks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plate_number TEXT NOT NULL UNIQUE,
  truck_type TEXT NOT NULL CHECK (truck_type IN ('flatbed', 'refrigerated', 'container', 'tanker', 'pickup')),
  capacity_kg DECIMAL(10, 2) NOT NULL,
  capacity_m3 DECIMAL(10, 2),
  year_manufactured INTEGER NOT NULL,
  documents_verified BOOLEAN DEFAULT false,
  insurance_expiry DATE,
  location_lat DECIMAL(10, 6),
  location_lng DECIMAL(10, 6),
  current_city TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create truck availability tracking
CREATE TABLE IF NOT EXISTS truck_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id UUID NOT NULL REFERENCES trucks(id) ON DELETE CASCADE UNIQUE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'busy', 'maintenance', 'offline')),
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  current_load_kg DECIMAL(10, 2) DEFAULT 0,
  current_location_lat DECIMAL(10, 6),
  current_location_lng DECIMAL(10, 6),
  last_updated TIMESTAMPTZ DEFAULT now()
);

-- Create shipment requests from shippers
CREATE TABLE IF NOT EXISTS shipment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipper_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pickup_location TEXT NOT NULL,
  pickup_lat DECIMAL(10, 6),
  pickup_lng DECIMAL(10, 6),
  delivery_location TEXT NOT NULL,
  delivery_lat DECIMAL(10, 6),
  delivery_lng DECIMAL(10, 6),
  goods_description TEXT NOT NULL,
  weight_kg DECIMAL(10, 2) NOT NULL,
  volume_m3 DECIMAL(10, 2),
  required_truck_type TEXT,
  budget_amount DECIMAL(12, 2),
  pickup_date DATE NOT NULL,
  delivery_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_transit', 'delivered', 'cancelled')),
  special_requirements TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create bids from truck owners
CREATE TABLE IF NOT EXISTS shipment_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipment_requests(id) ON DELETE CASCADE,
  truck_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  truck_id UUID NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
  bid_amount DECIMAL(12, 2) NOT NULL,
  estimated_pickup_time TIMESTAMPTZ,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipment_requests(id) ON DELETE CASCADE,
  shipper_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  truck_id UUID NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'disputed')),
  payment_method TEXT,
  pickup_time TIMESTAMPTZ,
  delivery_time TIMESTAMPTZ,
  rating_by_shipper DECIMAL(3, 2),
  rating_by_driver DECIMAL(3, 2),
  notes_by_shipper TEXT,
  notes_by_driver TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  permissions JSONB DEFAULT '{"view_all": true, "manage_users": true, "manage_shipments": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE truck_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- User profiles policies
CREATE POLICY "Anyone can read public profiles"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Trucks policies
CREATE POLICY "Truck owners can read own trucks"
  ON trucks FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Shippers can view all active trucks"
  ON trucks FOR SELECT
  TO authenticated
  USING (
    active = true AND
    (EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'shipper'
    ))
  );

CREATE POLICY "Truck owners can insert trucks"
  ON trucks FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'driver'
    )
  );

CREATE POLICY "Truck owners can update own trucks"
  ON trucks FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Truck availability policies
CREATE POLICY "Truck owners can read own availability"
  ON truck_availability FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trucks
      WHERE trucks.id = truck_id AND trucks.owner_id = auth.uid()
    )
  );

CREATE POLICY "Shippers can view available trucks"
  ON truck_availability FOR SELECT
  TO authenticated
  USING (
    status = 'available' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'shipper'
    )
  );

CREATE POLICY "Truck owners can update own availability"
  ON truck_availability FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trucks
      WHERE trucks.id = truck_id AND trucks.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trucks
      WHERE trucks.id = truck_id AND trucks.owner_id = auth.uid()
    )
  );

-- Shipment requests policies
CREATE POLICY "Shippers can read own requests"
  ON shipment_requests FOR SELECT
  TO authenticated
  USING (shipper_id = auth.uid());

CREATE POLICY "Drivers can view open requests"
  ON shipment_requests FOR SELECT
  TO authenticated
  USING (
    status = 'open' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'driver'
    )
  );

CREATE POLICY "Shippers can insert requests"
  ON shipment_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    shipper_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'shipper'
    )
  );

CREATE POLICY "Shippers can update own requests"
  ON shipment_requests FOR UPDATE
  TO authenticated
  USING (shipper_id = auth.uid())
  WITH CHECK (shipper_id = auth.uid());

-- Bids policies
CREATE POLICY "Drivers can read own bids"
  ON shipment_bids FOR SELECT
  TO authenticated
  USING (truck_owner_id = auth.uid());

CREATE POLICY "Shippers can read bids on own requests"
  ON shipment_bids FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shipment_requests
      WHERE shipment_requests.id = shipment_id AND shipment_requests.shipper_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can insert bids"
  ON shipment_bids FOR INSERT
  TO authenticated
  WITH CHECK (
    truck_owner_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'driver'
    )
  );

-- Transactions policies
CREATE POLICY "Users can read own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (shipper_id = auth.uid() OR driver_id = auth.uid());

CREATE POLICY "Admins can read all transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Admin users policies
CREATE POLICY "Only admins can read admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_trucks_owner_id ON trucks(owner_id);
CREATE INDEX IF NOT EXISTS idx_trucks_active ON trucks(active);
CREATE INDEX IF NOT EXISTS idx_truck_availability_status ON truck_availability(status);
CREATE INDEX IF NOT EXISTS idx_shipment_requests_shipper_id ON shipment_requests(shipper_id);
CREATE INDEX IF NOT EXISTS idx_shipment_requests_status ON shipment_requests(status);
CREATE INDEX IF NOT EXISTS idx_shipment_bids_shipment_id ON shipment_bids(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_bids_truck_owner_id ON shipment_bids(truck_owner_id);
CREATE INDEX IF NOT EXISTS idx_transactions_shipment_id ON transactions(shipment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
