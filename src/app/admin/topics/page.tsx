'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Topic {
  id: string;
  slug: string;
  name: string;
  query: string;
  latest_twitter_post_id: string | null;
}

interface SyncResult {
  success: boolean;
  message: string;
  syncedCount?: number;
  totalProcessed?: number;
  error?: string;
}

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncingSlug, setSyncingSlug] = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<Record<string, SyncResult>>({});

  // Fetch topics on mount
  useEffect(() => {
    fetchTopics();
  }, []);

  async function fetchTopics() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/topics');
      if (!response.ok) {
        throw new Error('Failed to fetch topics');
      }
      const data = await response.json();
      setTopics(data.topics || []);
    } catch (e) {
      console.error('Error fetching topics:', e);
      setError('トピックの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }

  async function handleSync(slug: string) {
    setSyncingSlug(slug);
    setSyncResults((prev) => ({
      ...prev,
      [slug]: { success: false, message: '同期中...' },
    }));

    try {
      const response = await fetch(`/api/admin/topics/${slug}/sync`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Sync failed');
      }

      setSyncResults((prev) => ({
        ...prev,
        [slug]: {
          success: true,
          message: result.message,
          syncedCount: result.syncedCount,
          totalProcessed: result.totalProcessed,
        },
      }));

      // Refresh topics to get updated latest_twitter_post_id
      fetchTopics();
    } catch (e) {
      console.error('Error syncing topic:', e);
      setSyncResults((prev) => ({
        ...prev,
        [slug]: {
          success: false,
          message: '同期に失敗しました',
          error: e instanceof Error ? e.message : String(e),
        },
      }));
    } finally {
      setSyncingSlug(null);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-2">
            <Link href="/topics" className="hover:text-zinc-700 dark:hover:text-zinc-200">
              トピック一覧
            </Link>
            <span>/</span>
            <span className="text-zinc-700 dark:text-zinc-200">管理</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            トピック管理
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            トピックの同期と管理を行います
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-zinc-500 dark:text-zinc-400">読み込み中...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
            {error}
            <button
              onClick={fetchTopics}
              className="ml-4 text-sm underline hover:no-underline"
            >
              再試行
            </button>
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
          <div className="space-y-4">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {topic.name}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      Slug: {topic.slug}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      検索クエリ: {topic.query}
                    </p>
                    {topic.latest_twitter_post_id && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
                        最終取得ID: {topic.latest_twitter_post_id}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/topics/${topic.slug}`}
                      className="px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      表示
                    </Link>
                    <button
                      onClick={() => handleSync(topic.slug)}
                      disabled={syncingSlug === topic.slug}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        syncingSlug === topic.slug
                          ? 'bg-blue-400 text-white cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {syncingSlug === topic.slug ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                          同期中
                        </span>
                      ) : (
                        '同期'
                      )}
                    </button>
                  </div>
                </div>

                {/* Sync result */}
                {syncResults[topic.slug] && (
                  <div
                    className={`mt-3 p-3 rounded-md text-sm ${
                      syncResults[topic.slug].success
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : syncResults[topic.slug].error
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                        : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    <p>{syncResults[topic.slug].message}</p>
                    {syncResults[topic.slug].syncedCount !== undefined && (
                      <p className="text-xs mt-1 opacity-75">
                        新規: {syncResults[topic.slug].syncedCount}件 / 
                        処理済み: {syncResults[topic.slug].totalProcessed}件
                      </p>
                    )}
                    {syncResults[topic.slug].error && (
                      <p className="text-xs mt-1 opacity-75">
                        エラー: {syncResults[topic.slug].error}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-700">
          <Link
            href="/topics"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            ← トピック一覧に戻る
          </Link>
        </div>
      </main>
    </div>
  );
}
