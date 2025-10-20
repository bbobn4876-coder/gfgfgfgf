/*
  # Create Users and Orders Tables

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `token` (text, unique) - User's authentication token
      - `name` (text) - User's display name
      - `nickname` (text) - User's nickname
      - `parent_token` (text, nullable) - Reference to team leader's token
      - `role` (text) - User role (admin, team-leader, team-member)
      - `ip` (text) - User's IP address
      - `avatar` (text, nullable) - Avatar URL
      - `tokens_added` (numeric) - Total tokens added
      - `tokens_spent` (numeric) - Total tokens spent
      - `is_online` (boolean) - Online status
      - `last_login` (timestamptz) - Last login time
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `orders`
      - `id` (integer, primary key, auto-increment)
      - `name` (text) - Order name
      - `status` (text) - Order status (progress, completed)
      - `created_by_token` (text) - Token of user who created order
      - `order_data` (jsonb) - Order details (theme, cost, etc.)
      - `date` (text) - Order date
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can read their own data and their team's data
    - Orders can be read by creator and their team leader
    - Only the order creator can update their orders
    - Admin can access all data

  3. Indexes
    - Index on users.token for fast lookups
    - Index on users.parent_token for team queries
    - Index on orders.created_by_token for filtering
    - Index on orders.status for status filtering
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text UNIQUE NOT NULL,
  name text NOT NULL DEFAULT '',
  nickname text NOT NULL DEFAULT '',
  parent_token text,
  role text NOT NULL DEFAULT 'team-member',
  ip text NOT NULL DEFAULT '',
  avatar text,
  tokens_added numeric NOT NULL DEFAULT 0,
  tokens_spent numeric NOT NULL DEFAULT 0,
  is_online boolean NOT NULL DEFAULT false,
  last_login timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id serial PRIMARY KEY,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'progress',
  created_by_token text NOT NULL,
  order_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  date text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_token ON users(token);
CREATE INDEX IF NOT EXISTS idx_users_parent_token ON users(parent_token);
CREATE INDEX IF NOT EXISTS idx_orders_created_by_token ON orders(created_by_token);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (
    auth.uid()::text = token OR
    auth.uid()::text IN (SELECT parent_token FROM users WHERE token = auth.uid()::text) OR
    EXISTS (SELECT 1 FROM users WHERE token = auth.uid()::text AND role = 'admin')
  );

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = token)
  WITH CHECK (auth.uid()::text = token);

-- Orders policies
CREATE POLICY "Users can view own orders and team orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    -- User can see their own orders
    created_by_token = auth.uid()::text OR
    -- Team leader can see team members' orders
    created_by_token IN (SELECT token FROM users WHERE parent_token = auth.uid()::text) OR
    -- Team member can see team leader's orders
    auth.uid()::text IN (SELECT token FROM users WHERE parent_token = created_by_token) OR
    -- Admin can see all orders
    EXISTS (SELECT 1 FROM users WHERE token = auth.uid()::text AND role = 'admin')
  );

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (created_by_token = auth.uid()::text);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (created_by_token = auth.uid()::text OR EXISTS (SELECT 1 FROM users WHERE token = auth.uid()::text AND role = 'admin'))
  WITH CHECK (created_by_token = auth.uid()::text OR EXISTS (SELECT 1 FROM users WHERE token = auth.uid()::text AND role = 'admin'));