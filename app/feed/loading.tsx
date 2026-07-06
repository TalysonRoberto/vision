import { Skeleton } from "@/components/ui/skeleton"

export default function FeedLoading() {
  return (
    <div className="flex flex-col gap-4">
      <section
        aria-label="Nova publicacao"
        className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground"
      >
        <Skeleton className="h-20 w-full rounded-md" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-11 w-24" />
        </div>
      </section>

      <section aria-label="Publicacoes" className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <article
            key={i}
            className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-48 w-full rounded-md" />
          </article>
        ))}
      </section>
    </div>
  )
}
