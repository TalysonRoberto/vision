"use client"

import { useState, useRef } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type AutorComentario = {
  id: string
  name: string
  username: string
  avatar_url: string | null
}

export type ComentarioDados = {
  id: string
  content: string
  created_at: Date
  user: AutorComentario
  replies?: ComentarioDados[]
}

export function CommentForm({
  postId,
  parentCommentId,
  placeholder = "Escreva um comentario...",
  onSubmitted,
  onCancel,
}: {
  postId: string
  parentCommentId?: string
  placeholder?: string
  onSubmitted?: (comentario: ComentarioDados) => void
  onCancel?: () => void
}) {
  const [conteudo, setConteudo] = useState("")
  const [enviando, setEnviando] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function enviar() {
    const texto = conteudo.trim()
    if (!texto) {
      toast.error("Comentario nao pode ser vazio")
      return
    }
    if (texto.length > 2000) {
      toast.error("Comentario muito longo (max 2000 caracteres)")
      return
    }

    setEnviando(true)
    try {
      const resposta = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: texto,
          parent_comment_id: parentCommentId ?? null,
        }),
      })

      if (!resposta.ok) {
        const { error } = await resposta.json()
        throw new Error(error ?? "Erro ao comentar")
      }

      const { comment } = await resposta.json()
      setConteudo("")
      onSubmitted?.(comment)
      toast.success(parentCommentId ? "Resposta enviada!" : "Comentario enviado!")
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Erro ao comentar")
    } finally {
      setEnviando(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter envia, Shift+Enter quebra linha
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  const eReply = Boolean(parentCommentId)

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        ref={textareaRef}
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={eReply ? 2 : 3}
        maxLength={2000}
        className="w-full resize-none"
        aria-label={eReply ? "Resposta" : "Novo comentario"}
      />
      <div className="flex items-center justify-end gap-2">
        {eReply && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={enviando}
            className="h-9"
          >
            Cancelar
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          onClick={enviar}
          disabled={enviando || !conteudo.trim()}
          className="h-9 px-4"
        >
          {enviando ? "Enviando..." : eReply ? "Responder" : "Comentar"}
        </Button>
      </div>
    </div>
  )
}
