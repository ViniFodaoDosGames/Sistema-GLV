import React, { useMemo, useState } from 'react';
import { Add, CalendarMonth, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AppointmentCard from '../components/AppointmentCard';
import AppointmentDetailsDialog from '../components/AppointmentDetailsDialog';
import Modal from '../components/Modal';
import NewAppointmentDialog from '../components/NewAppointmentDialog';
import PaymentDialog from '../components/PaymentDialog';
import Pagination from '../components/Pagination';
import { useAppData } from '../context/AppDataContext';
import { getCustomerIdForSession, getCustomerUser, getService, toDateInputValue } from '../utils/format';

function AppointmentsPage({ session, startNew = false, staffMode = false }) {
  const { data, createRecord, updateCollection } = useAppData();
  const navigate = useNavigate();
  const customerId = getCustomerIdForSession(data, session);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [showNew, setShowNew] = useState(startNew);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [paymentAppointment, setPaymentAppointment] = useState(null);
  const [cancelAppointment, setCancelAppointment] = useState(null);
  const [cancelError, setCancelError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const appointments = useMemo(() => {
    const filtered = data.Agendamentos.filter((appointment) =>
      staffMode || appointment.idCliente === customerId
    ).filter((appointment) => statusFilter === 'TODOS' || appointment.status === statusFilter)
      .filter((appointment) => {
        const service = getService(data, appointment.idServico);
        const customer = getCustomerUser(data, appointment.idCliente);
        const vehicle = data.Veiculos.find((item) => item.id === appointment.idVeiculo);
        const haystack = [
          service?.nome,
          customer?.nome,
          vehicle?.placa,
          appointment.dataHora,
          appointment.status,
        ].join(' ').toLowerCase();
        return haystack.includes(query.toLowerCase());
      });
    return filtered.sort((a, b) => b.dataHora.localeCompare(a.dataHora));
  }, [data, customerId, query, staffMode, statusFilter]);
  const pageSize = 6;
  const visibleAppointments = appointments.slice((page - 1) * pageSize, page * pageSize);

  const handleBook = (values) => {
    if (rescheduleAppointment) {
      updateCollection('Agendamentos', (items) =>
        items.map((item) => item.id === rescheduleAppointment.id ? { ...item, ...values, status: 'CONFIRMADO' } : item)
      );
      setRescheduleAppointment(null);
      setSuccessMessage('Seu agendamento foi remarcado.');
      return;
    }
    const record = createRecord('Agendamentos', values);
    setShowNew(false);
    setPaymentAppointment(record);
  };

  const confirmCancellation = () => {
    if (!cancelAppointment) return;
    const appointmentDate = new Date(cancelAppointment.dataHora.replace(' ', 'T'));
    if (appointmentDate.getTime() - Date.now() < 15 * 60 * 1000) {
      setCancelError('O cancelamento só pode ser realizado até 15 minutos antes do horário agendado.');
      return;
    }

    updateCollection('Agendamentos', (items) =>
      items.map((item) => item.id === cancelAppointment.id ? { ...item, status: 'CANCELADO' } : item)
    );
    if (cancelAppointment.status === 'CONFIRMADO') {
      const service = getService(data, cancelAppointment.idServico);
      const settings = data.LavaJatos[0] || {};
      const amount = Number(service?.pontosGerados || 0) * Number(settings.fatorFidelidade || 7);
      const generated = new Date();
      const expires = new Date(generated);
      expires.setDate(expires.getDate() + Number(settings.validadePontosCompensacao || 60));
      createRecord('LotesPontos', {
        tipo: 'COMPENSACAO',
        quantidade: amount,
        saldo: amount,
        geradoEm: toDateInputValue(generated),
        expiraEm: toDateInputValue(expires),
        idCliente: cancelAppointment.idCliente,
        idAgendamento: cancelAppointment.id,
      });
    }
    setCancelAppointment(null);
    setCancelError('');
  };

  const statusOptions = [
    ['TODOS', 'Todos os status'],
    ['CONFIRMADO', 'Confirmado'],
    ['AGUARDANDO_PAGAMENTO', 'Aguardando pagamento'],
    ['EM_ANDAMENTO', 'Em andamento'],
    ['CONCLUIDO', 'Concluído'],
    ['CANCELADO', 'Cancelado'],
  ];

  return (
    <div className="page-stack">
      <section className="page-intro-row">
        <div>
          <p className="muted-copy">{staffMode ? 'Acompanhe os horários e pagamentos dos clientes.' : 'Acompanhe seus próximos serviços e o histórico de lavagens.'}</p>
        </div>
        {!staffMode && (
          <button type="button" className="button button-primary" onClick={() => setShowNew(true)}>
            <Add fontSize="small" /> Novo agendamento
          </button>
        )}
      </section>
      {successMessage && <div className="success-banner" role="status">{successMessage}<button type="button" aria-label="Fechar mensagem" onClick={() => setSuccessMessage('')}>×</button></div>}

      <section className="panel filter-panel">
        <label className="search-field">
          <Search fontSize="small" />
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Buscar por serviço, veículo ou data" />
        </label>
        <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} aria-label="Filtrar por status">
          {statusOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
        </select>
        <span className="results-count">{appointments.length} atendimento{appointments.length === 1 ? '' : 's'}</span>
      </section>

      {appointments.length ? (
        <section className="appointment-grid">
          {visibleAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              data={data}
              onDetails={setSelectedDetails}
              onPay={setPaymentAppointment}
              onCancel={(item) => { setCancelAppointment(item); setCancelError(''); }}
              onReschedule={setRescheduleAppointment}
            />
          ))}
        </section>
      ) : (
        <section className="empty-state panel">
          <span className="empty-icon"><CalendarMonth /></span>
          <h2>Nenhum agendamento encontrado</h2>
          <p>Quando você agendar um serviço, ele aparecerá aqui.</p>
          {!staffMode && <button className="button button-primary" type="button" onClick={() => setShowNew(true)}>Agendar lavagem</button>}
        </section>
      )}
      <Pagination page={page} pageSize={pageSize} total={appointments.length} onPageChange={setPage} />

      <NewAppointmentDialog
        open={showNew || Boolean(rescheduleAppointment)}
        onClose={() => {
          setShowNew(false);
          setRescheduleAppointment(null);
          if (startNew) navigate('/cliente/agendamentos');
        }}
        customerId={customerId}
        initialBooking={rescheduleAppointment}
        excludeAppointmentId={rescheduleAppointment?.id}
        onBook={handleBook}
      />
      <PaymentDialog
        appointment={paymentAppointment}
        customerId={paymentAppointment?.idCliente || customerId}
        onClose={() => setPaymentAppointment(null)}
        onPaid={() => setPaymentAppointment(null)}
      />
      <AppointmentDetailsDialog
        appointment={selectedDetails}
        data={data}
        onClose={() => setSelectedDetails(null)}
      />
      <Modal open={Boolean(cancelAppointment)} title={cancelError ? 'Não foi possível cancelar' : 'Cancelar agendamento'} onClose={() => { setCancelAppointment(null); setCancelError(''); }}>
        <p>{cancelError || 'Tem certeza de que deseja cancelar este atendimento? O valor pago será convertido em pontos de compensação.'}</p>
        <div className="modal-actions">
          <button className="button button-quiet" type="button" onClick={() => { setCancelAppointment(null); setCancelError(''); }}>
            {cancelError ? 'Fechar' : 'Manter agendamento'}
          </button>
          {!cancelError && <button className="button button-danger" type="button" onClick={confirmCancellation}>Confirmar cancelamento</button>}
        </div>
      </Modal>
    </div>
  );
}

export default AppointmentsPage;
