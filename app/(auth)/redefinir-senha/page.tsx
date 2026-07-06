import { AuthLayout } from "@/components/auth/auth-layout"
import { RedefinirSenhaForm } from "@/components/auth/redefinir-senha-form"

export default function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; email?: string }>
}) {
  return (
    <AuthLayout
      titulo="Crie uma nova senha."
      subtitulo="Escolha uma senha forte e segura para sua conta."
    >
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Redefinir senha</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Digite sua nova senha abaixo.
        </p>
      </div>

      <RedefinirSenhaForm searchParams={searchParams} />
    </AuthLayout>
  )
}
