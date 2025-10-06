interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const canPrev = currentPage > 1
  const canNext = currentPage < totalPages

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button disabled={!canPrev} onClick={() => canPrev && onPageChange(currentPage - 1)}>
        Prev
      </button>
      <span>
        Page {currentPage} / {totalPages}
      </span>
      <button disabled={!canNext} onClick={() => canNext && onPageChange(currentPage + 1)}>
        Next
      </button>
    </div>
  )
}


