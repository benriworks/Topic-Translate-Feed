import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { PostCard, AdArea, Pagination } from '@/components';
import { Topic, Post } from '@/types';

export const dynamic = 'force-dynamic';

const POSTS_PER_PAGE = 10;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

interface TopicPostWithPost {
  post_id: string;
  posts: Post | null;
}

export default async function TopicTimelinePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || '1', 10));

  let topic: Pick<Topic, 'id' | 'slug' | 'name' | 'query'> | null = null;
  let posts: Post[] = [];
  let totalCount = 0;
  let error: string | null = null;

  try {
    const supabase = createServerSupabaseClient();

    // Get topic by slug
    const { data: topicData, error: topicError } = await supabase
      .from('topics')
      .select('id, slug, name, query')
      .eq('slug', slug)
      .single<Pick<Topic, 'id' | 'slug' | 'name' | 'query'>>();

    if (topicError || !topicData) {
      notFound();
    }

    topic = topicData;

    // Get total count of posts for this topic
    const { count, error: countError } = await supabase
      .from('topic_posts')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', topic.id);

    if (countError) {
      throw countError;
    }

    totalCount = count || 0;

    // Get posts for this topic with pagination
    const offset = (currentPage - 1) * POSTS_PER_PAGE;

    const { data: topicPostsData, error: postsError } = await supabase
      .from('topic_posts')
      .select(`
        post_id,
        posts (*)
      `)
      .eq('topic_id', topic.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + POSTS_PER_PAGE - 1);

    if (postsError) {
      throw postsError;
    }

    // Extract posts from the joined data
    const typedData = topicPostsData as unknown as TopicPostWithPost[];
    posts = (typedData || [])
      .map((tp) => tp.posts)
      .filter((p): p is Post => p !== null)
      .sort((a, b) => new Date(b.tweeted_at).getTime() - new Date(a.tweeted_at).getTime());
  } catch (e) {
    console.error('Error fetching topic timeline:', e);
    error = 'タイムラインの取得に失敗しました。';
  }

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-2">
            <Link href="/topics" className="hover:text-zinc-700 dark:hover:text-zinc-200">
              トピック一覧
            </Link>
            <span>/</span>
            <span className="text-zinc-700 dark:text-zinc-200">{topic?.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {topic?.name}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1 text-sm">
            検索クエリ: {topic?.query}
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Timeline (left/main column) */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                  タイムライン
                </h2>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {totalCount}件の投稿
                </span>
              </div>

              {posts.length === 0 ? (
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-8 text-center">
                  <p className="text-zinc-500 dark:text-zinc-400">
                    まだ投稿がありません。
                  </p>
                  <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2">
                    管理画面から同期を実行してください。
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    baseUrl={`/topics/${slug}`}
                  />
                </>
              )}
            </div>

            {/* Advertisement area (right column) */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <AdArea />

                {/* Quick links */}
                <div className="mt-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
                  <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
                    クイックリンク
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <Link
                        href="/topics"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        ← トピック一覧に戻る
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/topics"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        管理画面
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
