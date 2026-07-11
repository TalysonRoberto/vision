-- Politicas RLS para o bucket 'posts' do Supabase Storage
-- Permite leitura publica e upload/delete por usuarios autenticados.
-- Requer que o bucket 'posts' ja exista no Storage.

CREATE POLICY "Permitir leitura publica no bucket posts"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'posts');

CREATE POLICY "Permitir upload autenticado no bucket posts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'posts');

CREATE POLICY "Permitir delete autenticado no bucket posts"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'posts');
