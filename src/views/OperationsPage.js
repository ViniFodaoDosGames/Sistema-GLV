import React, { useMemo, useState } from 'react';
import { Add, DirectionsCar, Search } from '@mui/icons-material';
import CheckOutConfirmationDialog from '../components/CheckOutConfirmationDialog';
import CheckinDetailDialog from '../components/CheckinDetailDialog';
import Modal from '../components/Modal';
import NewAppointmentDialog from '../components/NewAppointmentDialog';
import Pagination from '../components/Pagination';
import PaymentDialog from '../components/PaymentDialog';
import StatusBadge from '../components/StatusBadge';
import { useAppData } from '../context/AppDataContext';
import { formatDateTime, getCustomerUser, getService, getVehicle, toDateInputValue, toDateTimeValue } from '../utils/format';

function OperationsPage({ session }) {
  const { data, createRecord, updateCollection } = useAppData();
  const [activeTab, setActiveTab] = useState('checkin');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedCheckout, setSelectedCheckout] = useState(null);
  const [selectCustomerOpen, setSelectCustomerOpen] = useState(false);
  const [bookingCustomerId, setBookingCustomerId] = useState('');
  const [walkInPayment, setWalkInPayment] = useState(null);
  const employeeId = session.role === 'administrador'
    ? data.Administradores.find((admin) => admin.id === session.profileId)?.idFuncionario
    : session.profileId;

  const appointments = useMemo(() => data.Agendamentos
    .filter((appointment) => activeTab === 'checkin'
      ? appointment.status === 'CONFIRMADO'
      : appointment.status === 'EM_ANDAMENTO')
    .filter((appointment) => {
      const vehicle = getVehicle(data, appointment.idVeiculo);
      const customer = getCustomerUser(data, appointment.idCliente);
      return `${vehicle?.placa || ''} ${customer?.nome || ''} ${getService(data, appointment.idServico)?.nome || ''}`
        .toLowerCase().includes(query.toLowerCase());
    })
    .sort((a, b) => a.dataHora.localeCompare(b.dataHora)), [data, activeTab, query]);
  const pageSize = 8;
  const visibleAppointments = appointments.slice((page - 1) * pageSize, page * pageSize);

  const addLog = (type, appointment, observation) => {
    createRecord('LogsMovimentacao', {
      tipo: type,
      dataHora: toDateTimeValue(),
      observacao: observation,
      idAgendamento: appointment.id,
      idFuncionario: employeeId,
    });
  };

  const handleCheckIn = (appointment, observation) => {
    updateCollection('Agendamentos', (items) =>
      items.map((item) => item.id === appointment.id ? { ...item, status: 'EM_ANDAMENTO' } : item)
    );
    addLog('ENTRADA', appointment, observation || 'Check-in realizado.');
    setSelectedAppointment(null);
  };

  const handleCheckOut = (appointment) => {
    updateCollection('Agendamentos', (items) =>
      items.map((item) => item.id === appointment.id ? { ...item, status: 'CONCLUIDO' } : item)
    );
    addLog('SAIDA', appointment, 'Veículo entregue ao cliente.');
    const service = getService(data, appointment.idServico);
    const alreadyCredited = data.LotesPontos.some((lot) => lot.idAgendamento === appointment.id && lot.tipo === 'FIDELIDADE');
    if (!alreadyCredited && service) {
      const generated = new Date();
      const expires = new Date(generated);
      expires.setDate(expires.getDate() + Number(data.LavaJatos[0]?.validadePontosFidelidade || 365));
      createRecord('LotesPontos', {
        tipo: 'FIDELIDADE',
        quantidade: Number(service.pontosGerados),
        saldo: Number(service.pontosGerados),
        geradoEm: toDateInputValue(generated),
        expiraEm: toDateInputValue(expires),
        idCliente: appointment.idCliente,
        idAgendamento: appointment.id,
      });
    }
    if (service?.notificaConclusao) {
      createRecord('Notificacoes', {
        canal: 'WHATSAPP',
        mensagem: `O serviço ${service.nome} foi concluído.`,
        dataHora: toDateTimeValue(),
        idCliente: appointment.idCliente,
        idAgendamento: appointment.id,
        statusEnvio: 'ENVIADA',
      });
    }
  };

  const customerForBooking = data.Clientes.find((customer) => customer.id === bookingCustomerId);
  const booking = (values) => {
    const appointment = createRecord('Agendamentos', { ...values, walkIn: true });
    setBookingCustomerId('');
    setWalkInPayment(appointment);
  };

  const availableCount = data.Agendamentos.filter((item) => item.status === 'CONFIRMADO').length;
  const inProgressCount = data.Agendamentos.filter((item) => item.status === 'EM_ANDAMENTO').length;

  return (
    <div className="page-stack">
      <section className="page-intro-row">
        <p className="muted-copy">Busque pela placa, confira os dados do veículo e atualize cada etapa da operação.</p>
        <button className="button button-primary" type="button" onClick={() => setSelectCustomerOpen(true)}><Add fontSize="small" /> Novo walk-in</button>
      </section>
      <section className="metrics-grid metrics-grid--compact">
        <div className="operation-summary panel"><span className="summary-icon"><DirectionsCar fontSize="small" /></span><span><strong>{availableCount}</strong><small>na fila</small></span></div>
        <div className="operation-summary panel"><span className="summary-icon summary-icon--gold"><DirectionsCar fontSize="small" /></span><span><strong>{inProgressCount}</strong><small>em atendimento</small></span></div>
      </section>
      <section className="panel operations-panel">
        <div className="tabs-row" role="tablist" aria-label="Tipo de atendimento">
          <button role="tab" aria-selected={activeTab === 'checkin'} className={`tab-button${activeTab === 'checkin' ? ' is-active' : ''}`} onClick={() => { setActiveTab('checkin'); setPage(1); }}>Check-in <span>{availableCount}</span></button>
          <button role="tab" aria-selected={activeTab === 'checkout'} className={`tab-button${activeTab === 'checkout' ? ' is-active' : ''}`} onClick={() => { setActiveTab('checkout'); setPage(1); }}>Check-out <span>{inProgressCount}</span></button>
        </div>
        <div className="operations-toolbar">
          <div><h2>{activeTab === 'checkin' ? 'Veículos aguardando chegada' : 'Veículos em atendimento'}</h2><p>{appointments.length} atendimento{appointments.length === 1 ? '' : 's'} na lista</p></div>
          <label className="search-field"><Search fontSize="small" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Procurar pela placa" /></label>
        </div>
        {appointments.length ? (
          <div className="table-scroll">
            <table className="data-table operations-table">
              <thead><tr><th>Fila</th><th>Cliente / Veículo</th><th>Serviço</th><th>Data e hora</th><th>Status</th><th>Ação</th></tr></thead>
              <tbody>
                {visibleAppointments.map((appointment) => {
                  const vehicle = getVehicle(data, appointment.idVeiculo);
                  const customer = getCustomerUser(data, appointment.idCliente);
                  return (
                    <tr key={appointment.id}>
                      <td><span className="queue-number">{appointment.posicaoFila || '—'}</span></td>
                      <td><strong>{customer?.nome || 'Cliente'}</strong><small>{vehicle?.placa} · {vehicle?.brand?.nome} {vehicle?.model?.nome} · {vehicle?.color?.nome}</small></td>
                      <td>{getService(data, appointment.idServico)?.nome || '—'}</td>
                      <td>{formatDateTime(appointment.dataHora)}</td>
                      <td><StatusBadge status={appointment.status} /></td>
                      <td className="table-actions">
                        {activeTab === 'checkin' ? (
                          <button className="button button-primary button-small" type="button" onClick={() => setSelectedAppointment(appointment)}>Check-in</button>
                        ) : (
                          <button className="button button-outline button-small" type="button" onClick={() => setSelectedCheckout(appointment)}>Concluir e check-out</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-empty table-empty--large"><span className="empty-icon"><DirectionsCar /></span><strong>Nenhum veículo {activeTab === 'checkin' ? 'aguardando check-in' : 'em atendimento'}</strong><span>Os atendimentos aparecerão nesta lista quando estiverem prontos.</span></div>
        )}
        <Pagination page={page} pageSize={pageSize} total={appointments.length} onPageChange={setPage} />
      </section>

      <CheckinDetailDialog
        appointment={selectedAppointment}
        data={data}
        onClose={() => setSelectedAppointment(null)}
        onCheckIn={handleCheckIn}
      />
      <CheckOutConfirmationDialog
        appointment={selectedCheckout}
        data={data}
        onClose={() => setSelectedCheckout(null)}
        onConfirm={(appointment) => {
          handleCheckOut(appointment);
          setSelectedCheckout(null);
        }}
      />
      <Modal open={selectCustomerOpen} title="Iniciar agendamento walk-in" onClose={() => setSelectCustomerOpen(false)}>
        <p>Selecione o cliente que chegou ao balcão para consultar os horários disponíveis.</p>
        <div className="field-group"><label className="field-label" htmlFor="walkin-customer">Cliente *</label>
          <select id="walkin-customer" value={bookingCustomerId} onChange={(event) => setBookingCustomerId(event.target.value)}>
            <option value="">Selecione um cliente</option>
            {data.Clientes.map((customer) => <option value={customer.id} key={customer.id}>{getCustomerUser(data, customer.id)?.nome || customer.id}</option>)}
          </select>
        </div>
        <div className="modal-actions"><button className="button button-quiet" type="button" onClick={() => setSelectCustomerOpen(false)}>Cancelar</button><button className="button button-primary" type="button" disabled={!bookingCustomerId} onClick={() => setSelectCustomerOpen(false)}>Escolher veículo e horário</button></div>
      </Modal>
      <NewAppointmentDialog
        open={Boolean(customerForBooking)}
        onClose={() => setBookingCustomerId('')}
        customerId={customerForBooking?.id}
        onBook={booking}
      />
      <PaymentDialog
        appointment={walkInPayment}
        customerId={walkInPayment?.idCliente}
        employeeId={employeeId}
        onClose={() => setWalkInPayment(null)}
        onPaid={() => setWalkInPayment(null)}
      />
    </div>
  );
}

export default OperationsPage;
