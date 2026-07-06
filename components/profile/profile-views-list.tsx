import Link from "next/link"
import { formatarDataRelativa } from "@/lib/data"
import { EmptyState } from "./empty-state"

export type Visualizacao = {
  id: string
  created_at: Date
  viewer: {
    id: string
    name: string
    username: string
    avatar_url: string | null
  }
}

export function ProfileViewsList({ visualizacoes }: { visualizacoes: Visualizacao[] }) {
  if (visualizacoes.length === 0) {
    return (
      <EmptyState
        titulo="Ninguem viu seu perfil ainda"
        descricao="Quando outros usuarios visitarem seu perfil, eles aparecerao aqui."
      />
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {visualizacoes.map((vis) => (
        <li key={vis.id} className="flex items-center gap-3">
          <Link
            href={`/perfil/${vis.viewer.username}`}
            className="flex shrink-0 items-center"
            aria-label={`Ver perfil de ${vis.viewer.name}`}
          >
            {vis.viewer.avatar_url ? (
              <img
                src={vis.viewer.avatar_url}
                alt=""
                className="size-10 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground"
                aria-hidden="true"
              >
                {vis.viewer.name.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <div className="flex flex-1 flex-col overflow-hidden">
            <Link
              href={`/perfil/${vis.viewer.username}`}
              className="truncate text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              {vis.viewer.name}
            </Link>
            <span className="truncate text-xs text-muted-foreground">
              @{vis.viewer.username} · {formatarDataRelativa(vis.created_at)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}
