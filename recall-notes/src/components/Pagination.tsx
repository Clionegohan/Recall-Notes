interface PaginationProps {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  hasMore?: boolean
  isLoading?: boolean
}

export const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  hasMore = false,
  isLoading = false
}: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const canGoPrevious = currentPage > 1
  const canGoNext = hasMore || currentPage < totalPages

  // 表示するページ番号を計算
  const getVisiblePages = () => {
    const delta = 2 // 現在のページの前後に表示するページ数
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const visiblePages = totalPages > 1 ? getVisiblePages() : []

  if (totalPages <= 1 && !hasMore) {
    return null
  }

  return (
    <div className="pagination">
      <div className="pagination-info">
        <span className="pagination-text">
          {totalItems > 0 ? (
            <>
              {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} / {totalItems}曲
              {hasMore && ' (さらに読み込み可能)'}
            </>
          ) : (
            '0曲'
          )}
        </span>
      </div>

      <div className="pagination-controls">
        <button
          className={`pagination-btn ${!canGoPrevious ? 'disabled' : ''}`}
          onClick={() => canGoPrevious && onPageChange(currentPage - 1)}
          disabled={!canGoPrevious || isLoading}
          title="前のページ"
        >
          ← 前
        </button>

        <div className="pagination-numbers">
          {visiblePages.map((page, index) => (
            <span key={index}>
              {page === '...' ? (
                <span className="pagination-dots">...</span>
              ) : (
                <button
                  className={`pagination-number ${page === currentPage ? 'active' : ''}`}
                  onClick={() => typeof page === 'number' && onPageChange(page)}
                  disabled={isLoading}
                >
                  {page}
                </button>
              )}
            </span>
          ))}
        </div>

        <button
          className={`pagination-btn ${!canGoNext ? 'disabled' : ''}`}
          onClick={() => canGoNext && onPageChange(currentPage + 1)}
          disabled={!canGoNext || isLoading}
          title="次のページ"
        >
          次 →
        </button>
      </div>

      {isLoading && (
        <div className="pagination-loading">
          <div className="pagination-spinner"></div>
          <span>読み込み中...</span>
        </div>
      )}
    </div>
  )
}