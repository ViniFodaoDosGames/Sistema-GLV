import React from 'react';
import { formatCurrency, formatDateTime, getCustomerUser, getService, getVehicle } from '../utils/format';
import Modal from './Modal';
import StatusBadge from './StatusBadge';

function CheckOutConfirmationDialog({ appointment, data, onClose, onConfirm }) {
  const vehicle = appointment && getVehicle(data, appointment.idVeiculo);
  const customer = appointment && getCustomerUser(data, appointment.idCliente);
  const service = appointment && getService(data, appointment.idServico);

  return (
    <Modal open={Boolean(appointment)} title="Confirmar check-out" onClose={onClose}>
      {appointment && (
        <>
          <div className="detail-status-row">
            <span className="eyebrow">CONFERÊNCIA DE ENTREGA</span>
            <StatusBadge status={appointment.status} />
          </div>
          <p>Confirme a conclusão do serviço e a entrega do veículo ao cliente.</p>
          <div className="detail-grid">
            <div className="detail-item"><small>Cliente</small><strong>{customer?.nome || '—'}</strong></div>
            <div className="detail-item"><small>Veículo</small><strong>{vehicle?.placa || '—'}</strong></div>
            <div className="detail-item"><small>Modelo e cor</small><strong>{vehicle ? `${vehicle.brand?.nome || ''} ${vehicle.model?.nome || ''} · ${vehicle.color?.nome || ''}` : '—'}</strong></div>
            <div className="detail-item"><small>Serviço</small><strong>{service?.nome || '—'}</strong></div>
            <div className="detail-item"><small>Data e horário</small><strong>{formatDateTime(appointment.dataHora)}</strong></div>
            <div className="detail-item"><small>Valor</small><strong>{formatCurrency(appointment.valor)}</strong></div>
            <div className="detail-item"><small>Pontos de fidelidade</small><strong>{Number(service?.pontosGerados) || 0} pontos</strong></div>
          </div>
          <p className="demo-notice">Ao confirmar, o atendimento será concluído e os pontos de fidelidade serão lançados, se aplicável.</p>
          <div className="modal-actions">
            <button type="button" className="button button-quiet" onClick={onClose}>Voltar</button>
            <button type="button" className="button button-primary" onClick={() => onConfirm(appointment)}>Confirmar entrega</button>
          </div>
        </>
      )}
    </Modal>
  );
}

export default CheckOutConfirmationDialog;
