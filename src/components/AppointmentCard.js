import React from 'react';
import { CalendarMonth, DirectionsCar, Schedule } from '@mui/icons-material';
import StatusBadge from './StatusBadge';
import { formatCurrency, formatDate, getService, getVehicle } from '../utils/format';

function AppointmentCard({ appointment, data, onDetails, onPay, onCancel, onReschedule }) {
  const service = getService(data, appointment.idServico);
  const vehicle = getVehicle(data, appointment.idVeiculo);
  const [date, time = ''] = appointment.dataHora.split(' ');
  const canChange = new Date(appointment.dataHora.replace(' ', 'T')).getTime() - Date.now() >= 15 * 60 * 1000;

  return (
    <article className="appointment-card">
      <div className="appointment-card-top">
        <div className="service-icon"><DirectionsCar /></div>
        <div className="appointment-card-heading">
          <div className="appointment-name-row">
            <h3>{service?.nome || 'Atendimento'}</h3>
            <StatusBadge status={appointment.status} />
          </div>
          <p>{vehicle ? `${vehicle.brand?.nome || ''} ${vehicle.model?.nome || ''} · ${vehicle.placa}` : 'Veículo não identificado'}</p>
        </div>
        <strong className="appointment-price">{formatCurrency(appointment.valor)}</strong>
      </div>
      <div className="appointment-meta">
        <span><CalendarMonth fontSize="small" /> {formatDate(date)}</span>
        <span><Schedule fontSize="small" /> {time.slice(0, 5)}</span>
        {appointment.walkIn && <span className="walk-in-label">Walk-in</span>}
      </div>
      <div className="appointment-actions">
        <button className="button button-outline button-small" type="button" onClick={() => onDetails(appointment)}>Ver detalhes</button>
        {appointment.status === 'AGUARDANDO_PAGAMENTO' && (
          <button className="button button-primary button-small" type="button" onClick={() => onPay(appointment)}>Pagar agora</button>
        )}
        {appointment.status === 'CONFIRMADO' && (
          <>
            <button className="button button-quiet button-small" type="button" disabled={!canChange} onClick={() => onReschedule(appointment)}>Remarcar</button>
            <button className="button button-quiet button-small" type="button" disabled={!canChange} onClick={() => onCancel(appointment)}>Cancelar</button>
          </>
        )}
      </div>
    </article>
  );
}

export default AppointmentCard;
