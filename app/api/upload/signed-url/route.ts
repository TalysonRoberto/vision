import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  getSupabaseServiceClient,
  mimeParaExtensao,
  mimeParaMediaTipo,
  validarMime,
  validarMimeMusica,
  validarTamanho,
} from "@/lib/upload"
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

  if (!mime) {
    return NextResponse.json({ error: "MIME nao informado" }, { status: 400 })
  }

  const isPostMedia = validarMime(mime)
  const isMusic = validarMimeMusica(mime)

  if (!isPostMedia && !isMusic) {
    return NextResponse.json(
      { error: "Tipo de arquivo nao suportado." },
      { status: 415 }
    )
  }

  const mediaType = isPostMedia ? mimeParaMediaTipo(mime) : "audio"
  const ext = mimeParaExtensao(mime)
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
