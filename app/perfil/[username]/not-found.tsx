import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PerfilNaoEncontrado() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Perfil nao encontrado
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        O username que voce buscou nao existe ou foi removido.
      </p>
      <Button render={<Link href="/feed" />}>
        Voltar ao feed
      </Button>
    </main>
  )
}
