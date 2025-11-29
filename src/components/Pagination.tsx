interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const getPageUrl = (page: number) => {
    const url = new URL(baseUrl, 'http://localhost');
    url.searchParams.set('page', page.toString());
    return `${url.pathname}${url.search}`;
  };

  return (
    <nav className="flex items-center justify-center gap-1 mt-6" aria-label="Pagination">
      {/* Previous button */}
      {currentPage > 1 ? (
        <a
          href={getPageUrl(currentPage - 1)}
          className="px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
        >
          前へ
        </a>
      ) : (
        <span className="px-3 py-2 text-sm font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md cursor-not-allowed">
          前へ
        </span>
      )}

      {/* First page and ellipsis */}
      {startPage > 1 && (
        <>
          <a
            href={getPageUrl(1)}
            className="px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            1
          </a>
          {startPage > 2 && (
            <span className="px-2 text-zinc-400 dark:text-zinc-500">...</span>
          )}
        </>
      )}

      {/* Page numbers */}
      {pages.map((page) => (
        <a
          key={page}
          href={getPageUrl(page)}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            page === currentPage
              ? 'bg-blue-600 text-white border border-blue-600'
              : 'text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700'
          }`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </a>
      ))}

      {/* Last page and ellipsis */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="px-2 text-zinc-400 dark:text-zinc-500">...</span>
          )}
          <a
            href={getPageUrl(totalPages)}
            className="px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            {totalPages}
          </a>
        </>
      )}

      {/* Next button */}
      {currentPage < totalPages ? (
        <a
          href={getPageUrl(currentPage + 1)}
          className="px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
        >
          次へ
        </a>
      ) : (
        <span className="px-3 py-2 text-sm font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md cursor-not-allowed">
          次へ
        </span>
      )}
    </nav>
  );
}
