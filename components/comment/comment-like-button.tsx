"use client"

import { useState } from "react"
import { HeartIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Estado = "idle" | "enviando"

export function CommentLikeButton({
  postId,
  commentId,
  initialLiked,
  initialCount,
}: {
  postId: string
  commentId: string
  initialLiked: boolean
  initialCount: number
}) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [estado, setEstado] = useState<Estado>("idle")

  async function toggle() {
    if (estado === "enviando") return

    const likedAntes = liked
    const countAntes = count
    setLiked(!likedAntes)
    setCount(likedAntes ? countAntes - 1 : countAntes + 1)
    setEstado("enviando")

    try {
      const resposta = await fetch(`/api/posts/${postId}/comments/${commentId}/like`, {
        method: "POST",
      })
      if (!resposta.ok) {
        throw new Error("Falha ao curtir")
      }
      const dados = await resposta.json()
      setLiked(dados.liked)
      setCount(dados.count)
    } catch {
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
      aria-label={liked ? "Descurtir comentario" : "Curtir comentario"}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors",
        "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:opacity-50",
        liked ? "text-destructive" : "text-muted-foreground"
      )}
    >
      <HeartIcon
        className={cn("size-4", liked && "fill-current")}
        aria-hidden="true"
      />
      <span>{count}</span>
    </button>
  )
}
