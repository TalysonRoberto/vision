"use client"

import { useState } from "react"
import Link from "next/link"
import { MessageCircleIcon } from "lucide-react"
import { LikeButton } from "./like-button"
import { CommentSection } from "@/components/comment/comment-section"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { PostCardDados } from "./post-card"

export function PhotoPostCard({ post }: { post: PostCardDados }) {
  const [comentariosAbertos, setComentariosAbertos] = useState(false)
  const [imagemAberta, setImagemAberta] = useState(false)
  const objectFit = post.media_fit === "contain" ? "object-contain" : "object-cover"
  const showBackground = post.media_fit === "contain"

  return (
    <article className="flex flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-4 text-card-foreground">
      <Dialog open={imagemAberta} onOpenChange={setImagemAberta}>
        <div
          className={`relative aspect-square w-full overflow-hidden rounded-xl ${
            showBackground ? "bg-muted" : ""
          }`}
        >
          <DialogTrigger
            render={
              <button
                type="button"
                className="absolute inset-0 z-0 cursor-zoom-in"
                aria-label="Abrir imagem completa"
              />
            }
          >
            <img
              src={post.media_url!}
              alt=""
              className={`h-full w-full ${objectFit}`}
            />
          </DialogTrigger>

          {/* Degrade na parte inferior (apenas com cover) */}
          {!showBackground && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          )}

          {/* Conteudo inferior */}
          <div
            className={`absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between gap-4 p-4 ${
              showBackground ? "bg-gradient-to-t from-black/80 via-black/40 to-transparent" : ""
            }`}
          >
            {/* Dados do usuario + texto */}
            <div className="flex min-w-0 flex-col gap-2">
              <Link
                href={`/perfil/${post.author.username}`}
                className="group flex items-center gap-2"
                aria-label={`Ver perfil de ${post.author.name}`}
              >
                {post.author.avatar_url ? (
                  <img
                    src={post.author.avatar_url}
                    alt=""
                    className="size-10 rounded-full object-cover ring-2 ring-white/20"
                  />
                ) : (
                  <div
                    className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground"
                    aria-hidden="true"
                  >
                    {post.author.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="truncate text-sm font-semibold text-white group-hover:underline">
                    {post.author.name}
                  </span>
                  <span className="truncate text-xs text-white/80">
                    @{post.author.username}
                  </span>
                </div>
              </Link>

              {post.content_text && (
                <p className="line-clamp-2 text-sm text-white/90">
                  {post.content_text}
                </p>
              )}
            </div>

            {/* Acoes */}
            <div className="flex flex-col items-center gap-1">
              <LikeButton
                postId={post.id}
                initialLiked={post.likedByCurrentUser}
                initialCount={post._count.likes}
                overlay
                className="h-9 gap-1.5 px-2 text-xs hover:bg-white/10"
              />
              <button
                type="button"
                onClick={() => setComentariosAbertos((v) => !v)}
                aria-expanded={comentariosAbertos}
                aria-label={comentariosAbertos ? "Fechar comentarios" : "Abrir comentarios"}
                className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <MessageCircleIcon className="size-4" aria-hidden="true" />
                <span>{post._count.comments}</span>
              </button>
            </div>
          </div>
        </div>

        <DialogContent className="max-w-4xl border-0 bg-transparent p-0 ring-0">
          <img
            src={post.media_url!}
            alt=""
            className="max-h-[90vh] w-full rounded-xl object-contain"
          />
        </DialogContent>
      </Dialog>

      <CommentSection
        postId={post.id}
        initialCount={post._count.comments}
        open={comentariosAbertos}
        onOpenChange={setComentariosAbertos}
        hideTrigger
      />
    </article>
  )
}
