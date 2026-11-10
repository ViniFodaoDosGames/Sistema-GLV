import React, { useMemo, useState } from 'react';
import { Download, TrendingUp } from '@mui/icons-material';
import MetricCard from '../components/MetricCard';
import { useAppData } from '../context/AppDataContext';
import { formatCurrency, toDateInputValue } from '../utils/format';

function ReportsPage() {
  const { data } = useAppData();
  const [activeTab, setActiveTab] = useState('operacional');
  const [period, setPeriod] = useState('30');
  const [serviceFilter, setServiceFilter] = useState('todos');
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - Number(period));
  const startDateValue = toDateInputValue(startDate);
  const todayValue = toDateInputValue();
  const completed = useMemo(() => data.Agendamentos.filter((appointment) =>
    appointment.dataHora.slice(0, 10) >= startDateValue
    && appointment.dataHora.slice(0, 10) <= todayValue
    && (serviceFilter === 'todos' || appointment.idServico === serviceFilter)
  ), [data.Agendamentos, serviceFilter, startDateValue, todayValue]);
  const periodPayments = data.Pagamentos.filter((payment) =>
    payment.status === 'APROVADO'
    && payment.dataHora.slice(0, 10) >= startDateValue
    && payment.dataHora.slice(0, 10) <= todayValue
    && (serviceFilter === 'todos' || data.Agendamentos.find((appointment) => appointment.id === payment.idAgendamento)?.idServico === serviceFilter)
  );
  const paid = periodPayments;
  const revenue = paid.reduce((sum, payment) => sum + Number(payment.valor || 0), 0);
  const finished = completed.filter((appointment) => appointment.status === 'CONCLUIDO').length;
  const noShows = completed.filter((appointment) => appointment.status === 'NAO_COMPARECEU').length;
  const totalPoints = data.LotesPontos
    .filter((lot) => lot.geradoEm >= startDateValue && lot.geradoEm <= todayValue)
    .reduce((sum, lot) => sum + Number(lot.quantidade || 0), 0);
  const dailyVolumes = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => ({
    day,
    count: Math.max(1, completed.filter((item) => new Date(item.dataHora.replace(' ', 'T')).getDay() === (index + 1)).length),
  }));
  const maxVolume = Math.max(...dailyVolumes.map((item) => item.count), 1);

  return (
    <div className="page-stack">
      <section className="panel report-filter-panel">
        <div className="report-tabs" role="tablist">
          <button type="button" className={`tab-button${activeTab === 'operacional' ? ' is-active' : ''}`} onClick={() => setActiveTab('operacional')}>Operacional</button>
          <button type="button" className={`tab-button${activeTab === 'financeiro' ? ' is-active' : ''}`} onClick={() => setActiveTab('financeiro')}>Financeiro</button>
        </div>
        <div className="report-filters">
          <label className="field-group"><span className="field-label">Período</span><select value={period} onChange={(event) => setPeriod(event.target.value)}><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option></select></label>
          <label className="field-group"><span className="field-label">Serviço</span><select value={serviceFilter} onChange={(event) => setServiceFilter(event.target.value)}><option value="todos">Todos os serviços</option>{data.Servicos.map((service) => <option key={service.id} value={service.id}>{service.nome}</option>)}</select></label>
          <button type="button" className="button button-outline" onClick={() => window.print()}><Download fontSize="small" /> Exportar PDF</button>
        </div>
      </section>

      {activeTab === 'operacional' ? (
        <>
          <section className="metrics-grid">
            <MetricCard label="Veículos atendidos" value={finished} note={`últimos ${period} dias`} Icon={TrendingUp} tone="blue" />
            <MetricCard label="Taxa de ocupação" value={`${Math.min(100, Math.round((finished / Math.max(1, completed.length)) * 100))}%`} note="média da capacidade" Icon={TrendingUp} tone="gold" />
            <MetricCard label="Não comparecimento" value={`${Math.round((noShows / Math.max(1, completed.length)) * 100)}%`} note={`${noShows} no-show`} Icon={TrendingUp} tone="gray" />
          </section>
          <section className="report-grid">
            <article className="panel chart-panel"><div className="section-title-row"><div><h2>Atendimentos por dia</h2><p>Volume de serviços concluídos na semana.</p></div></div>
              <div className="bar-chart">{dailyVolumes.map((item) => <div className="bar-chart-column" key={item.day}><span>{item.count}</span><div className="bar-track"><i style={{ height: `${Math.max(14, (item.count / maxVolume) * 100)}%` }} /></div><small>{item.day}</small></div>)}</div>
            </article>
            <article className="panel chart-panel report-summary"><span className="eyebrow">RESUMO DO PERÍODO</span><h2>Agenda em foco</h2><p>Atendimentos registrados: <strong>{completed.length}</strong></p><p>Serviços ativos: <strong>{data.Servicos.filter((service) => service.ativo).length}</strong></p><p>Posições da unidade: <strong>{data.LavaJatos[0]?.totalPosicoes || 0}</strong></p></article>
          </section>
        </>
      ) : (
        <>
          <section className="metrics-grid">
            <MetricCard label="Faturamento" value={formatCurrency(revenue)} note={`últimos ${period} dias`} Icon={TrendingUp} tone="blue" />
            <MetricCard label="Pontos gerados" value={totalPoints} note="créditos registrados" Icon={TrendingUp} tone="gold" />
            <MetricCard label="Pontos usados" value={data.PagamentosLotesPontos.length ? data.LotesPontos.reduce((sum, lot) => sum + Math.max(0, Number(lot.quantidade) - Number(lot.saldo)), 0) : 0} note="resgates vinculados" Icon={TrendingUp} tone="gray" />
            <MetricCard label="Pontos expirados" value={data.LotesPontos.filter((lot) => new Date(`${lot.expiraEm}T23:59:59`) < new Date()).reduce((sum, lot) => sum + Number(lot.saldo || 0), 0)} note="saldo vencido" Icon={TrendingUp} tone="gold" />
          </section>
          <section className="panel chart-panel report-summary"><span className="eyebrow">DESEMPENHO FINANCEIRO</span><h2>Receita por serviço</h2>
            <div className="service-revenue-list">{data.Servicos.map((service) => {
              const serviceRevenue = paid.reduce((total, payment) => {
                const appointment = data.Agendamentos.find((item) => item.id === payment.idAgendamento && item.idServico === service.id);
                return total + (appointment ? Number(payment.valor) : 0);
              }, 0);
              return <div className="service-revenue-row" key={service.id}><span>{service.nome}</span><div className="revenue-track"><i style={{ width: `${revenue ? (serviceRevenue / revenue) * 100 : 0}%` }} /></div><strong>{formatCurrency(serviceRevenue)}</strong></div>;
            })}</div>
          </section>
        </>
      )}
      <p className="demo-notice">Relatórios demonstrativos calculados a partir dos dados locais desta aplicação.</p>
    </div>
  );
}

export default ReportsPage;
