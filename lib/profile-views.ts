"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Registra que o usuario autenticado visitou o perfil de outro usuario.
 *
 * Regras:
 * - Nao registra se nao houver sessao (anonimo nao conta).
 * - Nao registra self-view (viewer === profile).
 * - MVP aceita duplicata (mesmo viewer pode gerar varias visitas).
 * - Erro e tratado silenciosamente (log sem propagar) para nao quebrar o render do perfil.
 */
export async function registrarProfileView(profileId: string): Promise<void> {
  const sessao = await auth()
  if (!sessao?.user?.id) return
  if (sessao.user.id === profileId) return

  try {
    await prisma.profileView.create({
      data: {
        profile_id: profileId,
        viewer_id: sessao.user.id,
      },
    })
  } catch {
    // Log silencioso: nao quebrar render do perfil visitado.
    // Em producao, integrar com logger estruturado (OTel/structured-events).
  }
}
