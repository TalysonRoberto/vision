import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { prisma } from "@/lib/prisma"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function gerarSenhaTemporaria(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
  let senha = ""
  for (let i = 0; i < 32; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return senha
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "E-mail inválido" }, { status: 400 })
    }

    const emailNormalizado = email.toLowerCase()

    // 1. Verifica se o e-mail existe na nossa base
    const usuario = await prisma.user.findUnique({
      where: { email: emailNormalizado },
      select: { id: true, email: true },
    })

    // Nao revela se o e-mail existe ou nao
    if (!usuario) {
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    // 2. Verifica se o usuario ja existe no Supabase Auth
    const { data: lista } = await supabase.auth.admin.listUsers()
    const existeNoAuth = lista?.users?.some((u) => u.email?.toLowerCase() === emailNormalizado)

    // 3. Se nao existe no Auth, cria com senha temporaria
    if (!existeNoAuth) {
      const { error: createError } = await supabase.auth.admin.createUser({
        email: emailNormalizado,
        password: gerarSenhaTemporaria(),
        email_confirm: true,
      })

      if (createError) {
        console.error("Erro ao criar usuario no Auth:", createError)
        return NextResponse.json({ error: "Erro ao enviar e-mail" }, { status: 500 })
      }
    }

    // 4. Envia e-mail de recuperacao
    const { error } = await supabase.auth.resetPasswordForEmail(emailNormalizado, {
      redirectTo: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/redefinir-senha`,
    })

    if (error) {
      console.error("Erro ao enviar recuperação:", error)
      return NextResponse.json({ error: "Erro ao enviar e-mail" }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (erro) {
    console.error("Erro na recuperacao:", erro)
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 })
  }
}
