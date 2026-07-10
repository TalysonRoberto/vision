"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const LIMITE_TEXTO = 2000

export type CriarPostInput = {
  contentText: string
  mediaUrl: string | null
  mediaType: "image" | "video" | null
  mediaFit?: "cover" | "contain"
}

export type CriarPostResultado =
  | { ok: true; postId: string }
  | { ok: false; erro: string }

export async function criarPost(input: CriarPostInput): Promise<CriarPostResultado> {
  const sessao = await auth()
  if (!sessao?.user?.id) {
    return { ok: false, erro: "Voce precisa estar logado para publicar." }
  }

  const texto = input.contentText?.trim() ?? ""
  const temMidia = Boolean(input.mediaUrl && input.mediaType)

  if (!texto && !temMidia) {
    return { ok: false, erro: "Escreva algo ou anexe uma imagem/video." }
  }

  if (texto.length > LIMITE_TEXTO) {
    return { ok: false, erro: `Texto muito longo (max ${LIMITE_TEXTO} caracteres).` }
  }

  // Consistencia midia/tipo — CHECK constraint em app layer (ver divida)
  if ((input.mediaUrl === null) !== (input.mediaType === null)) {
    return { ok: false, erro: "Midia e tipo devem estar ambos presentes ou ambos ausentes." }
  }

  try {
    const post = await prisma.post.create({
      data: {
        user_id: sessao.user.id,
        content_text: texto,
        media_url: input.mediaUrl,
        media_type: input.mediaType,
        media_fit: input.mediaType === "image" ? (input.mediaFit ?? "cover") : "cover",
      },
      select: { id: true },
    })

    revalidatePath("/feed")
    return { ok: true, postId: post.id }
  } catch {
    return { ok: false, erro: "Erro ao publicar. Tente novamente." }
  }
}
