import Image from 'next/image';
import { Post } from '@/types/database';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const tweetUrl = `https://twitter.com/${post.author_username}/status/${post.twitter_post_id}`;
  const formattedDate = new Date(post.tweeted_at).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <article className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 shadow-sm">
      {/* Header: Author info and X logo */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Author icon */}
          {post.author_profile_image_url ? (
            <Image
              src={post.author_profile_image_url}
              alt={`${post.author_name}'s profile`}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-zinc-300 dark:bg-zinc-600 flex items-center justify-center">
              <span className="text-zinc-600 dark:text-zinc-300 text-sm font-medium">
                {post.author_name.charAt(0)}
              </span>
            </div>
          )}
          {/* Author name and username */}
          <div>
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
              {post.author_name}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              @{post.author_username}
            </p>
          </div>
        </div>
        {/* X logo link */}
        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          title="View on X"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 fill-current"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
      </div>

      {/* Tweet date with link */}
      <a
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-zinc-500 dark:text-zinc-400 hover:underline mb-3 block"
      >
        投稿日: {formattedDate}
      </a>

      {/* Original Japanese text */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wide">
          日本語原文:
        </p>
        <p className="text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
          {post.original_text}
        </p>
      </div>

      {/* English translation */}
      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3">
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wide">
          英訳（自動翻訳）:
        </p>
        {post.translated_text_en ? (
          <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap italic">
            {post.translated_text_en}
          </p>
        ) : (
          <p className="text-zinc-400 dark:text-zinc-500 italic">
            翻訳がありません
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-700 flex gap-4 text-sm text-zinc-500 dark:text-zinc-400">
        <span>❤️ {post.like_count}</span>
        <span>🔁 {post.retweet_count}</span>
        <span>💬 {post.reply_count}</span>
      </div>
    </article>
  );
}
