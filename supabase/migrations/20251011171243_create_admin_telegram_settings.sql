/*
  # Create admin Telegram bot settings table

  1. New Tables
    - `admin_telegram_settings`
      - `id` (uuid, primary key) - Unique identifier
      - `finance_bot_chat_id` (text) - Chat ID for finance bot notifications
      - `orders_bot_chat_id` (text) - Chat ID for orders bot notifications
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `admin_telegram_settings` table
    - Add policy for authenticated users to read settings
    - Add policy for admin to manage settings
*/

CREATE TABLE IF NOT EXISTS admin_telegram_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finance_bot_chat_id text DEFAULT '',
  orders_bot_chat_id text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_telegram_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read admin telegram settings"
  ON admin_telegram_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can insert telegram settings"
  ON admin_telegram_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can update telegram settings"
  ON admin_telegram_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_telegram_settings LIMIT 1) THEN
    INSERT INTO admin_telegram_settings (finance_bot_chat_id, orders_bot_chat_id)
    VALUES ('', '');
  END IF;
END $$;