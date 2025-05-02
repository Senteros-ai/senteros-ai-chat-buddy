
-- Create avatars bucket if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'avatars'
    ) THEN
        INSERT INTO storage.buckets
            (id, name, public)
        VALUES
            ('avatars', 'avatars', true);
        
        -- Create a policy to allow anyone to read from this bucket
        CREATE POLICY "Public Read Access"
            ON storage.objects FOR SELECT
            USING (bucket_id = 'avatars');
            
        -- Create a policy to allow authenticated users to upload to this bucket
        CREATE POLICY "Authenticated Users Can Upload"
            ON storage.objects FOR INSERT
            TO authenticated
            WITH CHECK (bucket_id = 'avatars');
            
        -- Create a policy to allow users to update their own files
        CREATE POLICY "Users Can Update Their Own Files"
            ON storage.objects FOR UPDATE
            TO authenticated
            USING (bucket_id = 'avatars' AND auth.uid() = owner);
            
        -- Create a policy to allow users to delete their own files
        CREATE POLICY "Users Can Delete Their Own Files"
            ON storage.objects FOR DELETE
            TO authenticated
            USING (bucket_id = 'avatars' AND auth.uid() = owner);
    END IF;
END
$$;

