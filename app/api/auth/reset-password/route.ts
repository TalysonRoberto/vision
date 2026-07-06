import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { email, token, password } = await req.json()

    if (!email || !token || !password) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Senha deve ter ao menos 8 caracteres" },
        { status: 400 }
      )
    }

    // Valida o OTP do Supabase Auth
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "recovery",
    })

    if (verifyError || !data.user) {
      console.error("Erro ao verificar token:", verifyError)
      return NextResponse.json(
        { error: "Link inválido ou expirado" },
        { status: 400 }
      )
    }

    // Atualiza a senha no nosso banco (Users do NextAuth)
    const hashedPassword = await bcrypt.hash(password, 10)
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { password_hash: hashedPassword },
    })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (erro) {
    console.error("Erro ao redefinir senha:", erro)
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 })
  }
}
