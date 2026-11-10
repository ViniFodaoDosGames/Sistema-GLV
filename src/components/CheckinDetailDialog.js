import React, { useState } from 'react';
import { formatDateTime, getCustomerUser, getService, getVehicle } from '../utils/format';
import Modal from './Modal';
import StatusBadge from './StatusBadge';

function CheckinDetailDialog({ appointment, data, onClose, onCheckIn }) {
  const [observation, setObservation] = useState('');
  const [warning, setWarning] = useState('');
  const [confirmLateCheckIn, setConfirmLateCheckIn] = useState(false);
  const vehicle = appointment && getVehicle(data, appointment.idVeiculo);
  const customer = appointment && getCustomerUser(data, appointment.idCliente);
  const service = appointment && getService(data, appointment.idServico);

  const confirmCheckIn = () => {
    if (!appointment) return;
    const appointmentTime = new Date(appointment.dataHora.replace(' ', 'T'));
    if (Date.now() - appointmentTime.getTime() > 10 * 60 * 1000) {
      if (confirmLateCheckIn) {
        onCheckIn(appointment, observation);
        setObservation('');
        setWarning('');
        setConfirmLateCheckIn(false);
        return;
      }
      setWarning('Este atendimento está fora da tolerância de 10 minutos. Confira o horário antes de continuar.');
      setConfirmLateCheckIn(true);
      return;
    }
    onCheckIn(appointment, observation);
    setObservation('');
    setWarning('');
    setConfirmLateCheckIn(false);
  };

  return (
    <Modal open={Boolean(appointment)} title="Detalhes do atendimento" onClose={() => { setObservation(''); setWarning(''); setConfirmLateCheckIn(false); onClose(); }}>
      {appointment && (
        <>
          <div className="detail-status-row"><span className="eyebrow">POSIÇÃO NA FILA · {appointment.posicaoFila || '—'}</span><StatusBadge status={appointment.status} /></div>
          <div className="detail-grid">
            <div className="detail-item"><small>Cliente</small><strong>{customer?.nome || '—'}</strong></div>
            <div className="detail-item"><small>Veículo</small><strong>{vehicle?.placa || '—'}</strong></div>
            <div className="detail-item"><small>Modelo e cor</small><strong>{vehicle ? `${vehicle.brand?.nome || ''} ${vehicle.model?.nome || ''} · ${vehicle.color?.nome || ''}` : '—'}</strong></div>
            <div className="detail-item"><small>Serviço</small><strong>{service?.nome || '—'}</strong></div>
            <div className="detail-item"><small>Data e horário</small><strong>{formatDateTime(appointment.dataHora)}</strong></div>
            <div className="detail-item"><small>Tipo</small><strong>{appointment.walkIn ? 'Walk-in' : 'Agendado'}</strong></div>
          </div>
          {warning && <p className="form-warning" role="alert">{warning}</p>}
          {appointment.status === 'CONFIRMADO' && (
            <div className="field-group">
              <label className="field-label" htmlFor="checkin-observation">Observações sobre o veículo</label>
              <textarea id="checkin-observation" value={observation} onChange={(event) => setObservation(event.target.value)} placeholder="Registre divergências ou o estado do veículo" rows="3" />
            </div>
          )}
          <div className="modal-actions">
            <button type="button" className="button button-quiet" onClick={onClose}>Fechar</button>
            {appointment.status === 'CONFIRMADO' && <button type="button" className="button button-primary" onClick={confirmCheckIn}>{confirmLateCheckIn ? 'Continuar com check-in' : 'Confirmar check-in'}</button>}
          </div>
        </>
      )}
    </Modal>
  );
}

export default CheckinDetailDialog;
