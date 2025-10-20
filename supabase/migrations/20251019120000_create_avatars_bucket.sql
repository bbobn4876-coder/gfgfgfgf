/*
  # Create avatars storage bucket and public policies

  - Creates public bucket "avatars"
  - Grants public read and anon/auth insert/update/delete limited to this bucket
*/

-- Create bucket if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'avatars'
  ) THEN
    PERFORM storage.create_bucket('avatars', public => true);
  END IF;
END $$;

-- Policies on storage.objects for avatars bucket
DO $$
BEGIN
  -- Public read
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read avatars'
  ) THEN
    CREATE POLICY "Public read avatars"
      ON storage.objects FOR SELECT
      TO public
      USING ( bucket_id = 'avatars' );
  END IF;

  -- Insert
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Insert avatars'
  ) THEN
    CREATE POLICY "Insert avatars"
      ON storage.objects FOR INSERT
      TO anon, authenticated
      WITH CHECK ( bucket_id = 'avatars' );
  END IF;

  -- Update
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Update avatars'
  ) THEN
    CREATE POLICY "Update avatars"
      ON storage.objects FOR UPDATE
      TO anon, authenticated
      USING ( bucket_id = 'avatars' )
      WITH CHECK ( bucket_id = 'avatars' );
  END IF;

  -- Delete
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Delete avatars'
  ) THEN
    CREATE POLICY "Delete avatars"
      ON storage.objects FOR DELETE
      TO anon, authenticated
      USING ( bucket_id = 'avatars' );
  END IF;
END $$;


