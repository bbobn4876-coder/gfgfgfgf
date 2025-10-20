/*
  # Feedback RLS adjustments

  - Ensure feedback table allows public select/insert (to match app behavior without auth)
*/

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Drop existing policies if any
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'feedback' AND policyname = 'Team members can submit feedback') THEN
    DROP POLICY "Team members can submit feedback" ON feedback;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'feedback' AND policyname = 'Users can view own feedback') THEN
    DROP POLICY "Users can view own feedback" ON feedback;
  END IF;

  -- Public read
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'feedback' AND policyname = 'Allow all read access to feedback') THEN
    CREATE POLICY "Allow all read access to feedback"
      ON feedback FOR SELECT
      USING (true);
  END IF;

  -- Public insert
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'feedback' AND policyname = 'Allow all insert access to feedback') THEN
    CREATE POLICY "Allow all insert access to feedback"
      ON feedback FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;


