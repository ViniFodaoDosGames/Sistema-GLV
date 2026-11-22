import React from 'react';

function Paginacao({ pagina, porPagina, total, onMudar }) {
  if (total === 0) return null;

  const totalPaginas = Math.ceil(total / porPagina);
  const inicio = (pagina - 1) * porPagina + 1;
  const fim = Math.min(pagina * porPagina, total);

  return (
    <div className='d-flex align-items-center gap-3 no-print'>
      <span>
        Exibindo {inicio}–{fim} de {total}
      </span>
      <ul className='pagination mb-0'>
        <li className={`page-item${pagina <= 1 ? ' disabled' : ''}`}>
          <button type='button' className='page-link' onClick={() => onMudar(pagina - 1)}>
            Anterior
          </button>
        </li>
        <li className='page-item active'>
          <span className='page-link'>
            {pagina} / {totalPaginas}
          </span>
        </li>
        <li className={`page-item${pagina >= totalPaginas ? ' disabled' : ''}`}>
          <button type='button' className='page-link' onClick={() => onMudar(pagina + 1)}>
            Próxima
          </button>
        </li>
      </ul>
    </div>
  );
}

export default Paginacao;
