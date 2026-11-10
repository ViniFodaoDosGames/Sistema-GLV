import React, { useMemo, useState } from 'react';
import { Search, Stars } from '@mui/icons-material';
import { useAppData } from '../context/AppDataContext';
import { formatDate, getCustomerIdForSession, getService } from '../utils/format';

function PointsPage({ session }) {
  const { data } = useAppData();
  const customerId = getCustomerIdForSession(data, session);
  const [query, setQuery] = useState('');
  const lots = useMemo(() => data.LotesPontos
    .filter((lot) => lot.idCliente === customerId)
    .filter((lot) => {
      const appointment = data.Agendamentos.find((item) => item.id === lot.idAgendamento);
      const service = getService(data, appointment?.idServico);
      return `${service?.nome || 'Crédito manual'} ${lot.tipo}`.toLowerCase().includes(query.toLowerCase());
    })
    .sort((a, b) => b.geradoEm.localeCompare(a.geradoEm)), [data, customerId, query]);
  const activeLots = lots.filter((lot) => Number(lot.saldo) > 0 && new Date(`${lot.expiraEm}T23:59:59`) >= new Date());
  const pointsBalance = activeLots.reduce((total, lot) => total + Number(lot.saldo || 0), 0);

  return (
    <div className="page-stack">
      <section className="points-hero panel">
        <div className="points-hero-copy">
          <span className="eyebrow">PROGRAMA DE FIDELIDADE</span>
          <h2>Seus pontos, novas possibilidades.</h2>
          <p>Acumule pontos a cada atendimento concluído e use o saldo em um resgate integral.</p>
        </div>
        <div className="points-total"><Stars /><strong>{pointsBalance}</strong><span>pontos disponíveis</span></div>
      </section>

      <section className="section-title-row">
        <div><h2>Extrato de pontos</h2><p>Consulte seus créditos e os prazos de validade.</p></div>
        <span className="results-count">{lots.length} lote{lots.length === 1 ? '' : 's'}</span>
      </section>
      <section className="panel filter-panel">
        <label className="search-field"><Search fontSize="small" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por serviço de origem" /></label>
      </section>
      <section className="points-grid">
        {lots.map((lot) => {
          const appointment = data.Agendamentos.find((item) => item.id === lot.idAgendamento);
          const service = getService(data, appointment?.idServico);
          const expired = new Date(`${lot.expiraEm}T23:59:59`) < new Date();
          return (
            <article className="point-lot-card" key={lot.id}>
              <div className="lot-topline"><span className={`lot-type${lot.tipo === 'COMPENSACAO' ? ' lot-type--compensation' : ''}`}>{lot.tipo === 'COMPENSACAO' ? 'Compensação' : 'Fidelidade'}</span><Stars fontSize="small" /></div>
              <h3>{service?.nome || 'Crédito de pontos'}</h3>
              <p className="lot-source">Origem: {service?.nome || 'Ajuste de saldo'}</p>
              <div className="lot-progress"><span style={{ width: `${lot.quantidade ? Math.min(100, (lot.saldo / lot.quantidade) * 100) : 0}%` }} /></div>
              <div className="lot-numbers"><span><strong>{lot.saldo}</strong> disponíveis</span><span>{lot.quantidade} gerados</span></div>
              <div className="lot-dates"><span>Gerado em <strong>{formatDate(lot.geradoEm)}</strong></span><span className={expired ? 'expired-copy' : ''}>{expired ? 'Expirado em ' : 'Expira em '}<strong>{formatDate(lot.expiraEm)}</strong></span></div>
            </article>
          );
        })}
        {!lots.length && <div className="empty-state panel"><span className="empty-icon"><Stars /></span><h2>Nenhum lote encontrado</h2><p>Seu extrato de pontos aparecerá aqui.</p></div>}
      </section>
    </div>
  );
}

export default PointsPage;
