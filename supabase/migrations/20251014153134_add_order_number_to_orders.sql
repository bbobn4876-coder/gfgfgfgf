/*
  # Add order_number to orders table

  1. Changes
    - Add order_number column to orders table
    - Generate order numbers based on order id
    
  2. Notes
    - Order numbers will be in format like "ORD-0001", "ORD-0002", etc.
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'order_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_number text;
    
    UPDATE orders 
    SET order_number = 'ORD-' || LPAD(id::text, 4, '0')
    WHERE order_number IS NULL;
    
    ALTER TABLE orders ALTER COLUMN order_number SET NOT NULL;
  END IF;
END $$;
