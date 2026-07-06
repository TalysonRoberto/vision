import { EditProfileDialog } from "./edit-profile-dialog"

type DadosPerfil = {
  name: string
  username: string
  bio: string | null
  avatar_url: string | null
  cover_url: string | null
}

export function ProfileHeader({ perfil, isOwner }: { perfil: DadosPerfil; isOwner: boolean }) {
  return (
    <header className="flex flex-col">
      <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gradient-to-r from-muted to-muted/50 sm:h-48 md:h-56">
        {perfil.cover_url ? (
          <img
            src={perfil.cover_url}
            alt={`Capa de ${perfil.name}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/10 via-muted to-muted/50" />
        )}
      </div>

      <div className="relative -mt-8 flex flex-col gap-4 px-4 sm:-mt-12 sm:flex-row sm:items-end sm:gap-6 sm:px-6">
        <div className="size-20 overflow-hidden rounded-full border-4 border-background bg-muted sm:size-28">
          {perfil.avatar_url ? (
            <img
              src={perfil.avatar_url}
              alt={`Avatar de ${perfil.name}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground">
              {perfil.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 pb-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {perfil.name}
              </h1>
              <p className="text-sm text-muted-foreground">@{perfil.username}</p>
            </div>
            {isOwner && <EditProfileDialog perfil={perfil} />}
          </div>
          {perfil.bio && <p className="mt-1 text-sm text-foreground/90">{perfil.bio}</p>}
        </div>
      </div>
    </header>
  )
}
