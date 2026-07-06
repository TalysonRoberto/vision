import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const rotasPublicas = ["/login", "/cadastro", "/recuperar-senha", "/redefinir-senha"]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const estaLogado = !!req.auth

  const rotasProtegidas = ["/feed", "/perfil"]
  const ehRotaProtegida = rotasProtegidas.some((rota) => pathname.startsWith(rota))
  const ehRotaPublica = rotasPublicas.some((rota) => pathname.startsWith(rota))

  if (ehRotaProtegida && !estaLogado) {
    const urlLogin = new URL("/login", req.nextUrl.origin)
    urlLogin.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(urlLogin)
  }

  if (ehRotaPublica && estaLogado) {
    return NextResponse.redirect(new URL("/feed", req.nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/feed/:path*",
    "/perfil/:path*",
    "/login",
    "/cadastro",
    "/recuperar-senha",
    "/redefinir-senha",
  ],
}
