"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { MoonIcon, SunIcon, MenuIcon, LogOutIcon, UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useTheme } from "next-themes"

type UsuarioSidebar = {
  name: string
  username: string
  avatar_url: string | null
}

function SidebarCard({ usuario, onNavigate }: { usuario: UsuarioSidebar; onNavigate?: () => void }) {
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = mounted ? resolvedTheme ?? "light" : "light"

  async function sair() {
    await signOut({ redirectTo: "/login" })
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground">
      <Link
        href={`/perfil/${usuario.username}`}
        onClick={onNavigate}
        className="flex items-center gap-3"
      >
        {usuario.avatar_url ? (
          <img src={usuario.avatar_url} alt="" className="size-12 rounded-full object-cover" />
        ) : (
          <div
            className="flex size-12 items-center justify-center rounded-full bg-muted text-base font-semibold text-muted-foreground"
            aria-hidden="true"
          >
            {usuario.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col overflow-hidden">
          <span className="truncate text-sm font-medium text-foreground">{usuario.name}</span>
          <span className="truncate text-xs text-muted-foreground">@{usuario.username}</span>
        </div>
      </Link>

      <Button
        variant="outline"
        size="sm"
        className="h-10 w-full"
        render={<Link href={`/perfil/${usuario.username}`} />}
        nativeButton={false}
        onClick={onNavigate}
      >
        <UserIcon className="size-4" aria-hidden="true" />
        Ver meu perfil
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="h-10 w-full"
        aria-label={currentTheme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
      >
        {currentTheme === "dark" ? (
          <SunIcon className="size-4" aria-hidden="true" />
        ) : (
          <MoonIcon className="size-4" aria-hidden="true" />
        )}
        {currentTheme === "dark" ? "Modo claro" : "Modo escuro"}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={sair}
        className="h-10 w-full"
      >
        <LogOutIcon className="size-4" aria-hidden="true" />
        Sair
      </Button>
    </div>
  )
}

export function FeedSidebar({ usuario }: { usuario: UsuarioSidebar }) {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      {/* Mobile: header bar com hamburger + titulo (abaixo de lg) */}
      <div className="flex items-center justify-between lg:hidden">
        <Sheet open={aberto} onOpenChange={setAberto}>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11"
                aria-label="Abrir menu"
              />
            }
          >
            <MenuIcon className="size-5" aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-4">
            <SheetHeader>
              <SheetTitle className="sr-only">Menu de navegacao</SheetTitle>
              <SheetDescription className="sr-only">
                Informacoes do usuario e atalhos.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4">
              <SidebarCard usuario={usuario} onNavigate={() => setAberto(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <span className="text-sm font-semibold text-foreground">Rede Social</span>
        <span className="w-11" aria-hidden="true" />
      </div>

      {/* Desktop: aside sticky fixo (lg+) */}
      <aside className="hidden lg:sticky lg:top-6 lg:block lg:h-fit lg:w-64 lg:shrink-0">
        <SidebarCard usuario={usuario} />
      </aside>
    </>
  )
}
