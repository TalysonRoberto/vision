import type { ReactNode } from "react"
import { LogoVision } from "@/components/logo-vision"

export function AuthLayout({ children, titulo, subtitulo }: { children: ReactNode; titulo: string; subtitulo: string }) {
  return (
    <main className="relative flex min-h-screen w-full flex-col lg:flex-row">
      {/* Lado esquerdo: fundo escuro com gradiente/ilustração (visível em desktop) */}
      <section className="relative hidden flex-1 flex-col justify-between bg-zinc-950 p-8 text-white lg:flex">
        <div className="relative z-10">
          <LogoVision className="h-10" />
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">{titulo}</h2>
          <p className="mt-4 text-lg text-zinc-400">{subtitulo}</p>
        </div>

        <div className="relative z-10 text-sm text-zinc-500">
          © {new Date().getFullYear()} Vision. Todos os direitos reservados.
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.10),transparent_40%)]" />
      </section>

      {/* Lado direito / Mobile: card branco arredondado */}
      <section className="relative flex min-h-screen flex-1 flex-col bg-zinc-950 lg:bg-background">
        {/* Mobile header */}
        <div className="flex flex-col items-center justify-center gap-3 p-6 lg:hidden">
          <LogoVision className="h-12" />
        </div>

        <div className="flex flex-1 items-stretch justify-center lg:items-center">
          <div className="flex w-full max-w-md flex-col justify-center rounded-t-[2rem] bg-background p-6 shadow-2xl sm:p-8 lg:rounded-[2rem] lg:shadow-none">
            {children}
          </div>
        </div>
      </section>
    </main>
  )
}
