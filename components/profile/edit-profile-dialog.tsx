"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

const edicaoSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(80, "Nome muito longo"),
  bio: z.string().max(160, "Bio deve ter no maximo 160 caracteres").optional(),
})

type EdicaoValores = z.infer<typeof edicaoSchema>

type PerfilAtual = {
  name: string
  bio: string | null
  avatar_url: string | null
  cover_url: string | null
}

export function EditProfileDialog({ perfil }: { perfil: PerfilAtual }) {
  const [aberto, setAberto] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(perfil.avatar_url)
  const [previewCapa, setPreviewCapa] = useState<string | null>(perfil.cover_url)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(perfil.avatar_url)
  const [coverUrl, setCoverUrl] = useState<string | null>(perfil.cover_url)
  const [enviandoAvatar, setEnviandoAvatar] = useState(false)
  const [enviandoCapa, setEnviandoCapa] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EdicaoValores>({
    resolver: zodResolver(edicaoSchema),
    defaultValues: { name: perfil.name, bio: perfil.bio ?? "" },
  })

  async function subirArquivo(arquivo: File, pasta: string): Promise<string | null> {
    const formData = new FormData()
    formData.append("arquivo", arquivo)
    formData.append("pasta", pasta)

    const resposta = await fetch("/api/upload", { method: "POST", body: formData })
    if (!resposta.ok) {
      const { error } = await resposta.json()
      throw new Error(error ?? "Erro no upload")
    }
    const { mediaUrl } = await resposta.json()
    return mediaUrl
  }

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    setPreviewAvatar(URL.createObjectURL(arquivo))
    setEnviandoAvatar(true)
    try {
      const url = await subirArquivo(arquivo, "rede-social/avatars")
      if (url) setAvatarUrl(url)
      toast.success("Avatar atualizado")
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Erro ao enviar avatar")
      setPreviewAvatar(perfil.avatar_url)
    } finally {
      setEnviandoAvatar(false)
    }
  }

  async function onCapaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    setPreviewCapa(URL.createObjectURL(arquivo))
    setEnviandoCapa(true)
    try {
      const url = await subirArquivo(arquivo, "rede-social/capas")
      if (url) setCoverUrl(url)
      toast.success("Capa atualizada")
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Erro ao enviar capa")
      setPreviewCapa(perfil.cover_url)
    } finally {
      setEnviandoCapa(false)
    }
  }

  async function onSubmit(dados: EdicaoValores) {
    if (enviandoAvatar || enviandoCapa) {
      toast.message("Aguarde o upload terminar...")
      return
    }

    setCarregando(true)
    try {
      const payload: Record<string, string | null> = { name: dados.name }
      if (dados.bio !== undefined) payload.bio = dados.bio || null
      if (avatarUrl !== perfil.avatar_url) payload.avatar_url = avatarUrl
      if (coverUrl !== perfil.cover_url) payload.cover_url = coverUrl

      const resposta = await fetch("/api/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!resposta.ok) {
        const { error } = await resposta.json()
        toast.error(error ?? "Erro ao salvar")
        return
      }

      toast.success("Perfil atualizado!")
      setAberto(false)
      window.location.reload()
    } catch {
      toast.error("Erro de conexao")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Editar perfil
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>Atualize suas informacoes publicas.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-avatar">Avatar</Label>
            <div className="flex items-center gap-4">
              {previewAvatar ? (
                <img
                  src={previewAvatar}
                  alt="Preview avatar"
                  className="size-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground">
                  Sem foto
                </div>
              )}
              <Input
                id="edit-avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onAvatarChange}
                disabled={enviandoAvatar}
                className="max-w-[200px]"
              />
              {enviandoAvatar && <span className="text-sm text-muted-foreground">Enviando...</span>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-cover">Capa</Label>
            <div className="flex flex-col gap-2">
              {previewCapa ? (
                <img
                  src={previewCapa}
                  alt="Preview capa"
                  className="h-24 w-full rounded-md object-cover"
                />
              ) : (
                <div className="flex h-24 items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
                  Sem capa
                </div>
              )}
              <Input
                id="edit-cover"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onCapaChange}
                disabled={enviandoCapa}
              />
              {enviandoCapa && <span className="text-sm text-muted-foreground">Enviando...</span>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-name">Nome</Label>
            <Input id="edit-name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-bio">Bio</Label>
            <Textarea
              id="edit-bio"
              rows={3}
              placeholder="Conte algo sobre voce..."
              {...register("bio")}
            />
            {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={carregando || enviandoAvatar || enviandoCapa}>
              {carregando ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
