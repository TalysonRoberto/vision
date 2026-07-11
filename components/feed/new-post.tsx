"use client"

import { useState, useRef } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { criarPost } from "@/app/feed/actions"
import { createBrowserClient } from "@/lib/supabase-browser"
import { mimeParaMediaTipo, validarMime, validarTamanho } from "@/lib/upload"

type EstadoUpload = "idle" | "enviando" | "concluido"

const LIMITE_UPLOAD_MB = 50

export function NewPost() {
  const [texto, setTexto] = useState("")
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null)
  const [mediaFit, setMediaFit] = useState<"cover" | "contain">("cover")
  const [estadoUpload, setEstadoUpload] = useState<EstadoUpload>("idle")
  const [publicando, setPublicando] = useState(false)
  const inputArquivoRef = useRef<HTMLInputElement>(null)

  async function onArquivoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selecionado = e.target.files?.[0]
    if (!selecionado) return

    if (!validarMime(selecionado.type)) {
      toast.error("Apenas imagem (jpeg, png, webp) ou video (mp4, webm) sao permitidos.")
      return
    }

    if (!validarTamanho(selecionado.size, LIMITE_UPLOAD_MB * 1024 * 1024)) {
      toast.error(`Arquivo muito grande (max ${LIMITE_UPLOAD_MB}MB).`)
      return
    }

    setArquivo(selecionado)
    setPreviewUrl(URL.createObjectURL(selecionado))
    setEstadoUpload("enviando")

    try {
      const supabase = createBrowserClient()
      const mediaType = mimeParaMediaTipo(selecionado.type)
      const ext = selecionado.type.split("/")[1]
      const fileName = `${crypto.randomUUID()}.${ext}`
      const filePath = `rede-social/posts/${fileName}`

      const { error } = await supabase.storage
        .from("posts")
        .upload(filePath, selecionado, {
          contentType: selecionado.type,
          upsert: false,
        })

      if (error) {
        throw new Error(`Falha no upload: ${error.message}`)
      }

      const { data } = supabase.storage.from("posts").getPublicUrl(filePath)
      setMediaUrl(data.publicUrl)
      setMediaType(mediaType)
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
    setMediaFit("cover")
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
        mediaFit: mediaType === "image" ? mediaFit : undefined,
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
        <div className="relative flex flex-col gap-2">
          {mediaType === "image" || (arquivo && arquivo.type.startsWith("image/")) ? (
            <>
              <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className={`h-full w-full ${mediaFit === "contain" ? "object-contain" : "object-cover"}`}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Enquadramento:</span>
                <button
                  type="button"
                  onClick={() => setMediaFit("cover")}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    mediaFit === "cover"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Preencher
                </button>
                <button
                  type="button"
                  onClick={() => setMediaFit("contain")}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    mediaFit === "contain"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Ajustar
                </button>
              </div>
            </>
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
