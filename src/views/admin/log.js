import React, { useState, useEffect } from 'react';

import Card from '../../components/card';
import Paginacao from '../../components/paginacao';
import { mensagemErro } from '../../components/toastr';

import '../../custom.css';

import { carregar } from '../../config/api';
import { hoje, somarDias, formatarData, formatarHora } from '../../config/util';
import { detalharAgendamento, nomeFuncionario } from '../../config/agenda';

const POR_PAGINA = 15;

const ABAS = [
  { tipo: 'ENTRADA', titulo: 'Entradas' },
  { tipo: 'SAIDA', titulo: 'Saídas' },
  { tipo: 'AJUSTE', titulo: 'Ajustes' },
];

function Log() {
  const [db, setDb] = useState(null);
  const [aba, setAba] = useState('ENTRADA');
  const [dataInicial, setDataInicial] = useState(somarDias(hoje(), -60));
  const [dataFinal, setDataFinal] = useState(hoje());
  const [horaInicial, setHoraInicial] = useState('00:00');
  const [horaFinal, setHoraFinal] = useState('23:59');
  const [mostrarTudo, setMostrarTudo] = useState(false);
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    carregar([
      'LogsMovimentacao', 'Agendamentos', 'Servicos', 'Veiculos', 'Modelos', 'Marcas',
      'Cores', 'Clientes', 'Usuarios', 'Funcionarios',
    ])
      .then(setDb)
      .catch(() => mensagemErro('Erro ao carregar os logs'));
  }, []);

  if (!db) return null;

  const itens = db.LogsMovimentacao
    .filter((l) => l.tipo === aba)
    .filter((l) => {
      if (mostrarTudo) return true;
      const data = l.dataHora.substring(0, 10);
      const hora = formatarHora(l.dataHora);
      return data >= dataInicial && data <= dataFinal && hora >= horaInicial && hora <= horaFinal;
    })
    .sort((a, b) => b.dataHora.localeCompare(a.dataHora))
    .map((l) => {
      const agendamento = db.Agendamentos.find((a) => a.id === l.idAgendamento);
      return { ...l, info: agendamento ? detalharAgendamento(agendamento, db) : null };
    });

  const itensDaPagina = itens.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  function filtro(setter) {
    return (e) => {
      setter(e.target.value);
      setPagina(1);
    };
  }

  function linha(l) {
    return (
      <tr key={l.id}>
        <td>{formatarData(l.dataHora)}</td>
        <td>{formatarHora(l.dataHora)}</td>
        <td>{l.info ? `${l.info.placa} — ${l.info.servico.nome} (${l.info.data} ${l.info.hora})` : l.idAgendamento}</td>
        <td>{l.info ? l.info.nomeCliente : ''}</td>
        <td>{nomeFuncionario(l.idFuncionario, db)}</td>
        <td>{l.observacao}</td>
      </tr>
    );
  }

  return (
    <div className='container'>
      <Card title='Log de movimentação'>
        <ul className='nav nav-tabs no-print'>
          {ABAS.map((a) => (
            <li className='nav-item' key={a.tipo}>
              <button
                type='button'
                className={`nav-link${aba === a.tipo ? ' active' : ''}`}
                onClick={() => {
                  setAba(a.tipo);
                  setPagina(1);
                }}
              >
                {a.titulo}
              </button>
            </li>
          ))}
        </ul>

        <div className='d-flex flex-wrap gap-2 align-items-end my-3 no-print'>
          <label>
            De
            <input type='date' className='form-control' value={dataInicial} disabled={mostrarTudo} onChange={filtro(setDataInicial)} />
          </label>
          <label>
            Até
            <input type='date' className='form-control' value={dataFinal} disabled={mostrarTudo} onChange={filtro(setDataFinal)} />
          </label>
          <label>
            Das
            <input type='time' className='form-control' value={horaInicial} disabled={mostrarTudo} onChange={filtro(setHoraInicial)} />
          </label>
          <label>
            Às
            <input type='time' className='form-control' value={horaFinal} disabled={mostrarTudo} onChange={filtro(setHoraFinal)} />
          </label>
          <div className='form-check mb-2'>
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
          <button type='button' className='btn btn-primary' onClick={() => window.print()}>
            Exportar PDF
          </button>
        </div>

        {mostrarTudo ? (
          <p>
            {ABAS.find((a) => a.tipo === aba).titulo} de todo o período — {itens.length} registro(s)
          </p>
        ) : (
          <p>
            {ABAS.find((a) => a.tipo === aba).titulo} de {formatarData(dataInicial)} a {formatarData(dataFinal)},
            das {horaInicial} às {horaFinal} — {itens.length} registro(s)
          </p>
        )}

        {itens.length > 0 && (
          <table className='table table-hover'>
            <thead>
              <tr>
                <th scope='col'>Data</th>
                <th scope='col'>Hora</th>
                <th scope='col'>Agendamento</th>
                <th scope='col'>Cliente</th>
                <th scope='col'>Funcionário</th>
                <th scope='col'>Observação</th>
              </tr>
            </thead>
            <tbody className='no-print'>{itensDaPagina.map(linha)}</tbody>
            <tbody className='only-print'>{itens.map(linha)}</tbody>
          </table>
        )}

        <Paginacao pagina={pagina} porPagina={POR_PAGINA} total={itens.length} onMudar={setPagina} />
      </Card>
    </div>
  );
}

export default Log;
