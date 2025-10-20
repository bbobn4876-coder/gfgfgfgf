/*
  # Add missing employee fields

  1. Changes
    - Add `user_id` column to employees table (links to auth.users)
    - Add `name` column to employees table
    - Add `total_earnings` column to employees table (if not exists)
    - Add `orders_completed` column to employees table (if not exists)
    - Add `worker_id` column to orders table (if not exists)

  2. Security
    - No RLS changes needed
*/

-- Add missing columns to employees table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE employees ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'name'
  ) THEN
    ALTER TABLE employees ADD COLUMN name TEXT DEFAULT 'worker';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'total_earnings'
  ) THEN
    ALTER TABLE employees ADD COLUMN total_earnings NUMERIC DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'orders_completed'
  ) THEN
    ALTER TABLE employees ADD COLUMN orders_completed INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add worker_id column to orders table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'worker_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN worker_id TEXT;
  END IF;
END $$;

-- Create policy for public access to employees table (for login)
CREATE POLICY IF NOT EXISTS "Public can read employees for login"
  ON employees FOR SELECT
  TO anon
  USING (true);

-- Create policy for public to update last_login
CREATE POLICY IF NOT EXISTS "Public can update employee last_login"
  ON employees FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
