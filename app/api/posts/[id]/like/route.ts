import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessao = await auth()
  if (!sessao?.user?.id) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 })
  }

  const { id: postId } = await params

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  })
  if (!post) {
    return NextResponse.json({ error: "Post nao encontrado" }, { status: 404 })
  }

  const userId = sessao.user.id
  const chaveUnica = { post_id_user_id: { post_id: postId, user_id: userId } }

  const existente = await prisma.like.findUnique({ where: chaveUnica })

  if (existente) {
    await prisma.like.delete({ where: { id: existente.id } })
  } else {
    try {
      await prisma.like.create({ data: { post_id: postId, user_id: userId } })
    } catch (erro) {
      // P2002 = unique violation — outra transacao criou o like concorrentemente.
      // Tratamos como idempotente: o like existe, portanto liked = true.
      if (erro instanceof Error && "code" in erro && (erro as { code: string }).code === "P2002") {
        // Like ja existe (criado por transacao concorrente) — nada a fazer.
      } else {
        return NextResponse.json({ error: "Erro ao curtir" }, { status: 500 })
      }
    }
  }

  const count = await prisma.like.count({ where: { post_id: postId } })
  const liked = !existente

  return NextResponse.json({ liked, count }, { status: 200 })
}
