"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z.object({
  email: z.string().email("E-mail inválido"),
})

type Valores = z.infer<typeof schema>

export function RecuperarSenhaForm() {
  const [enviado, setEnviado] = useState(false)
  const [carregando, setCarregando] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Valores>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (dados: Valores) => {
    setCarregando(true)
    try {
      const resposta = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: dados.email }),
      })

      const resultado = await resposta.json()

      if (!resposta.ok) {
        toast.error(resultado.error || "Erro ao enviar e-mail")
        return
      }

      setEnviado(true)
      toast.success("Link enviado! Verifique seu e-mail.")
    } catch {
      toast.error("Erro de conexão. Tente novamente.")
    } finally {
      setCarregando(false)
    }
  }

  if (enviado) {
    return (
      <div className="rounded-lg bg-muted p-6 text-center">
        <p className="text-sm font-medium text-foreground">E-mail enviado!</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
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

      <Button type="submit" disabled={carregando} className="mt-2 h-11">
        {carregando ? "Enviando..." : "Enviar link"}
      </Button>
    </form>
  )
}
