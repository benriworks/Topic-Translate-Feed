export function AdArea() {
  return (
    <aside className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
      {/* Clear advertisement label */}
      <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1">
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        広告 / スポンサーリンク
      </div>

      {/* Ad content placeholder */}
      <div className="space-y-4">
        <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-600 rounded-md p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-zinc-400 dark:text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            広告スペース
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            300 x 250
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-600 rounded-md p-4 text-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
            スポンサーリンク
          </p>
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md py-3 px-4">
            <p className="font-semibold text-sm">サンプル広告</p>
            <p className="text-xs opacity-80 mt-1">
              ここに広告バナーが表示されます
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-4 text-center">
        ※ これは広告エリアのサンプルです
      </p>
    </aside>
  );
}
