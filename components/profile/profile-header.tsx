"use client"

import { useEffect, useRef, useState } from "react"
import { EditProfileDialog } from "./edit-profile-dialog"
import { Volume2Icon, VolumeXIcon } from "lucide-react"

function MusicVisualizer() {
  return (
    <div className="flex items-end gap-[2px]" aria-hidden="true">
      {Array.from({ length: 24 }).map((_, i) => {
        const delay = i * 0.05
        const duration = 0.4 + (i % 5) * 0.1
        return (
          <span
            key={i}
            className="w-[3px] rounded-full bg-white will-change-[height]"
            style={{
              height: "4px",
              animation: `musicBar ${duration}s ease-in-out ${delay}s infinite alternate`,
            }}
          />
        )
      })}
    </div>
  )
}

type DadosPerfil = {
  name: string
  username: string
  bio: string | null
  avatar_url: string | null
  cover_url: string | null
  music_url: string | null
}

export function ProfileHeader({ perfil, isOwner }: { perfil: DadosPerfil; isOwner: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [tocando, setTocando] = useState(false)
  const [mutado, setMutado] = useState(false)

  useEffect(() => {
    if (!perfil.music_url) return

    const audio = new Audio(perfil.music_url)
    audio.loop = true
    audio.volume = 0.5
    audioRef.current = audio

    audio.play().then(() => {
      setTocando(true)
    }).catch(() => {
      // Autoplay bloqueado ate interacao do usuario
      setTocando(false)
    })

    return () => {
      audio.pause()
      audio.src = ""
      audioRef.current = null
      setTocando(false)
    }
  }, [perfil.music_url])

  function toggleMute() {
    if (!audioRef.current) return
    audioRef.current.muted = !audioRef.current.muted
    setMutado(audioRef.current.muted)
  }

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

        {perfil.music_url && (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-sm">
            {tocando ? (
              <MusicVisualizer />
            ) : (
              <span className="text-xs text-white/80">Musica pausada</span>
            )}
            <button
              type="button"
              onClick={toggleMute}
              className="rounded-full p-1 text-white hover:bg-white/20"
              aria-label={mutado ? "Ativar som" : "Mutar musica"}
            >
              {mutado ? (
                <VolumeXIcon className="size-4" aria-hidden="true" />
              ) : (
                <Volume2Icon className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes musicBar {
          0% {
            height: 4px;
          }
          100% {
            height: 28px;
          }
        }
      `}</style>

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
