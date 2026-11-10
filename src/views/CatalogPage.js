import React, { useEffect, useMemo, useState } from 'react';
import { Add, Edit, Search, Visibility } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import CatalogRecordDialog from '../components/CatalogRecordDialog';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import { useAppData } from '../context/AppDataContext';
import { formatCurrency, formatDateTime, getCustomerUser, getService, getVehicle } from '../utils/format';

const collectionLabels = {
  Agendamentos: 'Agendamentos',
  Administradores: 'Administradores',
  Bloqueios: 'Bloqueios',
  CategoriasVeiculo: 'Categorias de veículos',
  Clientes: 'Clientes',
  Cores: 'Cores',
  Feriados: 'Feriados',
  Funcionarios: 'Funcionários',
  HorariosFuncionamento: 'Horários de funcionamento',
  IntervalosAlmoco: 'Intervalos de almoço',
  LavaJatos: 'Lava-jato',
  LogsMovimentacao: 'Log de movimentações',
  LotesPontos: 'Lotes de pontos',
  Marcas: 'Marcas',
  Modelos: 'Modelos',
  Notificacoes: 'Notificações',
  Pagamentos: 'Pagamentos',
  Servicos: 'Serviços',
  TiposFeriado: 'Tipos de feriado',
  Usuarios: 'Usuários',
  Veiculos: 'Veículos',
};

const fieldLabels = {
  id: 'Código',
  nome: 'Nome',
  placa: 'Placa',
  ano: 'Ano',
  preco: 'Preço',
  pontosGerados: 'Pontos',
  vagas: 'Vagas',
  dataHora: 'Data e hora',
  data: 'Data',
  status: 'Status',
  ativo: 'Status',
  forma: 'Forma',
  valor: 'Valor',
  tipo: 'Tipo',
  saldo: 'Saldo',
  quantidade: 'Quantidade',
  canal: 'Canal',
  observacao: 'Observação',
  aberto: 'Aberto',
  diaSemana: 'Dia',
};

function resolveCell(data, collection, record, field) {
  if (field === 'status' || field === 'ativo' || field === 'aberto') {
    return <StatusBadge status={record[field] ? 'ATIVO' : 'INATIVO'} />;
  }
  if (field === 'preco' || field === 'valor') return formatCurrency(record[field]);
  if (field === 'dataHora') return formatDateTime(record[field]);
  if (field === 'data' || field === 'geradoEm' || field === 'expiraEm') {
    const raw = record[field];
    if (!raw) return '—';
    const [year, month, day] = raw.slice(0, 10).split('-');
    return `${day}/${month}/${year}`;
  }
  if (field === 'idUsuario') return data.Usuarios.find((user) => user.id === record.idUsuario)?.nome || record[field];
  if (field === 'idFuncionario') {
    const employee = data.Funcionarios.find((item) => item.id === record.idFuncionario);
    return data.Usuarios.find((user) => user.id === employee?.idUsuario)?.nome || record[field];
  }
  if (field === 'idCliente') return getCustomerUser(data, record.idCliente)?.nome || record[field];
  if (field === 'idVeiculo') return getVehicle(data, record.idVeiculo)?.placa || record[field];
  if (field === 'idServico') return getService(data, record.idServico)?.nome || record[field];
  if (field === 'idModelo') return data.Modelos.find((item) => item.id === record.idModelo)?.nome || record[field];
  if (field === 'idMarca') return data.Marcas.find((item) => item.id === record.idMarca)?.nome || record[field];
  if (field === 'idCor') return data.Cores.find((item) => item.id === record.idCor)?.nome || record[field];
  if (typeof record[field] === 'boolean') return record[field] ? 'Sim' : 'Não';
  return record[field] ?? '—';
}

function CatalogPage({ session, fixedCollection }) {
  const { collection: routeCollection } = useParams();
  const collection = fixedCollection || routeCollection;
  const { data, createRecord, updateRecord, deleteRecord } = useAppData();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [refundTarget, setRefundTarget] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const collectionData = Array.isArray(data[collection]) ? data[collection] : null;
  const title = collectionLabels[collection] || collection;
  const readOnly = collection === 'LogsMovimentacao' || collection === 'Notificacoes';
  const canCreate = !readOnly && !['Pagamentos', 'Agendamentos', 'Veiculos', 'ClientesVeiculos'].includes(collection);
  const sample = collectionData?.[0] || data[collection]?.[0];
  const columns = useMemo(() => {
    if (!sample) return [];
    return Object.keys(sample).filter((key) => key !== 'senha').slice(0, 6);
  }, [sample]);
  const rows = useMemo(() => (collectionData || [])
    .filter((record) => Object.entries(record).some(([key, value]) => key !== 'senha' && String(value ?? '').toLowerCase().includes(query.toLowerCase())))
    .slice()
    .reverse(), [collectionData, query]);
  const pageSize = 8;
  const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
    setQuery('');
  }, [collection]);

  if (!collectionData || collection === '$schema') {
    return <section className="empty-state panel"><h2>Cadastro indisponível</h2><p>Não encontramos dados para esta área.</p></section>;
  }

  const referenced = (record) => Object.entries(data).some(([key, values]) =>
    key !== collection && Array.isArray(values) && values.some((item) =>
      Object.entries(item).some(([field, value]) => field.startsWith('id') && value === record.id)
    )
  );

  const handleSave = (values) => {
    if (editing) updateRecord(collection, editing.id, values);
    else createRecord(collection, values);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (referenced(deleteTarget)) {
      if (Object.prototype.hasOwnProperty.call(deleteTarget, 'ativo')) {
        updateRecord(collection, deleteTarget.id, { ativo: false });
        setDeleteMessage('Este registro já está vinculado a outros dados e foi inativado para preservar o histórico.');
      } else {
        setDeleteMessage('Este registro está vinculado a dados ou ao histórico e não pode ser excluído.');
      }
      return;
    }
    deleteRecord(collection, deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleRefund = () => {
    if (!refundTarget || !refundReason.trim()) return;
    updateRecord('Pagamentos', refundTarget.id, { status: 'ESTORNADO', justificativaEstorno: refundReason.trim() });
    setRefundTarget(null);
    setRefundReason('');
  };

  const actionTitle = readOnly ? 'Registros para consulta' : `${rows.length} registro${rows.length === 1 ? '' : 's'}`;

  return (
    <div className="page-stack">
      <section className="page-intro-row">
        <div><p className="muted-copy">{readOnly ? 'Histórico mantido para consulta e auditoria.' : 'Consulte e mantenha os dados desta área.'}</p></div>
        {canCreate && <button className="button button-primary" type="button" onClick={() => { setEditing(null); setEditorOpen(true); }}><Add fontSize="small" /> Novo cadastro</button>}
      </section>
      <section className="panel catalog-panel">
        <div className="catalog-toolbar">
          <div><h2>{title}</h2><p>{actionTitle}</p></div>
          <label className="search-field"><Search fontSize="small" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Buscar registros" /></label>
        </div>
        {rows.length ? (
          <div className="table-scroll">
            <table className="data-table catalog-table">
              <thead><tr>{columns.map((field) => <th key={field}>{fieldLabels[field] || field}</th>)}<th>Ações</th></tr></thead>
              <tbody>
                {visibleRows.map((record) => (
                  <tr key={record.id}>
                    {columns.map((field) => <td key={field}>{resolveCell(data, collection, record, field)}</td>)}
                    <td className="table-actions">
                      <button className="icon-button" type="button" aria-label="Visualizar" title="Visualizar" onClick={() => setSelectedRecord(record)}><Visibility fontSize="small" /></button>
                      {!readOnly && collection !== 'Pagamentos' && <button className="icon-button" type="button" aria-label="Editar" title="Editar" onClick={() => { setEditing(record); setEditorOpen(true); }}><Edit fontSize="small" /></button>}
                      {!readOnly && collection !== 'Pagamentos' && <button className="icon-button icon-button--danger" type="button" aria-label="Excluir" title="Excluir" onClick={() => { setDeleteTarget(record); setDeleteMessage(''); }}><span>×</span></button>}
                      {collection === 'Pagamentos' && record.status === 'APROVADO' && <button className="button button-quiet button-small" type="button" onClick={() => setRefundTarget(record)}>Registrar estorno</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-empty table-empty--large"><strong>Nenhum registro encontrado</strong><span>Ajuste a busca ou adicione um novo cadastro.</span></div>
        )}
        <Pagination page={page} pageSize={pageSize} total={rows.length} onPageChange={setPage} />
      </section>
      <CatalogRecordDialog
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        collection={title}
        record={editing}
        sample={sample}
        onSave={handleSave}
      />
      <Modal open={Boolean(selectedRecord)} title={`Detalhes · ${title}`} onClose={() => setSelectedRecord(null)}>
        {selectedRecord && <div className="detail-grid">{Object.entries(selectedRecord).filter(([key]) => key !== 'senha').map(([key, value]) => (
          <div className="detail-item" key={key}><small>{fieldLabels[key] || key}</small><strong>{String(value ?? '—')}</strong></div>
        ))}</div>}
      </Modal>
      <Modal open={Boolean(deleteTarget)} title="Excluir cadastro" onClose={() => { setDeleteTarget(null); setDeleteMessage(''); }}>
        <p>{deleteMessage || 'Deseja excluir este registro? Essa ação não poderá ser desfeita.'}</p>
        <div className="modal-actions"><button type="button" className="button button-quiet" onClick={() => { setDeleteTarget(null); setDeleteMessage(''); }}>{deleteMessage ? 'Fechar' : 'Cancelar'}</button>{!deleteMessage && <button type="button" className="button button-danger" onClick={handleDelete}>Confirmar exclusão</button>}</div>
      </Modal>
      <Modal open={Boolean(refundTarget)} title="Registrar estorno" onClose={() => { setRefundTarget(null); setRefundReason(''); }}>
        <p>O estorno financeiro deve ser executado no painel do gateway. Esta ação registra o status e a justificativa no histórico local.</p>
        <div className="field-group"><label className="field-label" htmlFor="refund-reason">Justificativa *</label><textarea id="refund-reason" rows="3" value={refundReason} onChange={(event) => setRefundReason(event.target.value)} /></div>
        <div className="modal-actions"><button className="button button-quiet" type="button" onClick={() => setRefundTarget(null)}>Cancelar</button><button className="button button-danger" type="button" disabled={!refundReason.trim()} onClick={handleRefund}>Registrar estorno</button></div>
      </Modal>
    </div>
  );
}

export default CatalogPage;
