export function formatarDataRelativa(data: Date): string {
  const agora = new Date()
  const diffMs = agora.getTime() - new Date(data).getTime()
  const diffSeg = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSeg / 60)
  const diffHora = Math.floor(diffMin / 60)
  const diffDia = Math.floor(diffHora / 24)

  if (diffSeg < 60) return "agora"
  if (diffMin < 60) return `ha ${diffMin} min`
  if (diffHora < 24) return `ha ${diffHora}h`
  if (diffDia < 7) return `ha ${diffDia} dia${diffDia === 1 ? "" : "s"}`

  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}
