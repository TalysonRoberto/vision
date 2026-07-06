import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email
        const password = credentials?.password
        if (typeof email !== "string" || typeof password !== "string") {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        })
        if (!user || !user.password_hash) {
          return null
        }

        const senhaValida = await bcrypt.compare(password, user.password_hash)
        if (!senhaValida) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          image: user.avatar_url ?? null,
        }
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.username = (user as { username?: string }).username
      }
      return token
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
      }
      return session
    },
  },
})
