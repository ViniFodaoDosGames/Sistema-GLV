import React, { useMemo, useState } from 'react';
import { CreditCard, QrCode, Stars } from '@mui/icons-material';
import { useAppData } from '../context/AppDataContext';
import { formatCurrency, formatDateTime, getService, getVehicle, toDateTimeValue } from '../utils/format';
import Modal from './Modal';

const paymentOptions = [
  { value: 'PIX', label: 'Pix', description: 'Confirmação simulada para demonstração', Icon: QrCode },
  { value: 'CARTAO', label: 'Cartão de crédito', description: 'Nenhum dado de cartão é coletado', Icon: CreditCard },
  { value: 'PONTOS', label: 'Pontos', description: 'Use seus pontos em um resgate integral', Icon: Stars },
];

function PaymentDialog({ appointment, customerId, employeeId, onClose, onPaid }) {
  const { data, createRecord, updateRecord, updateCollection } = useAppData();
  const [method, setMethod] = useState('PIX');
  const [error, setError] = useState('');
  const service = getService(data, appointment?.idServico);
  const vehicle = getVehicle(data, appointment?.idVeiculo);
  const setting = data.LavaJatos[0] || {};
  const pointsCost = Number(service?.pontosGerados || 0) * Number(setting.fatorFidelidade || 7);
  const availableLots = useMemo(() => data.LotesPontos
    .filter((lot) => lot.idCliente === customerId && Number(lot.saldo) > 0 && new Date(`${lot.expiraEm}T23:59:59`) >= new Date())
    .sort((a, b) => a.expiraEm.localeCompare(b.expiraEm)), [data.LotesPontos, customerId]);
  const availablePoints = availableLots.reduce((total, lot) => total + Number(lot.saldo), 0);

  if (!appointment) return null;

  const confirmPayment = () => {
    if (method === 'PONTOS' && availablePoints < pointsCost) {
      setError('Seu saldo não cobre o resgate integral deste serviço.');
      return;
    }

    if (method === 'PONTOS') {
      let pointsRemaining = pointsCost;
      availableLots.forEach((lot) => {
        if (pointsRemaining <= 0) return;
        const used = Math.min(pointsRemaining, Number(lot.saldo));
        updateRecord('LotesPontos', lot.id, { saldo: Number(lot.saldo) - used });
        pointsRemaining -= used;
      });
    }

    createRecord('Pagamentos', {
      forma: method,
      status: 'APROVADO',
      valor: method === 'PONTOS' ? 0 : Number(appointment.valor),
      dataHora: toDateTimeValue(),
      codigoGateway: method === 'PIX' ? 'DEMO-PIX' : null,
      justificativaEstorno: null,
      idAgendamento: appointment.id,
      idFuncionario: employeeId || null,
    });
    updateCollection('Agendamentos', (items) =>
      items.map((item) => item.id === appointment.id ? { ...item, status: 'CONFIRMADO' } : item)
    );
    onPaid();
  };

  return (
    <Modal open={Boolean(appointment)} title="Pagamento do agendamento" onClose={onClose}>
      <div className="payment-summary">
        <div>
          <span className="eyebrow">RESUMO DO ATENDIMENTO</span>
          <h3>{service?.nome || 'Serviço'}</h3>
          <p>{vehicle?.placa} · {vehicle?.brand?.nome} {vehicle?.model?.nome}</p>
          <p>{formatDateTime(appointment.dataHora)}</p>
        </div>
        <strong>{formatCurrency(appointment.valor)}</strong>
      </div>
      <h3 className="form-section-title">Forma de pagamento</h3>
      <div className="payment-options">
        {paymentOptions.map(({ value, label, description, Icon }) => {
          const pointsUnavailable = value === 'PONTOS' && availablePoints < pointsCost;
          return (
            <button
              type="button"
              key={value}
              disabled={pointsUnavailable}
              className={`payment-option${method === value ? ' is-selected' : ''}${pointsUnavailable ? ' is-disabled' : ''}`}
              onClick={() => { setMethod(value); setError(''); }}
            >
              <span className="payment-option-icon"><Icon fontSize="small" /></span>
              <span><strong>{label}</strong><small>{value === 'PONTOS' ? `${availablePoints} pontos · ${pointsCost} necessários` : description}</small></span>
              <span className="radio-indicator" />
            </button>
          );
        })}
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <p className="demo-notice">Demonstração local: ao confirmar, o pagamento é marcado como aprovado neste navegador.</p>
      <div className="modal-actions">
        <button type="button" className="button button-quiet" onClick={onClose}>Voltar</button>
        <button type="button" className="button button-primary" onClick={confirmPayment}>Confirmar pagamento</button>
      </div>
    </Modal>
  );
}

export default PaymentDialog;
