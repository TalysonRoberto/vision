import Link from "next/link"
import { formatarDataRelativa } from "@/lib/data"
import { LikeButton } from "./like-button"
import { CommentSection } from "@/components/comment/comment-section"
import { PhotoPostCard } from "./photo-post-card"

export type PostCardDados = {
  id: string
  content_text: string
  media_url: string | null
  media_type: string | null
  created_at: Date
  author: {
    id: string
    name: string
    username: string
    avatar_url: string | null
  }
  _count: {
    likes: number
    comments: number
  }
  likedByCurrentUser: boolean
}

export function PostCard({ post }: { post: PostCardDados }) {
  if (post.media_type === "image" && post.media_url) {
    return <PhotoPostCard post={post} />
  }

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground">
      <header className="flex items-center gap-3">
        <Link
          href={`/perfil/${post.author.username}`}
          className="flex shrink-0 items-center"
          aria-label={`Ver perfil de ${post.author.name}`}
        >
          {post.author.avatar_url ? (
            <img
              src={post.author.avatar_url}
              alt=""
              className="size-10 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground"
              aria-hidden="true"
            >
              {post.author.name.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
        <div className="flex flex-col">
          <Link
            href={`/perfil/${post.author.username}`}
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            {post.author.name}
          </Link>
          <span className="text-xs text-muted-foreground">
            @{post.author.username} · {formatarDataRelativa(post.created_at)}
          </span>
        </div>
      </header>

      {post.content_text && (
        <p className="whitespace-pre-wrap text-sm text-foreground/90">{post.content_text}</p>
      )}

      {post.media_url && post.media_type === "image" && (
        <img
          src={post.media_url}
          alt=""
          className="max-h-96 w-full rounded-md object-cover"
        />
      )}
      {post.media_url && post.media_type === "video" && (
        <video
          src={post.media_url}
          controls
          className="max-h-96 w-full rounded-md object-cover"
        />
      )}

      <footer className="flex flex-wrap items-center gap-2 pt-1">
        <LikeButton
          postId={post.id}
          initialLiked={post.likedByCurrentUser}
          initialCount={post._count.likes}
        />
        <CommentSection postId={post.id} initialCount={post._count.comments} />
      </footer>
    </article>
  )
}
