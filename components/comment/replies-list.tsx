import Link from "next/link"
import { formatarDataRelativa } from "@/lib/data"
import type { ComentarioDados } from "./comment-form"
import { CommentLikeButton } from "./comment-like-button"

export function RepliesList({
  postId,
  replies,
}: {
  postId: string
  replies: ComentarioDados[]
}) {
  if (!replies || replies.length === 0) return null

  return (
    <ul className="mt-2 flex flex-col gap-3 border-l-2 border-border pl-4">
      {replies.map((reply) => (
        <li key={reply.id} className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/perfil/${reply.user.username}`}
              className="flex shrink-0 items-center"
              aria-label={`Ver perfil de ${reply.user.name}`}
            >
              {reply.user.avatar_url ? (
                <img
                  src={reply.user.avatar_url}
                  alt=""
                  className="size-7 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
                  aria-hidden="true"
                >
                  {reply.user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
            <Link
              href={`/perfil/${reply.user.username}`}
              className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              {reply.user.name}
            </Link>
            <span className="text-xs text-muted-foreground">
              {formatarDataRelativa(reply.created_at)}
            </span>
          </div>
          <p className="whitespace-pre-wrap pl-9 text-sm text-foreground/90">
            {reply.content}
          </p>
          <div className="pl-9">
            <CommentLikeButton
              postId={postId}
              commentId={reply.id}
              initialLiked={reply.likedByCurrentUser ?? false}
              initialCount={reply._count?.likes ?? 0}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
