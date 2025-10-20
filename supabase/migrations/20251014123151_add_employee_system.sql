/*
  # Employee System

  1. New Tables
    - `employee_invitations`
      - `id` (uuid, primary key)
      - `team_id` (uuid, foreign key to users)
      - `invitation_token` (text, unique)
      - `created_at` (timestamptz)
      - `used` (boolean)
      - `used_by` (uuid, nullable, foreign key to users)
      - `used_at` (timestamptz, nullable)
    
    - `employee_profiles`
      - `id` (uuid, primary key, foreign key to users)
      - `team_id` (uuid, foreign key to users)
      - `avatar_url` (text, nullable)
      - `access_token` (text, unique)
      - `crypto_wallet` (text, nullable)
      - `total_earnings` (numeric, default 0)
      - `last_seen_at` (timestamptz, nullable)
      - `is_online` (boolean, default false)
      - `created_at` (timestamptz)

    - `employee_withdrawal_requests`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key to users)
      - `team_id` (uuid, foreign key to users)
      - `amount` (numeric)
      - `crypto_wallet` (text)
      - `status` (text: pending, approved, rejected)
      - `requested_at` (timestamptz)
      - `processed_at` (timestamptz, nullable)
      - `processed_by` (uuid, nullable, foreign key to users)

  2. Security
    - Enable RLS on all tables
    - Admin can create invitations and manage employees
    - Employees can view their own data
    - Employees can create withdrawal requests
*/

-- Employee Invitations Table
CREATE TABLE IF NOT EXISTS employee_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitation_token text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  used boolean DEFAULT false,
  used_by uuid REFERENCES users(id) ON DELETE SET NULL,
  used_at timestamptz
);

ALTER TABLE employee_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage their employee invitations"
  ON employee_invitations FOR ALL
  TO authenticated
  USING (team_id = auth.uid());

CREATE POLICY "Anyone can view unused invitations for registration"
  ON employee_invitations FOR SELECT
  TO authenticated
  USING (NOT used);

-- Employee Profiles Table
CREATE TABLE IF NOT EXISTS employee_profiles (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  avatar_url text,
  access_token text UNIQUE NOT NULL,
  crypto_wallet text,
  total_earnings numeric DEFAULT 0,
  last_seen_at timestamptz,
  is_online boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view their employees"
  ON employee_profiles FOR SELECT
  TO authenticated
  USING (team_id = auth.uid());

CREATE POLICY "Admins can update their employees"
  ON employee_profiles FOR UPDATE
  TO authenticated
  USING (team_id = auth.uid())
  WITH CHECK (team_id = auth.uid());

CREATE POLICY "Employees can view their own profile"
  ON employee_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Employees can update their own profile"
  ON employee_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Employee Withdrawal Requests Table
CREATE TABLE IF NOT EXISTS employee_withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  crypto_wallet text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  processed_by uuid REFERENCES users(id) ON DELETE SET NULL
);

ALTER TABLE employee_withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can create their withdrawal requests"
  ON employee_withdrawal_requests FOR INSERT
  TO authenticated
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can view their withdrawal requests"
  ON employee_withdrawal_requests FOR SELECT
  TO authenticated
  USING (employee_id = auth.uid());

CREATE POLICY "Admins can view their employees' withdrawal requests"
  ON employee_withdrawal_requests FOR SELECT
  TO authenticated
  USING (team_id = auth.uid());

CREATE POLICY "Admins can update their employees' withdrawal requests"
  ON employee_withdrawal_requests FOR UPDATE
  TO authenticated
  USING (team_id = auth.uid())
  WITH CHECK (team_id = auth.uid());

-- Add employee role to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users ADD COLUMN role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'employee'));
  END IF;
END $$;

-- Function to generate unique employee access token
CREATE OR REPLACE FUNCTION generate_employee_token()
RETURNS text AS $$
DECLARE
  token text;
  exists boolean;
BEGIN
  LOOP
    token := encode(gen_random_bytes(16), 'hex');
    SELECT EXISTS(SELECT 1 FROM employee_profiles WHERE access_token = token) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN token;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS text AS $$
DECLARE
  token text;
  exists boolean;
BEGIN
  LOOP
    token := encode(gen_random_bytes(16), 'hex');
    SELECT EXISTS(SELECT 1 FROM employee_invitations WHERE invitation_token = token) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN token;
END;
$$ LANGUAGE plpgsql;