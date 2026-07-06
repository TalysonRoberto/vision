import Link from "next/link"

const ABAS = [
  { valor: "todas", label: "Todas" },
  { valor: "fotos", label: "Fotos" },
  { valor: "videos", label: "Vídeos" },
] as const

export function ProfileTabs({
  username,
  abaAtual,
  totalPorAba,
}: {
  username: string
  abaAtual: string
  totalPorAba: { todas: number; fotos: number; videos: number }
}) {
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
    </nav>
  )
}
