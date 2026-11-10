import React from 'react';

const labels = {
  AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
  CONFIRMADO: 'Confirmado',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluído',
  NAO_COMPARECEU: 'Não compareceu',
  CANCELADO: 'Cancelado',
  APROVADO: 'Aprovado',
  PENDENTE: 'Pendente',
  ESTORNADO: 'Estornado',
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
};

function StatusBadge({ status }) {
  const tone = {
    CONFIRMADO: 'success',
    CONCLUIDO: 'success',
    APROVADO: 'success',
    EM_ANDAMENTO: 'info',
    AGUARDANDO_PAGAMENTO: 'warning',
    PENDENTE: 'warning',
    NAO_COMPARECEU: 'danger',
    CANCELADO: 'muted',
    ESTORNADO: 'danger',
    ATIVO: 'success',
  }[status] || 'muted';

  return <span className={`status-badge status-badge--${tone}`}>{labels[status] || status}</span>;
}

export default StatusBadge;
