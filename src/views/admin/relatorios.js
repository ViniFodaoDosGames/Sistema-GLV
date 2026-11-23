import React, { useState, useEffect } from 'react';

import Card from '../../components/card';
import GraficoBarras from '../../components/grafico-barras';
import { mensagemErro } from '../../components/toastr';

import '../../custom.css';

import { carregar } from '../../config/api';
import { hoje, formatarData, formatarMoeda, FORMA_PAGAMENTO } from '../../config/util';

function ultimoDiaDoMes() {
  const agora = new Date();
  const ultimo = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);
  const mes = String(ultimo.getMonth() + 1).padStart(2, '0');
  const dia = String(ultimo.getDate()).padStart(2, '0');
  return `${ultimo.getFullYear()}-${mes}-${dia}`;
}

function Indicador({ titulo, valor }) {
  return (
    <div className='border rounded p-3' style={{ minWidth: '12rem' }}>
      <div className='text-muted'>{titulo}</div>
      <div className='fs-3 fw-bold'>{valor}</div>
    </div>
  );
}

function Relatorios() {
  const [db, setDb] = useState(null);
  const [dataInicial, setDataInicial] = useState(`${hoje().substring(0, 8)}01`);
  const [dataFinal, setDataFinal] = useState(ultimoDiaDoMes());

  useEffect(() => {
    carregar(['Agendamentos', 'Servicos', 'Pagamentos', 'LotesPontos'])
      .then(setDb)
      .catch(() => mensagemErro('Erro ao carregar os dados dos relatórios'));
  }, []);

  if (!db) return null;

  function noPeriodo(data) {
    if (!data) return false;
    const dia = data.substring(0, 10);
    return dia >= dataInicial && dia <= dataFinal;
  }

  const agendamentos = db.Agendamentos.filter((a) => a.status !== 'CANCELADO' && noPeriodo(a.dataHora));
  const atendidos = agendamentos.filter((a) => a.status === 'CONCLUIDO').length;

  const pagamentosAprovados = db.Pagamentos.filter(
    (p) => p.status === 'APROVADO' && p.forma !== 'PONTOS' && noPeriodo(p.dataHora)
  );
  const faturamento = pagamentosAprovados.reduce((total, p) => total + Number(p.valor), 0);

  const lotesDoPeriodo = db.LotesPontos.filter((l) => noPeriodo(l.geradoEm));

  function somarPontos(tipo) {
    return lotesDoPeriodo
      .filter((l) => l.tipo === tipo)
      .reduce((total, l) => total + Number(l.quantidade), 0);
  }

  const agendamentosPorServico = db.Servicos.map((s) => ({
    rotulo: s.nome,
    valor: agendamentos.filter((a) => a.idServico === s.id).length,
  }));

  const faturamentoPorForma = ['PIX', 'CARTAO', 'DINHEIRO'].map((forma) => ({
    rotulo: FORMA_PAGAMENTO[forma],
    valor: pagamentosAprovados
      .filter((p) => p.forma === forma)
      .reduce((total, p) => total + Number(p.valor), 0),
  }));

  return (
    <div className='container'>
      <Card title='Relatórios'>
        <div className='d-flex flex-wrap gap-2 align-items-end mb-3 no-print'>
          <label>
            De
            <input type='date' className='form-control' value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} />
          </label>
          <label>
            Até
            <input type='date' className='form-control' value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} />
          </label>
          <button type='button' className='btn btn-primary' onClick={() => window.print()}>
            Exportar PDF
          </button>
        </div>

        <p>Período de {formatarData(dataInicial)} a {formatarData(dataFinal)}.</p>

        <div className='d-flex flex-wrap gap-3 mb-4'>
          <Indicador titulo='Agendamentos' valor={agendamentos.length} />
          <Indicador titulo='Atendidos' valor={atendidos} />
          <Indicador titulo='Faturamento' valor={formatarMoeda(faturamento)} />
          <Indicador titulo='Pontos de fidelidade' valor={somarPontos('FIDELIDADE')} />
          <Indicador titulo='Pontos de compensação' valor={somarPontos('COMPENSACAO')} />
        </div>

        <GraficoBarras titulo='Agendamentos por serviço' itens={agendamentosPorServico} />
        <GraficoBarras titulo='Faturamento por forma de pagamento' itens={faturamentoPorForma} formatar={formatarMoeda} />
      </Card>
    </div>
  );
}

export default Relatorios;
