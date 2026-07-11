import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { randomUUID } from "crypto"

const MIME_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"] as const
type MimeType = (typeof MIME_PERMITIDOS)[number]

export type MediaTipo = "image" | "video"

let _supabaseService: SupabaseClient | null = null

export function getSupabaseServiceClient(): SupabaseClient {
  if (_supabaseService) return _supabaseService

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      "Supabase nao configurado. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env"
    )
  }

  _supabaseService = createClient(url, key)
  return _supabaseService
}

export function validarMime(mime: string): mime is MimeType {
  return (MIME_PERMITIDOS as readonly string[]).includes(mime)
}

export function mimeParaMediaTipo(mime: string): MediaTipo {
  if (mime.startsWith("image/")) return "image"
  if (mime.startsWith("video/")) return "video"
  throw new Error(`MIME nao suportado: ${mime}`)
}

export type UploadResultado = {
  mediaUrl: string
  mediaType: MediaTipo
}

export async function uploadArquivo(
  buffer: Buffer,
  mime: string,
  pasta: string
): Promise<UploadResultado> {
  const supabase = getSupabaseServiceClient()
  const mediaType = mimeParaMediaTipo(mime)
  const ext = mime.split("/")[1]
  const fileName = `${randomUUID()}.${ext}`
  const filePath = `${pasta}/${fileName}`

  const { error } = await supabase.storage
    .from("posts")
    .upload(filePath, buffer, {
      contentType: mime,
      upsert: false,
    })

  if (error) {
    throw new Error(`Falha no upload: ${error.message}`)
  }

  const { data } = supabase.storage.from("posts").getPublicUrl(filePath)

  return { mediaUrl: data.publicUrl, mediaType }
}

export function validarTamanho(tamanhoBytes: number, limiteBytes = 10 * 1024 * 1024): boolean {
  return tamanhoBytes <= limiteBytes
}
