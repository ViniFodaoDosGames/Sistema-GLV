import { inserir, alterar } from './api';
import { agora, paraDate } from './util';
import {
  creditarFidelidade,
  registrarNotificacao,
  minutosAteHorario,
  TOLERANCIA_MIN,
} from './agenda';
import { mensagemAlert } from '../components/toastr';

export async function fazerCheckin(agendamento, observacao, sessao) {
  if (minutosAteHorario(agendamento) < -TOLERANCIA_MIN) {
    mensagemAlert(`Check-in fora da tolerância de ${TOLERANCIA_MIN} minutos`);
  }
  await inserir('LogsMovimentacao', {
    tipo: 'ENTRADA',
    dataHora: agora(),
    observacao: observacao || 'Check-in realizado',
    idAgendamento: agendamento.id,
    idFuncionario: sessao.idFuncionario,
  });
  await alterar('Agendamentos', agendamento.id, { status: 'EM_ANDAMENTO' });
}

export async function concluirAtendimento(agendamento, servico, lavaJato, usuarioCliente) {
  await alterar('Agendamentos', agendamento.id, { status: 'CONCLUIDO' });
  if (!agendamento.idCliente) return null;
  const lote = await creditarFidelidade(agendamento, servico, lavaJato);
  if (servico.notificaConclusao) {
    await registrarNotificacao(
      usuarioCliente,
      agendamento.idCliente,
      agendamento.id,
      `Seu veículo está pronto! Você ganhou ${lote.quantidade} pontos.`
    );
  }
  return lote;
}

export async function fazerCheckout(agendamento, observacao, sessao, logs) {
  const dataHora = agora();
  await inserir('LogsMovimentacao', {
    tipo: 'SAIDA',
    dataHora,
    observacao: observacao || 'Check-out realizado',
    idAgendamento: agendamento.id,
    idFuncionario: sessao.idFuncionario,
  });
  const entrada = logs.find((l) => l.idAgendamento === agendamento.id && l.tipo === 'ENTRADA');
  if (!entrada) return null;
  return Math.round((paraDate(dataHora) - paraDate(entrada.dataHora)) / 60000);
}

export async function registrarAjuste(agendamento, observacao, sessao) {
  await inserir('LogsMovimentacao', {
    tipo: 'AJUSTE',
    dataHora: agora(),
    observacao,
    idAgendamento: agendamento.id,
    idFuncionario: sessao.idFuncionario,
  });
}

export function jaSaiu(agendamento, logs) {
  return logs.some((l) => l.idAgendamento === agendamento.id && l.tipo === 'SAIDA');
}
