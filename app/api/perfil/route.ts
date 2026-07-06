import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const perfilSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(80, "Nome muito longo").optional(),
  bio: z.string().max(160, "Bio deve ter no maximo 160 caracteres").optional(),
  avatar_url: z.string().url("URL de avatar invalida").optional(),
  cover_url: z.string().url("URL de capa invalida").optional(),
})

export async function PATCH(req: Request) {
  const sessao = await auth()
  if (!sessao?.user?.id) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Corpo da requisicao invalido" }, { status: 400 })
  }

  const parsed = perfilSchema.safeParse(body)
  if (!parsed.success) {
    const primeiroErro = parsed.error.issues[0]
    return NextResponse.json({ error: primeiroErro?.message ?? "Dados invalidos" }, { status: 400 })
  }

  // So atualiza o proprio usuario (autorizacao server-side)
  const dadosAtualizados: Record<string, string> = {}
  if (parsed.data.name !== undefined) dadosAtualizados.name = parsed.data.name
  if (parsed.data.bio !== undefined) dadosAtualizados.bio = parsed.data.bio
  if (parsed.data.avatar_url !== undefined) dadosAtualizados.avatar_url = parsed.data.avatar_url
  if (parsed.data.cover_url !== undefined) dadosAtualizados.cover_url = parsed.data.cover_url

  if (Object.keys(dadosAtualizados).length === 0) {
    return NextResponse.json({ error: "Nenhum campo para atualizar" }, { status: 400 })
  }

  try {
    const user = await prisma.user.update({
      where: { id: sessao.user.id },
      data: dadosAtualizados,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        bio: true,
        avatar_url: true,
        cover_url: true,
      },
    })

    return NextResponse.json({ user }, { status: 200 })
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 })
  }
}
