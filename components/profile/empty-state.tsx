export function EmptyState({
  titulo,
  descricao,
}: {
  titulo: string
  descricao: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <p className="text-base font-medium text-foreground">{titulo}</p>
      <p className="text-sm text-muted-foreground">{descricao}</p>
    </div>
  )
}
