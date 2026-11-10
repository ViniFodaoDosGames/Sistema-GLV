import React from 'react';
import { Download } from '@mui/icons-material';
import { formatCurrency, formatDateTime, getService, getVehicle } from '../utils/format';
import Modal from './Modal';
import StatusBadge from './StatusBadge';

function AppointmentDetailsDialog({ appointment, data, onClose }) {
  const service = appointment && getService(data, appointment.idServico);
  const vehicle = appointment && getVehicle(data, appointment.idVeiculo);
  const payment = appointment && data.Pagamentos.find((item) => item.idAgendamento === appointment.id);

  return (
    <Modal open={Boolean(appointment)} title="Detalhes do agendamento" onClose={onClose}>
      {appointment && (
        <>
          <div className="detail-status-row">
            <span className="eyebrow">AGENDAMENTO {appointment.id.slice(-5).toUpperCase()}</span>
            <StatusBadge status={appointment.status} />
          </div>
          <div className="detail-grid">
            <div className="detail-item"><small>Serviço</small><strong>{service?.nome || '—'}</strong></div>
            <div className="detail-item"><small>Valor</small><strong>{formatCurrency(appointment.valor)}</strong></div>
            <div className="detail-item"><small>Veículo</small><strong>{vehicle?.placa || '—'}</strong></div>
            <div className="detail-item"><small>Modelo e cor</small><strong>{vehicle ? `${vehicle.brand?.nome || ''} ${vehicle.model?.nome || ''} · ${vehicle.color?.nome || ''}` : '—'}</strong></div>
            <div className="detail-item"><small>Data e horário</small><strong>{formatDateTime(appointment.dataHora)}</strong></div>
            <div className="detail-item"><small>Pagamento</small><strong>{payment ? `${payment.forma} · ${payment.status}` : 'Aguardando pagamento'}</strong></div>
            <div className="detail-item"><small>Pontos do serviço</small><strong>{service?.pontosGerados || 0} pontos</strong></div>
            <div className="detail-item"><small>Tipo</small><strong>{appointment.walkIn ? 'Walk-in' : 'Agendado'}</strong></div>
          </div>
          <div className="modal-actions">
            <button type="button" className="button button-outline" onClick={() => window.print()}><Download fontSize="small" /> Emitir comprovante</button>
            <button type="button" className="button button-primary" onClick={onClose}>Fechar</button>
          </div>
        </>
      )}
    </Modal>
  );
}

export default AppointmentDetailsDialog;
