import Link from "next/link"
import { Suspense } from "react"
import { AuthLayout } from "@/components/auth/auth-layout"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <AuthLayout
      titulo="Bem-vindo de volta."
      subtitulo="Entre na sua conta para continuar explorando e compartilhando momentos."
    >
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Entrar</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Acesse sua conta para continuar.
        </p>
      </div>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Não tem conta?{" "}
        <Link
          href="/cadastro"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Cadastre-se
        </Link>
      </p>
    </AuthLayout>
  )
}
