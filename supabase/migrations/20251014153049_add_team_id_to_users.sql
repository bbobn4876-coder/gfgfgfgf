/*
  # Add team_id column to users table

  1. Changes
    - Add team_id column to users table with text type (will store the token of the team leader)
    
  2. Notes
    - Allows linking workers to their team leaders
    - Uses text type to match the existing token system
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE users ADD COLUMN team_id text;
  END IF;
END $$;
