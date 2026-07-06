"use client"

import { useState, useRef } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { criarPost } from "@/app/feed/actions"

type EstadoUpload = "idle" | "enviando" | "concluido"

export function NewPost() {
  const [texto, setTexto] = useState("")
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null)
  const [estadoUpload, setEstadoUpload] = useState<EstadoUpload>("idle")
  const [publicando, setPublicando] = useState(false)
  const inputArquivoRef = useRef<HTMLInputElement>(null)

  async function onArquivoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selecionado = e.target.files?.[0]
    if (!selecionado) return

    if (!selecionado.type.startsWith("image/") && !selecionado.type.startsWith("video/")) {
      toast.error("Apenas imagem ou video sao permitidos.")
      return
    }

    setArquivo(selecionado)
    setPreviewUrl(URL.createObjectURL(selecionado))
    setEstadoUpload("enviando")

    try {
      const formData = new FormData()
      formData.append("arquivo", selecionado)
      formData.append("pasta", "rede-social/posts")

      const resposta = await fetch("/api/upload", { method: "POST", body: formData })
      if (!resposta.ok) {
        const { error } = await resposta.json()
        throw new Error(error ?? "Erro no upload")
      }
      const dados = await resposta.json()
      setMediaUrl(dados.mediaUrl)
      setMediaType(dados.mediaType)
      setEstadoUpload("concluido")
      toast.success("Midia anexada")
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Erro ao enviar midia")
      limparMidia()
    }
  }

  function limparMidia() {
    setArquivo(null)
    setPreviewUrl(null)
    setMediaUrl(null)
    setMediaType(null)
    setEstadoUpload("idle")
    if (inputArquivoRef.current) inputArquivoRef.current.value = ""
  }

  async function onPublicar() {
    const textoTrim = texto.trim()
    if (!textoTrim && !mediaUrl) {
      toast.error("Escreva algo ou anexe uma imagem/video.")
      return
    }
    if (estadoUpload === "enviando") {
      toast.message("Aguarde o upload terminar...")
      return
    }

    setPublicando(true)
    try {
      const resultado = await criarPost({
        contentText: textoTrim,
        mediaUrl,
        mediaType,
      })

      if (!resultado.ok) {
        toast.error(resultado.erro)
        return
      }

      toast.success("Publicacao realizada!")
      setTexto("")
      limparMidia()
    } catch {
      toast.error("Erro ao publicar. Tente novamente.")
    } finally {
      setPublicando(false)
    }
  }

  return (
    <section
      aria-label="Nova publicacao"
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground"
    >
      <Textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="O que voce esta pensando?"
        rows={3}
        maxLength={2000}
        className="resize-none"
        aria-label="Texto da publicacao"
      />

      {previewUrl && (
        <div className="relative">
          {mediaType === "image" || (arquivo && arquivo.type.startsWith("image/")) ? (
            <img src={previewUrl} alt="Preview" className="max-h-72 w-full rounded-md object-cover" />
          ) : (
            <video src={previewUrl} controls className="max-h-72 w-full rounded-md object-cover" />
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={limparMidia}
            className="absolute right-2 top-2"
            aria-label="Remover midia"
          >
            Remover
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputArquivoRef}
            id="anexo-post"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
            onChange={onArquivoChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            render={<label htmlFor="anexo-post" />}
            nativeButton={false}
            disabled={estadoUpload === "enviando" || publicando}
          >
            {estadoUpload === "enviando" ? "Enviando..." : "Anexar midia"}
          </Button>
          {texto.length > 0 && (
            <span className="text-xs text-muted-foreground">{texto.length}/2000</span>
          )}
        </div>

        <Button
          type="button"
          onClick={onPublicar}
          disabled={publicando || estadoUpload === "enviando"}
          className="h-11 px-6"
        >
          {publicando ? "Publicando..." : "Publicar"}
        </Button>
      </div>
    </section>
  )
}
