"use client"

import Link from "next/link"
import { useState } from "react"
import { ProfileViewsList, type Visualizacao } from "./profile-views-list"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const ABAS = [
  { valor: "todas", label: "Todas" },
  { valor: "fotos", label: "Fotos" },
  { valor: "videos", label: "Vídeos" },
] as const

export function ProfileTabs({
  username,
  abaAtual,
  totalPorAba,
  visualizacoes,
  mostrarVisualizacoes,
}: {
  username: string
  abaAtual: string
  totalPorAba: { todas: number; fotos: number; videos: number }
  visualizacoes: Visualizacao[]
  mostrarVisualizacoes: boolean
}) {
  const [modalAberto, setModalAberto] = useState(false)

  const contagens: Record<string, number> = {
    todas: totalPorAba.todas,
    fotos: totalPorAba.fotos,
    videos: totalPorAba.videos,
  }

  return (
    <nav
      aria-label="Filtrar publicações"
      className="flex gap-1 border-b border-border"
    >
      {ABAS.map((aba) => {
        const ativa = abaAtual === aba.valor
        return (
          <Link
            key={aba.valor}
            href={`/perfil/${username}?tab=${aba.valor}`}
            aria-current={ativa ? "page" : undefined}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              ativa
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {aba.label}
            {contagens[aba.valor] > 0 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {contagens[aba.valor]}
              </span>
            )}
          </Link>
        )
      })}

      {mostrarVisualizacoes && (
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogTrigger
            render={
              <button
                type="button"
                className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            }
          >
            Visualizações
            {visualizacoes.length > 0 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {visualizacoes.length}
              </span>
            )}
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-hidden sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Quem viu meu perfil</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-1">
              <ProfileViewsList visualizacoes={visualizacoes} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </nav>
  )
}
