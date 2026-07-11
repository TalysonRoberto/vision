import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getSupabaseServiceClient, mimeParaMediaTipo, validarMime, validarTamanho } from "@/lib/upload"
import { randomUUID } from "crypto"

const LIMITE_UPLOAD_MB = 50

export async function POST(req: Request) {
  const sessao = await auth()
  if (!sessao?.user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Corpo invalido" }, { status: 400 })
  }

  const { mime, pasta = "rede-social/posts" } = body as { mime?: string; pasta?: string }

  if (!mime || !validarMime(mime)) {
    return NextResponse.json(
      { error: "Tipo de arquivo nao suportado. Use imagem (jpeg, png, webp) ou video (mp4, webm)." },
      { status: 415 }
    )
  }

  const mediaType = mimeParaMediaTipo(mime)
  const ext = mime.split("/")[1]
  const fileName = `${randomUUID()}.${ext}`
  const filePath = `${pasta}/${fileName}`

  try {
    const supabase = getSupabaseServiceClient()
    const { data, error } = await supabase.storage
      .from("posts")
      .createSignedUploadUrl(filePath)

    if (error || !data) {
      throw new Error(error?.message ?? "Erro ao criar signed URL")
    }

    const { data: publicUrlData } = supabase.storage.from("posts").getPublicUrl(filePath)

    return NextResponse.json(
      {
        signedUrl: data.signedUrl,
        token: data.token,
        path: filePath,
        publicUrl: publicUrlData.publicUrl,
        mediaType,
      },
      { status: 200 }
    )
  } catch (erro) {
    const msg = erro instanceof Error ? erro.message : "Erro ao preparar upload"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
