import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { RecuperarSenhaForm } from "@/components/auth/recuperar-senha-form"

export default function RecuperarSenhaPage() {
  return (
    <AuthLayout
      titulo="Recupere sua conta."
      subtitulo="Enviaremos um link seguro para você redefinir sua senha."
    >
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Recuperar senha</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Digite seu e-mail para receber o link de redefinição.
        </p>
      </div>

      <RecuperarSenhaForm />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Lembrou sua senha?{" "}
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
