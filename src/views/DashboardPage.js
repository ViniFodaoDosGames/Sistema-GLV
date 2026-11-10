import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarMonth,
  CheckCircle,
  DirectionsCar,
  Groups,
  LocalCarWash,
  Payments,
  Stars,
  TrendingUp,
} from '@mui/icons-material';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { useAppData } from '../context/AppDataContext';
import {
  formatCurrency,
  formatDateTime,
  getCustomerIdForSession,
  getCustomerUser,
  getService,
  getVehicle,
  toDateInputValue,
} from '../utils/format';

function AppointmentTable({ appointments, data, showCustomer = false }) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead><tr><th>Atendimento</th>{showCustomer && <th>Cliente</th>}<th>Data e hora</th><th>Status</th><th>Valor</th></tr></thead>
        <tbody>
          {appointments.map((appointment) => {
            const service = getService(data, appointment.idServico);
            const vehicle = getVehicle(data, appointment.idVeiculo);
            return (
              <tr key={appointment.id}>
                <td><strong>{service?.nome || 'Serviço'}</strong><small>{vehicle?.placa || 'Veículo'}</small></td>
                {showCustomer && <td>{getCustomerUser(data, appointment.idCliente)?.nome || 'Cliente'}</td>}
                <td>{formatDateTime(appointment.dataHora)}</td>
                <td><StatusBadge status={appointment.status} /></td>
                <td>{formatCurrency(appointment.valor)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!appointments.length && <div className="table-empty">Nenhum atendimento cadastrado.</div>}
    </div>
  );
}

function DashboardPage({ session }) {
  const { data } = useAppData();
  const today = toDateInputValue();
  const customerId = getCustomerIdForSession(data, session);
  const appointments = data.Agendamentos.filter((item) =>
    session.role === 'cliente' ? item.idCliente === customerId : true
  );
  const upcoming = appointments
    .filter((item) => item.status !== 'CANCELADO' && item.status !== 'CONCLUIDO')
    .sort((a, b) => a.dataHora.localeCompare(b.dataHora));
  const todayAppointments = data.Agendamentos.filter((item) => item.dataHora.startsWith(today));
  const availablePoints = data.LotesPontos
    .filter((lot) => lot.idCliente === customerId && new Date(`${lot.expiraEm}T23:59:59`) >= new Date())
    .reduce((sum, lot) => sum + Number(lot.saldo || 0), 0);
  const approvedRevenue = data.Pagamentos
    .filter((payment) => payment.status === 'APROVADO')
    .reduce((sum, payment) => sum + Number(payment.valor || 0), 0);

  const greeting = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const introByRole = {
    cliente: 'Tudo o que você precisa para cuidar bem do seu carro.',
    funcionario: 'Acompanhe a fila e registre os atendimentos do dia.',
    administrador: 'Acompanhe a operação e os principais indicadores do lava-jato.',
  };

  return (
    <div className="page-stack">
      <section className="welcome-banner">
        <div><span className="eyebrow">{greeting}</span><h2>Olá, {session.user.nome} <span aria-hidden="true">👋</span></h2><p>{introByRole[session.role]}</p></div>
        {session.role === 'cliente' && <Link className="button button-light" to="/cliente/novo-agendamento"><CalendarMonth fontSize="small" /> Agendar lavagem</Link>}
        {session.role !== 'cliente' && <Link className="button button-light" to="/operacao/atendimentos"><CheckCircle fontSize="small" /> Abrir atendimentos</Link>}
      </section>

      {session.role === 'cliente' && (
        <>
          <section className="metrics-grid">
            <MetricCard label="Próximo atendimento" value={upcoming.length || 0} note="na sua agenda" Icon={CalendarMonth} tone="blue" />
            <MetricCard label="Pontos disponíveis" value={availablePoints} note="na carteira de fidelidade" Icon={Stars} tone="gold" />
            <MetricCard label="Meus veículos" value={data.ClientesVeiculos.filter((link) => link.idCliente === customerId).length} note="cadastrados na conta" Icon={DirectionsCar} tone="gray" />
          </section>
          <section className="panel content-panel">
            <div className="section-title-row"><div><h2>Seus próximos atendimentos</h2><p>Consulte o status e os detalhes da sua agenda.</p></div><Link className="text-link" to="/cliente/agendamentos">Ver todos <span>→</span></Link></div>
            <AppointmentTable appointments={upcoming.slice(0, 4)} data={data} />
          </section>
          <section className="dashboard-promo panel"><div className="promo-icon"><Stars /></div><div><h3>Fidelidade que faz bem para o seu carro</h3><p>A cada atendimento concluído, você acumula pontos para usar em uma próxima lavagem.</p></div><Link className="button button-outline" to="/cliente/pontos">Ver meus pontos</Link></section>
        </>
      )}

      {session.role === 'funcionario' && (
        <>
          <section className="metrics-grid">
            <MetricCard label="Atendimentos hoje" value={todayAppointments.length} note="agendados para hoje" Icon={CalendarMonth} tone="blue" />
            <MetricCard label="Na fila" value={todayAppointments.filter((item) => item.status === 'CONFIRMADO').length} note="aguardando check-in" Icon={LocalCarWash} tone="gold" />
            <MetricCard label="Em andamento" value={todayAppointments.filter((item) => item.status === 'EM_ANDAMENTO').length} note="veículos em serviço" Icon={DirectionsCar} tone="gray" />
          </section>
          <section className="panel content-panel">
            <div className="section-title-row"><div><h2>Fila de atendimento</h2><p>Os atendimentos do dia em um só lugar.</p></div><Link className="button button-primary button-small" to="/operacao/atendimentos">Ver fila completa</Link></div>
            <AppointmentTable appointments={todayAppointments.slice(0, 5)} data={data} showCustomer />
          </section>
        </>
      )}

      {session.role === 'administrador' && (
        <>
          <section className="metrics-grid">
            <MetricCard label="Agendamentos hoje" value={todayAppointments.length} note="todos os serviços" Icon={CalendarMonth} tone="blue" />
            <MetricCard label="Veículos atendidos" value={data.Agendamentos.filter((item) => item.status === 'CONCLUIDO').length} note="total concluído" Icon={DirectionsCar} tone="gray" />
            <MetricCard label="Faturamento registrado" value={formatCurrency(approvedRevenue)} note="pagamentos aprovados" Icon={Payments} tone="gold" />
            <MetricCard label="Clientes ativos" value={data.Clientes.length} note="na base de clientes" Icon={Groups} tone="blue" />
          </section>
          <section className="dashboard-admin-grid">
            <div className="panel content-panel">
              <div className="section-title-row"><div><h2>Movimento recente</h2><p>Agendamentos e status da operação.</p></div><Link className="text-link" to="/admin/relatorios">Ver relatórios <span>→</span></Link></div>
              <AppointmentTable appointments={data.Agendamentos.slice(-5).reverse()} data={data} showCustomer />
            </div>
            <aside className="panel quick-actions-panel"><span className="eyebrow">ATALHOS</span><h2>Gestão rápida</h2>
              <Link to="/admin/cadastros/Servicos"><LocalCarWash fontSize="small" /> Gerenciar serviços</Link>
              <Link to="/admin/cadastros/Usuarios"><Groups fontSize="small" /> Usuários e equipe</Link>
              <Link to="/admin/pagamentos"><Payments fontSize="small" /> Pagamentos</Link>
              <Link to="/admin/relatorios"><TrendingUp fontSize="small" /> Abrir relatórios</Link>
            </aside>
          </section>
        </>
      )}
    </div>
  );
}

export default DashboardPage;
