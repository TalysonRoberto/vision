import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const cadastroSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  username: z
    .string()
    .min(3, "Username deve ter ao menos 3 caracteres")
    .regex(/^[a-z0-9_]+$/, "Username deve conter apenas letras minúsculas, números e underline"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  const parsed = cadastroSchema.safeParse(body);
  if (!parsed.success) {
    const primeiroErro = parsed.error.issues[0];
    return NextResponse.json({ error: primeiroErro?.message ?? "Dados inválidos" }, { status: 400 });
  }

  const { name, username, email, password } = parsed.data;
  const emailNormalizado = email.toLowerCase();
  const usernameNormalizado = username.toLowerCase();

  const existente = await prisma.user.findFirst({
    where: {
      OR: [{ email: emailNormalizado }, { username: usernameNormalizado }],
    },
    select: { email: true, username: true },
  });

  if (existente) {
    const campo = existente.email === emailNormalizado ? "E-mail" : "Username";
    return NextResponse.json({ error: `${campo} já cadastrado` }, { status: 409 });
  }

  const password_hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      username: usernameNormalizado,
      email: emailNormalizado,
      password_hash,
    },
    select: { id: true },
  });

  return NextResponse.json({ id: user.id }, { status: 201 });
}
