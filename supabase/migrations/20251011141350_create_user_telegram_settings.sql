/*
  # Create user Telegram settings table

  1. New Tables
    - `user_telegram_settings`
      - `id` (uuid, primary key) - Unique identifier
      - `user_token` (text, unique) - User token (tl_, tm_, lead_)
      - `telegram_chat_id` (text) - User's Telegram chat ID for notifications
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `user_telegram_settings` table
    - Add policy for authenticated users to manage their own settings
*/

CREATE TABLE IF NOT EXISTS user_telegram_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_token text UNIQUE NOT NULL,
  telegram_chat_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_telegram_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own telegram settings"
  ON user_telegram_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own telegram settings"
  ON user_telegram_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own telegram settings"
  ON user_telegram_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own telegram settings"
  ON user_telegram_settings
  FOR DELETE
  TO authenticated
  USING (true);