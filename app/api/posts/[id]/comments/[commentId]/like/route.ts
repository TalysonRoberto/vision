import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const sessao = await auth()
  if (!sessao?.user?.id) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 })
  }

  const { id: postId, commentId } = await params

  const comentario = await prisma.comment.findUnique({
    where: { id: commentId, post_id: postId },
    select: { id: true },
  })
  if (!comentario) {
    return NextResponse.json({ error: "Comentario nao encontrado" }, { status: 404 })
  }

  const userId = sessao.user.id
  const chaveUnica = { comment_id_user_id: { comment_id: commentId, user_id: userId } }

  const existente = await prisma.commentLike.findUnique({ where: chaveUnica })

  if (existente) {
    await prisma.commentLike.delete({ where: { id: existente.id } })
  } else {
    try {
      await prisma.commentLike.create({ data: { comment_id: commentId, user_id: userId } })
    } catch (erro) {
      if (erro instanceof Error && "code" in erro && (erro as { code: string }).code === "P2002") {
        // Like ja existe (criado por transacao concorrente) — nada a fazer.
      } else {
        return NextResponse.json({ error: "Erro ao curtir" }, { status: 500 })
      }
    }
  }

  const count = await prisma.commentLike.count({ where: { comment_id: commentId } })
  const liked = !existente

  return NextResponse.json({ liked, count }, { status: 200 })
}
