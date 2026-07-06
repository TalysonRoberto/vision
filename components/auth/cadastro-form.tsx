"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const cadastroSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  username: z
    .string()
    .min(3, "Username deve ter ao menos 3 caracteres")
    .regex(/^[a-z0-9_]+$/, "Apenas letras minúsculas, números e underline"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
})

type CadastroValores = z.infer<typeof cadastroSchema>

export function CadastroForm() {
  const router = useRouter()
  const [carregando, setCarregando] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CadastroValores>({
    resolver: zodResolver(cadastroSchema),
  })

  const onSubmit = async (dados: CadastroValores) => {
    setCarregando(true)
    try {
      const resposta = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      })

      if (resposta.status === 409) {
        const { error } = await resposta.json()
        toast.error(error)
        return
      }
      if (!resposta.ok) {
        const { error } = await resposta.json()
        toast.error(error ?? "Erro ao cadastrar")
        return
      }

      toast.success("Conta criada! Faça login para continuar.")
      router.push("/login")
    } catch {
      toast.error("Erro de conexão. Tente novamente.")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" placeholder="Seu nome" autoComplete="name" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          placeholder="ex: maria_silva"
          autoComplete="username"
          {...register("username")}
        />
        {errors.username && (
          <p className="text-sm text-destructive">{errors.username.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="voce@exemplo.com"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" disabled={carregando} className="mt-2 h-11">
        {carregando ? "Criando..." : "Criar conta"}
      </Button>
    </form>
  )
}
