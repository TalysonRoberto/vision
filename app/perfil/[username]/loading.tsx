import { Skeleton } from "@/components/ui/skeleton"

export default function PerfilLoading() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="flex flex-col">
        <Skeleton className="h-32 w-full rounded-lg sm:h-48 md:h-56" />
        <div className="relative -mt-8 flex flex-col gap-4 px-4 sm:-mt-12 sm:flex-row sm:items-end sm:gap-6 sm:px-6">
          <Skeleton className="size-20 rounded-full border-4 border-background sm:size-28" />
          <div className="flex flex-1 flex-col gap-2 pb-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-1 h-4 w-full max-w-md" />
          </div>
        </div>
      </header>

      <div className="flex gap-1 border-b border-border">
        <Skeleton className="h-11 w-24" />
        <Skeleton className="h-11 w-20" />
        <Skeleton className="h-11 w-24" />
      </div>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </main>
  )
}
