import type { DefaultSession } from "next-auth"
import type { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
    } & DefaultSession["user"]
  }

  interface User {
    username?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    username?: string
  }
}

// Garante que o tipo JWT é referenciado (evita tree-shake da augmentação)
export type _JWTRef = JWT
