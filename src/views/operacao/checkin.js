import React, { useState, useEffect } from 'react';

import Card from '../../components/card';
import Paginacao from '../../components/paginacao';
import { mensagemSucesso, mensagemErro } from '../../components/toastr';

import '../../custom.css';

import { carregar } from '../../config/api';
import { obterSessao, PERFIS } from '../../config/sessao';
import { hoje, normalizarPlaca, mascaraPlaca, STATUS_AGENDAMENTO } from '../../config/util';
import { detalharAgendamento, posicaoNaFila } from '../../config/agenda';
import { fazerCheckin, concluirAtendimento, fazerCheckout, jaSaiu } from '../../config/operacao';

const POR_PAGINA = 10;

function CheckIn() {
  const sessao = obterSessao();
  const ehAdmin = sessao.perfil === PERFIS.ADMIN;

  const [db, setDb] = useState(null);
  const [aba, setAba] = useState('checkin');
  const [data, setData] = useState(hoje());
  const [mostrarTudo, setMostrarTudo] = useState(false);
  const [placa, setPlaca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [ocupado, setOcupado] = useState(false);

  async function buscar() {
    try {
      setDb(await carregar([
        'Agendamentos', 'Servicos', 'Veiculos', 'Modelos', 'Marcas', 'Cores',
        'Clientes', 'Usuarios', 'LogsMovimentacao', 'LavaJatos',
      ]));
    } catch (erro) {
      mensagemErro('Erro ao carregar os atendimentos');
    }
  }

  useEffect(() => {
    buscar();
  }, []);

  if (!db) return null;

  const placaBuscada = normalizarPlaca(placa);

  const doDia = db.Agendamentos
    .filter((a) => mostrarTudo || placaBuscada || a.dataHora.substring(0, 10) === data)
    .map((a) => ({ ...a, info: detalharAgendamento(a, db), fila: posicaoNaFila(a, db.Agendamentos) }))
    .filter((a) => !placaBuscada || normalizarPlaca(a.info.placa).includes(placaBuscada));

  const itens = doDia
    .filter((a) =>
      aba === 'checkin'
        ? a.status === 'CONFIRMADO'
        : a.status === 'EM_ANDAMENTO' || (a.status === 'CONCLUIDO' && !jaSaiu(a, db.LogsMovimentacao))
    )
    .sort((a, b) => a.dataHora.localeCompare(b.dataHora));

  const itensDaPagina = itens.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  async function executar(acao, agendamento) {
    setOcupado(true);
    try {
      if (acao === 'checkin') {
        await fazerCheckin(agendamento, '', sessao);
        mensagemSucesso(`Check-in do veículo ${agendamento.info.placa} realizado`);
      } else if (acao === 'concluir') {
        const lote = await concluirAtendimento(agendamento, agendamento.info.servico, db.LavaJatos[0], agendamento.info.usuario);
        mensagemSucesso(
          lote ? `Atendimento concluído. ${lote.quantidade} pontos creditados ao cliente.` : 'Atendimento concluído.'
        );
      } else if (acao === 'checkout') {
        const minutos = await fazerCheckout(agendamento, '', sessao, db.LogsMovimentacao);
        mensagemSucesso(
          `Check-out realizado${minutos != null ? `. Tempo total de permanência: ${minutos} min` : ''}`
        );
      }
      await buscar();
    } catch (erro) {
      mensagemErro('Não foi possível concluir a operação');
    }
    setOcupado(false);
  }

  function trocarAba(novaAba) {
    setAba(novaAba);
    setPagina(1);
  }

  return (
    <div className='container'>
      <Card title='Check-in e Check-out'>
        <ul className='nav nav-tabs'>
          <li className='nav-item'>
            <button type='button' className={`nav-link${aba === 'checkin' ? ' active' : ''}`} onClick={() => trocarAba('checkin')}>
              Check-in
            </button>
          </li>
          <li className='nav-item'>
            <button type='button' className={`nav-link${aba === 'checkout' ? ' active' : ''}`} onClick={() => trocarAba('checkout')}>
              Check-out
            </button>
          </li>
        </ul>

        <div className='d-flex flex-wrap gap-2 align-items-center mb-3'>
          <input
            type='search'
            className='form-control w-auto'
            placeholder='Buscar pela placa'
            value={placa}
            autoFocus
            onChange={(e) => {
              setPlaca(mascaraPlaca(e.target.value));
              setPagina(1);
            }}
          />
          <input
            type='date'
            className='form-control w-auto'
            value={data}
            aria-label='Dia dos atendimentos'
            disabled={mostrarTudo || placaBuscada !== ''}
            onChange={(e) => {
              setData(e.target.value);
              setPagina(1);
            }}
          />
          {ehAdmin && (
            <div className='form-check'>
              <input
                type='checkbox'
                id='inputMostrarTudo'
                className='form-check-input'
                checked={mostrarTudo}
                onChange={(e) => {
                  setMostrarTudo(e.target.checked);
                  setPagina(1);
                }}
              />
              <label className='form-check-label' htmlFor='inputMostrarTudo'>
                Mostrar tudo
              </label>
            </div>
          )}
        </div>

        {itens.length === 0 && (
          <p>
            Nenhum atendimento {aba === 'checkin' ? 'para check-in' : 'para check-out'}
            {placaBuscada ? ' com essa placa.' : mostrarTudo ? '.' : ' neste dia.'}
          </p>
        )}

        {itens.length > 0 && (
          <table className='table table-hover'>
            <thead>
              <tr>
                <th scope='col'>Fila</th>
                <th scope='col'>Data</th>
                <th scope='col'>Horário</th>
                <th scope='col'>Cliente</th>
                <th scope='col'>Serviço</th>
                <th scope='col'>Placa</th>
                <th scope='col'>Modelo</th>
                <th scope='col'>Cor</th>
                <th scope='col'>Status</th>
                <th scope='col'>Ações</th>
              </tr>
            </thead>
            <tbody>
              {itensDaPagina.map((a) => (
                <tr key={a.id}>
                  <td>{a.fila || '—'}</td>
                  <td>{a.info.data}</td>
                  <td>{a.info.hora}</td>
                  <td>{a.info.nomeCliente}</td>
                  <td>{a.info.servico.nome}</td>
                  <td>{a.info.placa}</td>
                  <td>{a.info.modelo}</td>
                  <td>{a.info.cor}</td>
                  <td>{STATUS_AGENDAMENTO[a.status]}</td>
                  <td>
                    <div className='d-flex gap-1'>
                      {a.status === 'CONFIRMADO' && (
                        <button type='button' className='btn btn-success btn-sm' disabled={ocupado} onClick={() => executar('checkin', a)}>
                          Check-in
                        </button>
                      )}
                      {a.status === 'EM_ANDAMENTO' && (
                        <button type='button' className='btn btn-success btn-sm' disabled={ocupado} onClick={() => executar('concluir', a)}>
                          Concluir
                        </button>
                      )}
                      {a.status === 'CONCLUIDO' && (
                        <button type='button' className='btn btn-warning btn-sm' disabled={ocupado} onClick={() => executar('checkout', a)}>
                          Check-out
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Paginacao pagina={pagina} porPagina={POR_PAGINA} total={itens.length} onMudar={setPagina} />
      </Card>
    </div>
  );
}

export default CheckIn;
