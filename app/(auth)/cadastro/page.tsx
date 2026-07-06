import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { CadastroForm } from "@/components/auth/cadastro-form"

export default function CadastroPage() {
  return (
    <AuthLayout
      titulo="Comece sua jornada."
      subtitulo="Crie sua conta e comece a compartilhar seus momentos com o mundo."
    >
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Criar conta</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cadastre-se para publicar, curtir e comentar.
        </p>
      </div>

      <CadastroForm />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </AuthLayout>
  )
}
