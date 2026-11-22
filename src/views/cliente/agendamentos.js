import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Card from '../../components/card';
import Modal from '../../components/modal';
import Paginacao from '../../components/paginacao';
import { mensagemSucesso, mensagemErro } from '../../components/toastr';

import '../../custom.css';

import { carregar, alterar } from '../../config/api';
import { obterSessao, ehFuncionario } from '../../config/sessao';
import { formatarMoeda, STATUS_AGENDAMENTO } from '../../config/util';
import {
  detalharAgendamento,
  podeAlterarAgendamento,
  creditarCompensacao,
  custoResgate,
  registrarNotificacao,
  PRAZO_CANCELAMENTO_MIN,
} from '../../config/agenda';

const POR_PAGINA = 9;

function Agendamentos() {
  const navigate = useNavigate();
  const sessao = obterSessao();
  const equipe = ehFuncionario(sessao);

  const [db, setDb] = useState(null);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroServico, setFiltroServico] = useState('');
  const [pagina, setPagina] = useState(1);
  const [cancelando, setCancelando] = useState(null);
  const [erroCancelamento, setErroCancelamento] = useState('');

  async function buscar() {
    try {
      const dados = await carregar([
        'Agendamentos', 'Servicos', 'Veiculos', 'Modelos', 'Marcas', 'Cores',
        'Clientes', 'Usuarios', 'Pagamentos', 'LavaJatos',
      ]);
      setDb(dados);
    } catch (erro) {
      mensagemErro('Erro ao carregar os agendamentos');
    }
  }

  useEffect(() => {
    buscar();
  }, []);

  if (!db) return null;

  const itens = db.Agendamentos
    .filter((a) => equipe || a.idCliente === sessao.idCliente)
    .map((a) => ({ ...a, info: detalharAgendamento(a, db) }))
    .filter((a) => !filtroStatus || a.status === filtroStatus)
    .filter((a) => !filtroServico || a.idServico === filtroServico)
    .filter((a) => {
      if (!busca.trim()) return true;
      const texto = [
        a.info.placa, a.info.modelo, a.info.data, a.info.servico.nome,
        STATUS_AGENDAMENTO[a.status], a.info.nomeCliente,
      ].join(' ').toLowerCase();
      return texto.includes(busca.trim().toLowerCase());
    })
    .sort((a, b) => b.dataHora.localeCompare(a.dataHora));

  const itensDaPagina = itens.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  function pedirCancelamento(agendamento) {
    if (!podeAlterarAgendamento(agendamento)) {
      setErroCancelamento(
        `O cancelamento só é permitido até ${PRAZO_CANCELAMENTO_MIN} minutos antes do horário ` +
        'e para agendamentos aguardando pagamento ou confirmados.'
      );
      return;
    }
    setCancelando(agendamento);
  }

  async function confirmarCancelamento() {
    const agendamento = cancelando;
    setCancelando(null);
    try {
      await alterar('Agendamentos', agendamento.id, { status: 'CANCELADO' });
      if (agendamento.status === 'CONFIRMADO' && agendamento.idCliente) {
        const lavaJato = db.LavaJatos[0];
        const lote = await creditarCompensacao(agendamento, agendamento.info.servico, lavaJato);
        await registrarNotificacao(
          agendamento.info.usuario,
          agendamento.idCliente,
          agendamento.id,
          `Seu agendamento foi cancelado e você recebeu ${lote.quantidade} pontos de compensação.`
        );
        mensagemSucesso(
          equipe
            ? `Agendamento de ${agendamento.info.nomeCliente} cancelado. ${lote.quantidade} pontos de compensação creditados ao cliente.`
            : `Agendamento cancelado. ${lote.quantidade} pontos de compensação creditados.`
        );
      } else {
        mensagemSucesso('Agendamento cancelado.');
      }
      buscar();
    } catch (erro) {
      setErroCancelamento('Não foi possível cancelar o agendamento. Tente novamente.');
    }
  }

  return (
    <div className='container'>
      <Card title={equipe ? 'Agendamentos' : 'Meus agendamentos'}>
        <div className='d-flex flex-wrap gap-2 mb-3'>
          <button type='button' className='btn btn-info' onClick={() => navigate('/cadastro-agendamento')}>
            Novo agendamento
          </button>
          <input
            type='search'
            className='form-control w-auto'
            placeholder='Buscar por veículo, data, serviço ou status'
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(1);
            }}
          />
          <select
            className='form-select w-auto'
            value={filtroStatus}
            onChange={(e) => {
              setFiltroStatus(e.target.value);
              setPagina(1);
            }}
          >
            <option value=''>Todos os status</option>
            {Object.keys(STATUS_AGENDAMENTO).map((status) => (
              <option key={status} value={status}>
                {STATUS_AGENDAMENTO[status]}
              </option>
            ))}
          </select>
          <select
            className='form-select w-auto'
            value={filtroServico}
            onChange={(e) => {
              setFiltroServico(e.target.value);
              setPagina(1);
            }}
          >
            <option value=''>Todos os serviços</option>
            {db.Servicos.map((servico) => (
              <option key={servico.id} value={servico.id}>
                {servico.nome}
              </option>
            ))}
          </select>
        </div>

        {itens.length === 0 && <p>Nenhum agendamento encontrado.</p>}

        <div className='d-flex flex-wrap gap-3 mb-3'>
          {itensDaPagina.map((a) => (
            <div key={a.id} className='border rounded p-3' style={{ width: '18rem' }}>
              <h5 className='mb-1'>{a.info.servico.nome}</h5>
              <p className='mb-1'>
                <span className='badge bg-info'>{STATUS_AGENDAMENTO[a.status] || a.status}</span>
                {a.walkIn && <span className='badge bg-secondary ms-1'>Walk-in</span>}
              </p>
              {equipe && <p className='mb-1'>Cliente: {a.info.nomeCliente}</p>}
              <p className='mb-1'>
                Veículo: {a.info.placa} {a.info.modelo && `— ${a.info.modelo}`}
              </p>
              <p className='mb-1'>
                {a.info.data} às {a.info.hora}
              </p>
              <p className='mb-2'>Valor: {formatarMoeda(a.valor)}</p>
              <div className='d-flex flex-wrap gap-1'>
                {['AGUARDANDO_PAGAMENTO', 'CONFIRMADO'].includes(a.status) && (
                  <button type='button' className='btn btn-danger btn-sm' onClick={() => pedirCancelamento(a)}>
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Paginacao pagina={pagina} porPagina={POR_PAGINA} total={itens.length} onMudar={setPagina} />
      </Card>

      <Modal
        aberto={cancelando != null}
        titulo='Cancelar agendamento'
        onFechar={() => setCancelando(null)}
        rodape={
          <>
            <button type='button' className='btn btn-secondary' onClick={() => setCancelando(null)}>
              Voltar
            </button>
            <button type='button' className='btn btn-danger' onClick={confirmarCancelamento}>
              Confirmar cancelamento
            </button>
          </>
        }
      >
        {cancelando && (
          <>
            <p>
              Cancelar {cancelando.info.servico.nome}
              {equipe && ` de ${cancelando.info.nomeCliente}`} do dia {cancelando.info.data} às{' '}
              {cancelando.info.hora}?
            </p>
            {cancelando.status === 'CONFIRMADO' && cancelando.idCliente && (
              <p>
                O valor pago não é devolvido em dinheiro:{' '}
                {equipe ? `${cancelando.info.nomeCliente} receberá` : 'você receberá'}{' '}
                {custoResgate(cancelando.info.servico, db.LavaJatos[0])} pontos de compensação,
                válidos por {db.LavaJatos[0] && db.LavaJatos[0].validadePontosCompensacao} dias.
              </p>
            )}
            {equipe && cancelando.status === 'CONFIRMADO' && cancelando.idCliente && (
              <p className='mb-0'>O cliente será avisado do cancelamento.</p>
            )}
          </>
        )}
      </Modal>

      <Modal
        aberto={erroCancelamento !== ''}
        titulo='Não foi possível cancelar'
        onFechar={() => setErroCancelamento('')}
        rodape={
          <button type='button' className='btn btn-primary' onClick={() => setErroCancelamento('')}>
            Entendi
          </button>
        }
      >
        <p>{erroCancelamento}</p>
      </Modal>
    </div>
  );
}

export default Agendamentos;
