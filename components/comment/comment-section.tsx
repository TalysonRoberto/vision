"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MessageCircleIcon, Loader2Icon } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatarDataRelativa } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { CommentForm, type ComentarioDados } from "./comment-form"
import { RepliesList } from "./replies-list"
import { CommentLikeButton } from "./comment-like-button"

type EstadoCarregamento = "carregando" | "erro" | "pronto"

export function CommentSection({
  postId,
  initialCount,
  variant = "default",
  open,
  onOpenChange,
  hideTrigger = false,
}: {
  postId: string
  initialCount: number
  variant?: "default" | "overlay"
  open?: boolean
  onOpenChange?: (aberto: boolean) => void
  hideTrigger?: boolean
}) {
  const [abertoInterno, setAbertoInterno] = useState(false)
  const aberto = open ?? abertoInterno
  const setAberto = (valor: boolean) => {
    setAbertoInterno(valor)
    onOpenChange?.(valor)
  }
  const [comentarios, setComentarios] = useState<ComentarioDados[]>([])
  const [estado, setEstado] = useState<EstadoCarregamento>("carregando")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  useEffect(() => {
    if (!aberto) return

    let cancelado = false
    async function carregar() {
      try {
        const resposta = await fetch(`/api/posts/${postId}/comments`)
        if (!resposta.ok) throw new Error("Falha ao carregar comentarios")
        const dados = await resposta.json()
        if (!cancelado) {
          setComentarios(dados.comments)
          setEstado("pronto")
        }
      } catch {
        if (!cancelado) setEstado("erro")
      }
    }
    carregar()
    return () => {
      cancelado = true
    }
  }, [aberto, postId])

  function aoComentarTopLevel(comentario: ComentarioDados) {
    setComentarios((atual) => [...atual, { ...comentario, replies: [] }])
  }

  function aoResponder(parentId: string, reply: ComentarioDados) {
    setComentarios((atual) =>
      atual.map((c) =>
        c.id === parentId
          ? { ...c, replies: [...(c.replies ?? []), reply] }
          : c
      )
    )
    setReplyingTo(null)
  }

  return (
    <section className="flex w-full flex-col gap-3 pt-2">
      {!hideTrigger && (
        <button
          type="button"
          onClick={() => setAberto(!aberto)}
          aria-expanded={aberto}
          aria-label={aberto ? "Fechar comentarios" : "Abrir comentarios"}
          className={cn(
            "inline-flex items-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            variant === "overlay"
              ? "h-9 gap-1.5 px-2 text-xs text-white hover:bg-white/10"
              : "h-11 w-fit px-3 text-muted-foreground hover:bg-muted"
          )}
        >
          <MessageCircleIcon
            className={variant === "overlay" ? "size-4" : "size-5"}
            aria-hidden="true"
          />
          <span>{initialCount}</span>
        </button>
      )}

      {aberto && (
        <div className="flex w-full flex-col gap-4 border-t border-border pt-4">
          <CommentForm
            postId={postId}
            placeholder="Escreva um comentario..."
            onSubmitted={aoComentarTopLevel}
          />

          {estado === "carregando" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
              Carregando comentarios...
            </div>
          )}

          {estado === "erro" && (
            <p className="text-sm text-destructive">
              Erro ao carregar comentarios.{" "}
              <button
                type="button"
                onClick={() => setEstado("carregando")}
                className="underline underline-offset-4"
              >
                Tentar novamente
              </button>
            </p>
          )}

          {estado === "pronto" && comentarios.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nenhum comentario ainda. Seja o primeiro!
            </p>
          )}

          {estado === "pronto" && comentarios.length > 0 && (
            <ul className="flex flex-col gap-4">
              {comentarios.map((comentario) => (
                <li key={comentario.id} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/perfil/${comentario.user.username}`}
                      className="flex shrink-0 items-center"
                      aria-label={`Ver perfil de ${comentario.user.name}`}
                    >
                      {comentario.user.avatar_url ? (
                        <img
                          src={comentario.user.avatar_url}
                          alt=""
                          className="size-9 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
                          aria-hidden="true"
                        >
                          {comentario.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </Link>
                    <Link
                      href={`/perfil/${comentario.user.username}`}
                      className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {comentario.user.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {formatarDataRelativa(comentario.created_at)}
                    </span>
                  </div>

                  <p className="whitespace-pre-wrap pl-11 text-sm text-foreground/90">
                    {comentario.content}
                  </p>

                  <div className="flex flex-col gap-2 pl-11">
                    <div className="flex items-center gap-1">
                      <CommentLikeButton
                        postId={postId}
                        commentId={comentario.id}
                        initialLiked={comentario.likedByCurrentUser ?? false}
                        initialCount={comentario._count?.likes ?? 0}
                      />
                      {replyingTo !== comentario.id && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-9 px-2 text-xs text-muted-foreground"
                          onClick={() => setReplyingTo(comentario.id)}
                        >
                          Responder
                        </Button>
                      )}
                    </div>

                    {replyingTo === comentario.id && (
                      <CommentForm
                        postId={postId}
                        parentCommentId={comentario.id}
                        placeholder={`Responder a ${comentario.user.name}...`}
                        onSubmitted={(reply) => aoResponder(comentario.id, reply)}
                        onCancel={() => setReplyingTo(null)}
                      />
                    )}
                  </div>

                  <RepliesList postId={postId} replies={comentario.replies ?? []} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}
