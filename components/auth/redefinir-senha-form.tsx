"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z
  .object({
    password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((dados) => dados.password === dados.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

type Valores = z.infer<typeof schema>

function parseHashParams(): Record<string, string> {
  if (typeof window === "undefined") return {}
  const hash = window.location.hash.replace(/^#/, "")
  const params = new URLSearchParams(hash)
  return Object.fromEntries(params.entries())
}

export function RedefinirSenhaForm({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; email?: string }>
}) {
  const router = useRouter()
  const [carregando, setCarregando] = useState(false)
  const [params, setParams] = useState<{ code?: string; email?: string } | null>(null)
  const [hashError, setHashError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Valores>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    let cancelado = false

    async function carregar() {
      const [query, hash] = await Promise.all([
        searchParams,
        Promise.resolve(parseHashParams()),
      ])

      if (cancelado) return

      // Erro vindo no hash fragment (#error=...)
      if (hash.error || hash.error_description) {
        const descricao = decodeURIComponent(hash.error_description || hash.error || "")
        setHashError(descricao.replace(/\+/g, " "))
        setParams({})
        return
      }

      setParams(query)
    }

    carregar()
    return () => {
      cancelado = true
    }
  }, [searchParams])

  const onSubmit = async (dados: Valores) => {
    if (!params?.code || !params?.email) {
      toast.error("Link inválido ou expirado")
      return
    }

    setCarregando(true)
    try {
      const resposta = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: params.email,
          token: params.code,
          password: dados.password,
        }),
      })

      const resultado = await resposta.json()

      if (!resposta.ok) {
        toast.error(resultado.error || "Erro ao redefinir senha")
        return
      }

      toast.success("Senha redefinida com sucesso!")
      router.push("/login")
    } catch {
      toast.error("Erro de conexão. Tente novamente.")
    } finally {
      setCarregando(false)
    }
  }

  if (hashError) {
    return (
      <div className="rounded-lg bg-destructive/10 p-6 text-center">
        <p className="text-sm font-medium text-destructive">Link inválido ou expirado</p>
        <p className="mt-2 text-sm text-destructive/80">{hashError}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-4 w-full"
          render={<a href="/recuperar-senha" />}
          nativeButton={false}
        >
          Solicitar novo link
        </Button>
      </div>
    )
  }

  if (!params) {
    return (
      <div className="rounded-lg bg-muted p-6 text-center">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (!params.code || !params.email) {
    return (
      <div className="rounded-lg bg-destructive/10 p-6 text-center">
        <p className="text-sm font-medium text-destructive">Link inválido</p>
        <p className="mt-2 text-sm text-destructive/80">
          O link está incompleto. Solicite um novo link de recuperação.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Nova senha</Label>
        <Input
          id="password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          {...register("password")}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Repita a senha"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" disabled={carregando} className="mt-2 h-11">
        {carregando ? "Redefinindo..." : "Redefinir senha"}
      </Button>
    </form>
  )
}
