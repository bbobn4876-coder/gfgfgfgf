/*
  # Add Employee Monthly Tracking and Order Assignment

  1. Changes to orders table
    - Update RLS policies to allow employees to update orders
    
  2. New Functions
    - Function to automatically update employee stats when order is completed
    
  3. Security
    - Ensure employees can only update orders assigned to them or unassigned orders
    - Automatically track employee performance metrics
*/

-- Create function to update employee stats when order is completed
CREATE OR REPLACE FUNCTION update_employee_stats_on_order_complete()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if status changed to completed and there's an assigned employee
  IF NEW.status = 'completed' AND NEW.assigned_to_employee IS NOT NULL 
     AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    UPDATE employees
    SET 
      total_white_pages = total_white_pages + 1,
      total_earned = total_earned + NEW.price,
      updated_at = now()
    WHERE token = NEW.assigned_to_employee;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order completion
DROP TRIGGER IF EXISTS order_completed_update_stats ON orders;
CREATE TRIGGER order_completed_update_stats
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_employee_stats_on_order_complete();

-- Update employees table to track online status
CREATE OR REPLACE FUNCTION update_employee_last_login()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_login = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS employee_login_trigger ON employees;
CREATE TRIGGER employee_login_trigger
  BEFORE UPDATE ON employees
  FOR EACH ROW
  WHEN (OLD.is_online = false AND NEW.is_online = true)
  EXECUTE FUNCTION update_employee_last_login();

-- Add policy for employees to assign themselves to orders
DROP POLICY IF EXISTS "Employees can assign themselves to orders" ON orders;
CREATE POLICY "Employees can assign themselves to orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.token = current_setting('request.jwt.claims', true)::json->>'token'
    )
    AND (assigned_to_employee IS NULL OR assigned_to_employee = current_setting('request.jwt.claims', true)::json->>'token')
  )
  WITH CHECK (
    assigned_to_employee = current_setting('request.jwt.claims', true)::json->>'token'
  );
