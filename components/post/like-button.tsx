"use client"

import { useState } from "react"
import { HeartIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Estado = "idle" | "enviando"

export function LikeButton({
  postId,
  initialLiked,
  initialCount,
  className,
  overlay = false,
}: {
  postId: string
  initialLiked: boolean
  initialCount: number
  className?: string
  overlay?: boolean
}) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [estado, setEstado] = useState<Estado>("idle")

  async function toggle() {
    if (estado === "enviando") return

    // Optimistic: aplica imediatamente
    const likedAntes = liked
    const countAntes = count
    setLiked(!likedAntes)
    setCount(likedAntes ? countAntes - 1 : countAntes + 1)
    setEstado("enviando")

    try {
      const resposta = await fetch(`/api/posts/${postId}/like`, { method: "POST" })
      if (!resposta.ok) {
        throw new Error("Falha ao curtir")
      }
      const dados = await resposta.json()
      // Sincroniza com resposta real do servidor
      setLiked(dados.liked)
      setCount(dados.count)
    } catch {
      // Reverte optimistic em erro
      setLiked(likedAntes)
      setCount(countAntes)
      toast.error("Erro ao curtir. Tente novamente.")
    } finally {
      setEstado("idle")
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={estado === "enviando"}
      aria-pressed={liked}
      aria-label={liked ? "Descurtir publicacao" : "Curtir publicacao"}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
        "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:opacity-50",
        overlay
          ? liked
            ? "text-destructive"
            : "text-white/90 hover:text-white"
          : liked
            ? "text-destructive"
            : "text-muted-foreground",
        className
      )}
    >
      <HeartIcon
        className={cn("size-5", liked && "fill-current")}
        aria-hidden="true"
      />
      <span>{count}</span>
    </button>
  )
}
