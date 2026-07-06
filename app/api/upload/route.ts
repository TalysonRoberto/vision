import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { uploadArquivo, validarMime, validarTamanho } from "@/lib/upload"

export async function POST(req: Request) {
  const sessao = await auth()
  if (!sessao?.user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 })
  }

  const contentType = req.headers.get("content-type") ?? ""

  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Content-Type nao suportado" }, { status: 415 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "FormData invalido" }, { status: 400 })
  }

  const arquivo = formData.get("arquivo")
  const pasta = (formData.get("pasta") as string) ?? "rede-social/avatars"

  if (!(arquivo instanceof File)) {
    return NextResponse.json({ error: "Arquivo nao encontrado no formData" }, { status: 400 })
  }

  if (!validarMime(arquivo.type)) {
    return NextResponse.json(
      { error: `Tipo de arquivo nao suportado: ${arquivo.type}. Use imagem (jpeg, png, webp) ou video (mp4, webm).` },
      { status: 415 }
    )
  }

  if (!validarTamanho(arquivo.size)) {
    return NextResponse.json(
      { error: "Arquivo muito grande (max 10MB)." },
      { status: 413 }
    )
  }

  try {
    const buffer = Buffer.from(await arquivo.arrayBuffer())
    const resultado = await uploadArquivo(buffer, arquivo.type, pasta)
    return NextResponse.json(resultado, { status: 200 })
  } catch (erro) {
    const msg = erro instanceof Error ? erro.message : "Erro no upload"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
