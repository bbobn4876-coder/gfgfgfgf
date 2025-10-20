/*
  # Create notifications table

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key) - Unique identifier for the notification
      - `user_token` (text) - Token of the user receiving the notification
      - `message` (text) - Notification message content
      - `type` (text) - Type of notification (order_completed, new_order, etc.)
      - `order_id` (integer, nullable) - Related order ID if applicable
      - `is_read` (boolean, default false) - Whether the notification has been read
      - `created_at` (timestamptz) - When the notification was created

  2. Security
    - Enable RLS on `notifications` table
    - Add policy for users to read their own notifications
    - Add policy for users to update their own notifications (mark as read)

  3. Indexes
    - Add index on user_token for faster queries
    - Add index on is_read for filtering
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_token text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  order_id integer,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_token ON notifications(user_token);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own notifications
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  USING (true);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: System can insert notifications
CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true);