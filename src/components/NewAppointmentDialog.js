import React, { useEffect, useMemo, useState } from 'react';
import { CalendarMonth, CheckCircle, Schedule } from '@mui/icons-material';
import { useAppData } from '../context/AppDataContext';
import { formatCurrency, getService, getVehicle, toDateInputValue } from '../utils/format';
import Modal from './Modal';

const weekDays = ['DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'];

function getDefaultDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return toDateInputValue(date);
}

function minutesFromTime(value) {
  const [hours, minutes] = String(value || '00:00').split(':').map(Number);
  return hours * 60 + minutes;
}

function overlaps(start, duration, otherStart, otherDuration) {
  return start < otherStart + otherDuration && otherStart < start + duration;
}

function NewAppointmentDialog({ open, onClose, customerId, onBook, initialBooking, excludeAppointmentId }) {
  const { data } = useAppData();
  const customerVehicles = useMemo(() => data.ClientesVeiculos
    .filter((link) => link.idCliente === customerId)
    .map((link) => getVehicle(data, link.idVeiculo))
    .filter(Boolean), [data, customerId]);
  const availableServices = useMemo(() => data.Servicos.filter((service) => service.ativo), [data.Servicos]);
  const [vehicleId, setVehicleId] = useState(customerVehicles[0]?.id || '');
  const [serviceId, setServiceId] = useState(availableServices[0]?.id || '');
  const [date, setDate] = useState(getDefaultDate);
  const [selectedTime, setSelectedTime] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (!open) return;
    setVehicleId(initialBooking?.idVeiculo || customerVehicles[0]?.id || '');
    setServiceId(initialBooking?.idServico || availableServices[0]?.id || '');
    const defaultDate = getDefaultDate();
    const originalDate = initialBooking?.dataHora.slice(0, 10);
    setDate(originalDate && originalDate >= toDateInputValue() ? originalDate : defaultDate);
    setSelectedTime(initialBooking?.dataHora.slice(11, 16) || '');
    setError('');
  }, [open, initialBooking, customerVehicles, availableServices]);
  const service = getService(data, serviceId);
  const settings = data.LavaJatos[0] || {};
  const pointsBalance = data.LotesPontos
    .filter((lot) => lot.idCliente === customerId && new Date(`${lot.expiraEm}T23:59:59`) >= new Date())
    .reduce((sum, lot) => sum + Number(lot.saldo || 0), 0);

  const slots = useMemo(() => {
    if (!service || !date) return [];
    const weekday = weekDays[new Date(`${date}T12:00:00`).getDay()];
    const opening = data.HorariosFuncionamento.find((item) => item.diaSemana === weekday);
    if (!opening?.aberto || !opening.horaAbertura || !opening.horaFechamento) return [];

    const startMinutes = minutesFromTime(opening.horaAbertura);
    const closingMinutes = minutesFromTime(opening.horaFechamento);
    const lunch = data.IntervalosAlmoco.find((item) => item.horaInicio && item.horaFim);
    const holiday = data.Feriados.some((item) => item.ativo && item.data === date);
    const blockForService = data.Bloqueios.filter((item) => item.ativo && item.data === date && item.idServico === service.id);
    if (holiday) return [];

    const occupied = data.Agendamentos.filter((item) => item.id !== excludeAppointmentId && (
      item.status === 'CONFIRMADO' || item.status === 'EM_ANDAMENTO' || item.status === 'AGUARDANDO_PAGAMENTO'
    )).filter((item) => {
      const [bookingDate, time] = item.dataHora.split(' ');
      return bookingDate === date && time;
    });

    const step = Math.max(15, Number(service.tempoDuracao || 30) + Number(service.tempoIntervalo || 0));
    const now = new Date();
    const currentMinute = now.getHours() * 60 + now.getMinutes();
    const results = [];
    for (let minute = startMinutes; minute + Number(service.tempoDuracao || 30) <= closingMinutes; minute += step) {
      const endMinute = minute + Number(service.tempoDuracao || 30);
      if (date === toDateInputValue(now) && minute <= currentMinute) continue;
      if (lunch && overlaps(minute, Number(service.tempoDuracao || 30), minutesFromTime(lunch.horaInicio), minutesFromTime(lunch.horaFim) - minutesFromTime(lunch.horaInicio))) continue;
      if (blockForService.some((block) =>
        block.diaInteiro || overlaps(
          minute,
          Number(service.tempoDuracao || 30),
          minutesFromTime(block.horaInicio),
          minutesFromTime(block.horaFim) - minutesFromTime(block.horaInicio)
        )
      )) continue;

      const simultaneous = occupied.filter((booking) => {
        const [bookingDate, time] = booking.dataHora.split(' ');
        if (bookingDate !== date) return false;
        const bookedService = getService(data, booking.idServico);
        const duration = Number(bookedService?.tempoDuracao || 30);
        return overlaps(minute, Number(service.tempoDuracao || 30), minutesFromTime(time), duration);
      }).length;
      results.push({
        time: `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`,
        available: simultaneous < Number(service.vagas || settings.totalPosicoes || 1),
      });
      if (endMinute >= closingMinutes) break;
    }
    return results;
  }, [data, date, service, settings.totalPosicoes, excludeAppointmentId]);

  const handleBook = () => {
    if (!vehicleId || !serviceId || !date || !selectedTime) {
      setError('Selecione o veículo, o serviço, a data e um horário disponível.');
      return;
    }
    const chosenSlot = slots.find((slot) => slot.time === selectedTime && slot.available);
    if (!chosenSlot) {
      setError('Esse horário acabou de ficar indisponível. Escolha outro horário.');
      return;
    }
    onBook({
      idCliente: customerId,
      idVeiculo: vehicleId,
      idServico: serviceId,
      dataHora: `${date} ${selectedTime}:00`,
      status: 'AGUARDANDO_PAGAMENTO',
      valor: Number(service.preco),
      walkIn: false,
      posicaoFila: 1,
    });
    setError('');
  };

  return (
    <Modal open={open} title="Novo agendamento" onClose={onClose} size="large">
      <div className="appointment-form-grid">
        <div className="field-group">
          <label className="field-label" htmlFor="booking-vehicle">Veículo *</label>
          <select id="booking-vehicle" value={vehicleId} onChange={(event) => setVehicleId(event.target.value)}>
            <option value="">Selecione um veículo</option>
            {customerVehicles.map((vehicle) => (
              <option value={vehicle.id} key={vehicle.id}>{vehicle.placa} · {vehicle.brand?.nome} {vehicle.model?.nome}</option>
            ))}
          </select>
        </div>
        <div className="field-group">
          <label className="field-label" htmlFor="booking-service">Serviço *</label>
          <select id="booking-service" value={serviceId} onChange={(event) => { setServiceId(event.target.value); setSelectedTime(''); }}>
            {availableServices.map((item) => (
              <option value={item.id} key={item.id}>{item.nome} · {formatCurrency(item.preco)}</option>
            ))}
          </select>
        </div>
        <div className="field-group">
          <label className="field-label" htmlFor="booking-date">Data *</label>
          <input id="booking-date" type="date" min={toDateInputValue()} value={date} onChange={(event) => { setDate(event.target.value); setSelectedTime(''); }} />
        </div>
        <div className="booking-service-summary">
          <span className="summary-icon"><CheckCircle fontSize="small" /></span>
          <span>
            <strong>{service?.pontosGerados || 0} pontos</strong>
            <small>Você ganha neste atendimento · resgate por {Number(service?.pontosGerados || 0) * Number(settings.fatorFidelidade || 7)} pontos</small>
          </span>
          <span className="summary-balance">{pointsBalance} <small>disponíveis</small></span>
        </div>
      </div>

      <div className="slot-section">
        <div className="section-title-row">
          <div><h3>Escolha um horário</h3><p>Os horários consideram funcionamento, intervalo e vagas disponíveis.</p></div>
          <span className="availability-note"><span className="availability-dot" /> Disponível</span>
        </div>
        {slots.length ? (
          <div className="slot-grid">
            {slots.map((slot) => (
              <button
                type="button"
                key={slot.time}
                disabled={!slot.available}
                className={`slot-button${selectedTime === slot.time ? ' is-selected' : ''}`}
                onClick={() => { setSelectedTime(slot.time); setError(''); }}
              >
                <Schedule fontSize="small" /> {slot.time}
              </button>
            ))}
          </div>
        ) : (
          <div className="inline-empty"><CalendarMonth fontSize="small" /> Não há horários disponíveis nesta data.</div>
        )}
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="modal-actions">
        <button type="button" className="button button-quiet" onClick={onClose}>Voltar</button>
        <button type="button" className="button button-primary" onClick={handleBook}>Continuar para pagamento</button>
      </div>
    </Modal>
  );
}

export default NewAppointmentDialog;
