import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function TopicsPage() {
  let topics: { id: string; slug: string; name: string; query: string }[] = [];
  let error: string | null = null;

  try {
    const supabase = createServerSupabaseClient();
    const { data, error: fetchError } = await supabase
      .from('topics')
      .select('id, slug, name, query')
      .order('name', { ascending: true });

    if (fetchError) {
      throw fetchError;
    }

    topics = data || [];
  } catch (e) {
    console.error('Error fetching topics:', e);
    error = 'トピックの取得に失敗しました。Supabaseの環境変数を確認してください。';
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Topic Translate Feed
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            日本語のXポストを英語翻訳付きで表示
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-6">
          トピック一覧
        </h2>

        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
            {error}
          </div>
        ) : topics.length === 0 ? (
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-8 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">
              トピックがまだ登録されていません。
            </p>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2">
              Supabaseの topics テーブルにデータを追加してください。
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <Link
                key={topic.id}
                href={`/topics/${topic.slug}`}
                className="block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  {topic.name}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                  検索: {topic.query}
                </p>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-700">
          <Link
            href="/admin/topics"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            管理画面へ →
          </Link>
        </div>
      </main>
    </div>
  );
}
