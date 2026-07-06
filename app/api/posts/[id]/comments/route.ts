import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const comentarioSchema = z.object({
  content: z.string().min(1, "Comentario nao pode ser vazio").max(2000, "Comentario muito longo"),
  parent_comment_id: z.string().optional().nullable(),
})

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  })
  if (!post) {
    return NextResponse.json({ error: "Post nao encontrado" }, { status: 404 })
  }

  const comentarios = await prisma.comment.findMany({
    where: { post_id: postId, parent_comment_id: null },
    orderBy: { created_at: "asc" },
    select: {
      id: true,
      content: true,
      created_at: true,
      user: {
        select: { id: true, name: true, username: true, avatar_url: true },
      },
      replies: {
        orderBy: { created_at: "asc" },
        select: {
          id: true,
          content: true,
          created_at: true,
          user: {
            select: { id: true, name: true, username: true, avatar_url: true },
          },
        },
      },
    },
  })

  return NextResponse.json({ comments: comentarios }, { status: 200 })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessao = await auth()
  if (!sessao?.user?.id) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 })
  }

  const { id: postId } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Corpo invalido" }, { status: 400 })
  }

  const parsed = comentarioSchema.safeParse(body)
  if (!parsed.success) {
    const primeiroErro = parsed.error.issues[0]
    return NextResponse.json(
      { error: primeiroErro?.message ?? "Dados invalidos" },
      { status: 400 }
    )
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  })
  if (!post) {
    return NextResponse.json({ error: "Post nao encontrado" }, { status: 404 })
  }

  // Se for reply, valida parent pertence ao mesmo post e profundidade (1 nivel)
  if (parsed.data.parent_comment_id) {
    const parent = await prisma.comment.findUnique({
      where: { id: parsed.data.parent_comment_id },
      select: { post_id: true, parent_comment_id: true },
    })

    if (!parent) {
      return NextResponse.json({ error: "Comentario pai nao encontrado" }, { status: 404 })
    }

    if (parent.post_id !== postId) {
      return NextResponse.json(
        { error: "Resposta nao pode cruzar posts" },
        { status: 400 }
      )
    }

    if (parent.parent_comment_id !== null) {
      return NextResponse.json(
        { error: "So e possivel responder a comentarios de primeiro nivel" },
        { status: 400 }
      )
    }
  }

  const comentario = await prisma.comment.create({
    data: {
      post_id: postId,
      user_id: sessao.user.id,
      content: parsed.data.content,
      parent_comment_id: parsed.data.parent_comment_id ?? null,
    },
    select: {
      id: true,
      content: true,
      created_at: true,
      user: {
        select: { id: true, name: true, username: true, avatar_url: true },
      },
    },
  })

  return NextResponse.json({ comment: comentario }, { status: 201 })
}
