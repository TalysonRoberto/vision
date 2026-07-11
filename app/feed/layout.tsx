import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { FeedSidebar } from "@/components/feed/feed-sidebar"

export default async function FeedLayout({ children }: { children: React.ReactNode }) {
  const sessao = await auth()
  if (!sessao?.user?.id) {
    redirect("/login")
  }

  const usuario = await prisma.user.findUnique({
    where: { id: sessao.user.id },
    select: { name: true, username: true, avatar_url: true, cover_url: true, bio: true },
  })

  if (!usuario) {
    redirect("/login")
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8">
      <FeedSidebar
        usuario={{
          name: usuario.name,
          username: usuario.username,
          avatar_url: usuario.avatar_url,
          cover_url: usuario.cover_url,
          bio: usuario.bio,
        }}
      />
      <div className="flex flex-1 flex-col gap-6">{children}</div>
    </div>
  )
}
