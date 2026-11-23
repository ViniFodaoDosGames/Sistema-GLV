import React from 'react';

const COR_BARRA = '#2a78d6';

function GraficoBarras({ titulo, itens, formatar = (v) => v }) {
  const maior = Math.max(...itens.map((i) => i.valor), 0);

  return (
    <div className='mb-4'>
      <h6>{titulo}</h6>
      {maior === 0 && <p className='text-muted'>Sem dados no período.</p>}
      {maior > 0 &&
        itens.map((item) => (
          <div
            key={item.rotulo}
            className='d-flex align-items-center gap-2'
            style={{ marginBottom: 2, minHeight: 24 }}
            title={`${item.rotulo}: ${formatar(item.valor)}`}
          >
            <span style={{ width: '9rem', flexShrink: 0 }}>{item.rotulo}</span>
            <div className='flex-grow-1'>
              <div
                style={{
                  width: `${(item.valor / maior) * 100}%`,
                  minWidth: item.valor > 0 ? 2 : 0,
                  height: 16,
                  background: COR_BARRA,
                  borderRadius: '0 4px 4px 0',
                  printColorAdjust: 'exact',
                  WebkitPrintColorAdjust: 'exact',
                }}
              />
            </div>
            <span style={{ width: '7rem', flexShrink: 0, textAlign: 'right' }}>{formatar(item.valor)}</span>
          </div>
        ))}
      {maior > 0 && (
        <details className='mt-1 no-print'>
          <summary>Ver tabela</summary>
          <table className='table table-sm'>
            <tbody>
              {itens.map((item) => (
                <tr key={item.rotulo}>
                  <td>{item.rotulo}</td>
                  <td className='text-end'>{formatar(item.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </div>
  );
}

export default GraficoBarras;
