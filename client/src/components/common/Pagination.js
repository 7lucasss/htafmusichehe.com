import React from 'react';

const Pagination = ({
  page,
  totalPages,
  setPage,
}) => {
  return (
    <div className="flex justify-center gap-2 py-4">
      <button
        onClick={() => setPage(p => Math.max(1, p - 1))}
        disabled={page === 1}
        className="px-4 py-2 rounded bg-primary disabled:opacity-50"
      >
        Trước
      </button>
      <span className="px-4 py-2">
        Trang {page} / {totalPages}
      </span>
      <button
        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
        className="px-4 py-2 rounded bg-primary disabled:opacity-50"
      >
        Sau
      </button>
    </div>
  );
};

export default Pagination; 