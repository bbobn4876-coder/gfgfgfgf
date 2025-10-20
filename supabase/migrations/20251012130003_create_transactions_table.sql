/*
  # Create Transactions Table

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `user_token` (text) - Token of user who made the transaction
      - `amount` (numeric) - Transaction amount
      - `status` (text) - Transaction status
      - `hash` (text) - Transaction hash/link
      - `date` (text) - Transaction date
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Users can view their own transactions and their team's transactions
    - Users can insert their own transactions
    - Admin can view all transactions

  3. Indexes
    - Index on transactions.user_token for fast lookups
*/

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_token text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Successful',
  hash text NOT NULL DEFAULT '',
  date text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_transactions_user_token ON transactions(user_token);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "Users can view own transactions and team transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    -- User can see their own transactions
    user_token = auth.uid()::text OR
    -- Team leader can see team members' transactions
    user_token IN (SELECT token FROM users WHERE parent_token = auth.uid()::text) OR
    -- Team member can see team leader's transactions
    auth.uid()::text IN (SELECT token FROM users WHERE parent_token = user_token) OR
    -- Admin can see all transactions
    EXISTS (SELECT 1 FROM users WHERE token = auth.uid()::text AND role = 'admin')
  );

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_token = auth.uid()::text);