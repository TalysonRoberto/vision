// Configura o bucket `posts` do Supabase Storage para aceitar os MIME types usados pela app.
// Uso: node --env-file=.env.local scripts/configure-storage.js

const { createClient } = require("@supabase/supabase-js")

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(url, key)

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "application/octet-stream",
]

async function main() {
  const { data: bucket, error: getError } = await supabase.storage.getBucket("posts")
  if (getError) {
    console.error("Erro ao ler bucket:", getError)
    process.exit(1)
  }

  console.log("Bucket atual:", bucket.name)
  console.log("Publico:", bucket.public)
  console.log("Allowed MIME types:", bucket.allowed_mime_types)
  console.log("File size limit:", bucket.file_size_limit)

  const { data, error } = await supabase.storage.updateBucket("posts", {
    public: bucket.public ?? true,
    allowedMimeTypes: ALLOWED_MIME_TYPES,
    fileSizeLimit: bucket.file_size_limit ?? 52_428_800, // 50 MB
  })

  if (error) {
    console.error("Erro ao atualizar bucket:", error)
    process.exit(1)
  }

  console.log("Bucket atualizado:", data)
}

main()
