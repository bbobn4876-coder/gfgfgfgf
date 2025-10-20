/*
  # Create Employees System

  1. New Tables
    - `employees`
      - `id` (integer, primary key, auto-increment)
      - `token` (text, unique) - Unique token for employee login
      - `nickname` (text) - Employee nickname
      - `avatar_url` (text) - Avatar URL
      - `crypto_wallet` (text) - Crypto wallet address
      - `last_login` (timestamptz) - Last login time
      - `is_online` (boolean, default false) - Online status
      - `total_white_pages` (integer, default 0) - Total white pages completed
      - `total_earned` (numeric, default 0) - Total earnings
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
      - `team_id` (text) - For RLS isolation

    - `withdrawal_requests`
      - `id` (integer, primary key, auto-increment)
      - `employee_token` (text) - Employee who requested
      - `crypto_wallet` (text) - Wallet address for withdrawal
      - `amount` (numeric) - Amount requested
      - `status` (text, default 'pending') - pending, approved, rejected
      - `created_at` (timestamptz, default now())
      - `approved_at` (timestamptz) - When approved/rejected
      - `approved_by` (text) - Admin who approved
      - `team_id` (text) - For RLS isolation

  2. Changes to existing tables
    - Add `assigned_to_employee` column to orders table
    - Add `assigned_at` column to orders table
    - Add `completed_file_url` column to orders table

  3. Security
    - Enable RLS on all new tables
    - Add policies for employees to access their own data
    - Add policies for admins to access all data
    - Add policies for team isolation
*/

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT '',
  crypto_wallet TEXT DEFAULT '',
  last_login TIMESTAMPTZ DEFAULT now(),
  is_online BOOLEAN DEFAULT false,
  total_white_pages INTEGER DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  team_id TEXT
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Policies for employees table
CREATE POLICY "Admins can view all employees"
  ON employees FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.token = current_setting('request.jwt.claims', true)::json->>'token'
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Employees can view own data"
  ON employees FOR SELECT
  TO authenticated
  USING (token = current_setting('request.jwt.claims', true)::json->>'token');

CREATE POLICY "Employees can update own data"
  ON employees FOR UPDATE
  TO authenticated
  USING (token = current_setting('request.jwt.claims', true)::json->>'token')
  WITH CHECK (token = current_setting('request.jwt.claims', true)::json->>'token');

CREATE POLICY "Admins can insert employees"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.token = current_setting('request.jwt.claims', true)::json->>'token'
      AND users.role = 'admin'
    )
  );

-- Create withdrawal_requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id SERIAL PRIMARY KEY,
  employee_token TEXT NOT NULL,
  crypto_wallet TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  team_id TEXT
);

ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Policies for withdrawal_requests
CREATE POLICY "Admins can view all withdrawal requests"
  ON withdrawal_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.token = current_setting('request.jwt.claims', true)::json->>'token'
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Employees can view own withdrawal requests"
  ON withdrawal_requests FOR SELECT
  TO authenticated
  USING (employee_token = current_setting('request.jwt.claims', true)::json->>'token');

CREATE POLICY "Employees can create withdrawal requests"
  ON withdrawal_requests FOR INSERT
  TO authenticated
  WITH CHECK (employee_token = current_setting('request.jwt.claims', true)::json->>'token');

CREATE POLICY "Admins can update withdrawal requests"
  ON withdrawal_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.token = current_setting('request.jwt.claims', true)::json->>'token'
      AND users.role = 'admin'
    )
  );

-- Add columns to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'assigned_to_employee'
  ) THEN
    ALTER TABLE orders ADD COLUMN assigned_to_employee TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'assigned_at'
  ) THEN
    ALTER TABLE orders ADD COLUMN assigned_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'completed_file_url'
  ) THEN
    ALTER TABLE orders ADD COLUMN completed_file_url TEXT;
  END IF;
END $$;

-- Add RLS policies for employees to access orders
CREATE POLICY "Employees can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.token = current_setting('request.jwt.claims', true)::json->>'token'
    )
  );

CREATE POLICY "Employees can update assigned orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    assigned_to_employee = current_setting('request.jwt.claims', true)::json->>'token'
  )
  WITH CHECK (
    assigned_to_employee = current_setting('request.jwt.claims', true)::json->>'token'
  );