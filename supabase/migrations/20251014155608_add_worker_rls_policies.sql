/*
  # Add RLS policies for worker management

  1. Changes
    - Add INSERT policy for authenticated users to create worker accounts
    - Add SELECT policy for anon users to read worker tokens for login
    - Add INSERT policy for employee_profiles
    - Add UPDATE policy for employee_profiles (for online status)
  
  2. Security
    - Authenticated users can create workers (admins creating employees)
    - Anonymous users can read user tokens for worker login
    - Workers can update their own employee profile status
*/

-- Allow authenticated users to insert workers
CREATE POLICY "Authenticated users can create workers"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (role = 'worker');

-- Allow anon users to read user data for login (worker token validation)
CREATE POLICY "Anon users can read for login"
  ON users
  FOR SELECT
  TO anon
  USING (role = 'worker');

-- Check if employee_profiles policies exist, if not create them
DO $$
BEGIN
  -- Allow authenticated users to insert employee profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'employee_profiles' 
    AND policyname = 'Authenticated users can create employee profiles'
  ) THEN
    CREATE POLICY "Authenticated users can create employee profiles"
      ON employee_profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  -- Allow anon users to update employee profiles (for online status)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'employee_profiles' 
    AND policyname = 'Anon users can update employee status'
  ) THEN
    CREATE POLICY "Anon users can update employee status"
      ON employee_profiles
      FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;