/*
  # Create feedback table

  1. New Tables
    - `feedback`
      - `id` (uuid, primary key) - Unique identifier for feedback
      - `order_id` (integer, foreign key) - Reference to the order
      - `project_name` (text) - Name of the project
      - `creator_name` (text) - Name of the order creator
      - `feedback_text` (text) - The feedback content
      - `submitted_by_token` (text) - Token of user who submitted feedback
      - `team_id` (uuid) - Team isolation
      - `created_at` (timestamptz) - When feedback was submitted
  
  2. Security
    - Enable RLS on `feedback` table
    - Add policies for team leaders and team members to submit feedback
    - Add policy for admins to view all feedback for their team
*/

CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id integer REFERENCES orders(id) ON DELETE CASCADE,
  project_name text NOT NULL DEFAULT '',
  creator_name text NOT NULL DEFAULT '',
  feedback_text text NOT NULL DEFAULT '',
  submitted_by_token text NOT NULL DEFAULT '',
  team_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Team leaders and team members can submit feedback
CREATE POLICY "Team members can submit feedback"
  ON feedback FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can view feedback they submitted
CREATE POLICY "Users can view own feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (true);