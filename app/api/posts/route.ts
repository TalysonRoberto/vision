import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const PAGE_SIZE = 10

export async function GET(req: Request) {
  const sessao = await auth()
  if (!sessao?.user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 })
  }

  const url = new URL(req.url)
  const pageParam = url.searchParams.get("page")
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)

  const [total, posts] = await Promise.all([
    prisma.post.count(),
    prisma.post.findMany({
      orderBy: { created_at: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        content_text: true,
        media_url: true,
        media_type: true,
        created_at: true,
        author: {
          select: { id: true, name: true, username: true, avatar_url: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return NextResponse.json({
    posts,
    currentPage: page,
    totalPages,
    total,
  })
}
