import React from 'react';

function Pagination({ page, pageSize, total, onPageChange }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const firstItem = total ? (page - 1) * pageSize + 1 : 0;
  const lastItem = Math.min(page * pageSize, total);

  return (
    <div className="pagination-bar">
      <span>Exibindo {firstItem}–{lastItem} de {total}</span>
      <div>
        <button type="button" className="pagination-button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Anterior</button>
        <span className="pagination-current">{page} / {pageCount}</span>
        <button type="button" className="pagination-button" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>Próxima</button>
      </div>
    </div>
  );
}

export default Pagination;
