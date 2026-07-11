"use client"

import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import { MoreVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { editarPost, deletarPost } from "@/app/feed/actions"

export function PostOptionsMenu({
  postId,
  contentText,
}: {
  postId: string
  contentText: string
}) {
  const [menuAberto, setMenuAberto] = useState(false)
  const [editarAberto, setEditarAberto] = useState(false)
  const [deletarAberto, setDeletarAberto] = useState(false)
  const [texto, setTexto] = useState(contentText)
  const [enviando, setEnviando] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAberto(false)
      }
    }
    if (menuAberto) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [menuAberto])

  async function handleEditar() {
    const textoTrim = texto.trim()
    if (!textoTrim) {
      toast.error("O texto nao pode ser vazio")
      return
    }

    setEnviando(true)
    const resultado = await editarPost(postId, textoTrim)
    setEnviando(false)

    if (!resultado.ok) {
      toast.error(resultado.erro)
      return
    }

    toast.success("Publicacao editada")
    setEditarAberto(false)
    setMenuAberto(false)
  }

  async function handleDeletar() {
    setEnviando(true)
    const resultado = await deletarPost(postId)
    setEnviando(false)

    if (!resultado.ok) {
      toast.error(resultado.erro)
      return
    }

    toast.success("Publicacao deletada")
    setDeletarAberto(false)
    setMenuAberto(false)
  }

  return (
    <div ref={menuRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setMenuAberto((v) => !v)}
        aria-expanded={menuAberto}
        aria-label="Opcoes da publicacao"
        className="text-muted-foreground hover:text-foreground"
      >
        <MoreVerticalIcon className="size-4" aria-hidden="true" />
      </Button>

      {menuAberto && (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-44 rounded-lg border border-border bg-popover p-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setMenuAberto(false)
              setEditarAberto(true)
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
          >
            <PencilIcon className="size-4" aria-hidden="true" />
            Editar publicacao
          </button>
          <button
            type="button"
            onClick={() => {
              setMenuAberto(false)
              setDeletarAberto(true)
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2Icon className="size-4" aria-hidden="true" />
            Deletar publicacao
          </button>
        </div>
      )}

      <Dialog open={editarAberto} onOpenChange={setEditarAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar publicacao</DialogTitle>
            <DialogDescription>
              Altere o texto da sua publicacao abaixo.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={4}
            maxLength={2000}
            className="resize-none"
            aria-label="Texto da publicacao"
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditarAberto(false)}
              disabled={enviando}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleEditar}
              disabled={enviando || !texto.trim()}
            >
              {enviando ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deletarAberto} onOpenChange={setDeletarAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar publicacao</DialogTitle>
            <DialogDescription>
              Tem certeza? Esta acao nao pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletarAberto(false)}
              disabled={enviando}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeletar}
              disabled={enviando}
            >
              {enviando ? "Deletando..." : "Deletar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
