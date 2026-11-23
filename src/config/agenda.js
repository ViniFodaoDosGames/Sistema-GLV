import { carregar, inserir, alterar } from './api';
import {
  agora,
  hoje,
  somarDias,
  paraDate,
  diaDaSemana,
  horaParaMinutos,
  minutosParaHora,
  formatarData,
  formatarHora,
  emailValido,
  somenteDigitos,
} from './util';

export const STATUS_OCUPAM_VAGA = ['AGUARDANDO_PAGAMENTO', 'CONFIRMADO', 'EM_ANDAMENTO', 'CONCLUIDO'];

export const PRAZO_CANCELAMENTO_MIN = 15;

export const TOLERANCIA_MIN = 10;

function sobrepoe(inicioA, fimA, inicioB, fimB) {
  return inicioA < fimB && inicioB < fimA;
}

function verificarDia(servico, data, db) {
  const funcionamento = (db.HorariosFuncionamento || []).find((h) => h.diaSemana === diaDaSemana(data));
  if (!funcionamento || !funcionamento.aberto) {
    return { motivo: 'O lava-jato não abre neste dia.' };
  }

  const feriado = (db.Feriados || []).find((f) => f.ativo && f.data === data);
  if (feriado) {
    return { motivo: `Feriado: ${feriado.nome}.` };
  }

  const bloqueioTotal = (db.Bloqueios || []).find(
    (b) => b.ativo && b.idServico === servico.id && b.data === data && b.diaInteiro
  );
  if (bloqueioTotal) {
    return { motivo: `Serviço bloqueado neste dia: ${bloqueioTotal.motivo}.` };
  }

  return { motivo: '', funcionamento };
}

function verificarHorario(servico, data, inicio, funcionamento, db) {
  const fim = inicio + (Number(servico.tempoDuracao) || 0);

  if (inicio < horaParaMinutos(funcionamento.horaAbertura) || fim > horaParaMinutos(funcionamento.horaFechamento)) {
    return 'Fora do horário de funcionamento';
  }

  const almoco = (db.IntervalosAlmoco || [])[0];
  const dia = diaDaSemana(data);
  const fimDeSemana = dia === 'SABADO' || dia === 'DOMINGO';
  const aplicaAlmoco = almoco && !fimDeSemana;
  if (aplicaAlmoco && sobrepoe(inicio, fim, horaParaMinutos(almoco.horaInicio), horaParaMinutos(almoco.horaFim))) {
    return 'Intervalo de almoço';
  }

  const bloqueio = (db.Bloqueios || []).find(
    (b) =>
      b.ativo &&
      !b.diaInteiro &&
      b.idServico === servico.id &&
      b.data === data &&
      sobrepoe(inicio, fim, horaParaMinutos(b.horaInicio), horaParaMinutos(b.horaFim))
  );
  if (bloqueio) return `Bloqueio: ${bloqueio.motivo}`;

  return '';
}

export function gerarGrade({ servico, data, db, ignorarIdAgendamento }) {
  if (!servico || !data) return { motivo: '', horarios: [] };

  const { motivo: motivoDia, funcionamento } = verificarDia(servico, data, db);
  if (motivoDia) return { motivo: motivoDia, horarios: [] };

  const abertura = horaParaMinutos(funcionamento.horaAbertura);
  const fechamento = horaParaMinutos(funcionamento.horaFechamento);
  const duracao = Number(servico.tempoDuracao) || 0;
  const passo = Number(servico.tempoIntervalo) || duracao || 30;

  const agendamentosDoDia = (db.Agendamentos || []).filter(
    (a) =>
      a.idServico === servico.id &&
      a.id !== ignorarIdAgendamento &&
      STATUS_OCUPAM_VAGA.includes(a.status) &&
      a.dataHora.substring(0, 10) === data
  );

  const agoraData = new Date();
  const ehHoje = data === hoje();
  const minutosAgora = agoraData.getHours() * 60 + agoraData.getMinutes();

  const horarios = [];
  for (let inicio = abertura; inicio + duracao <= fechamento; inicio += passo) {
    const fim = inicio + duracao;
    let motivo = '';

    if (ehHoje && inicio <= minutosAgora) {
      motivo = 'Horário já passou';
    } else {
      motivo = verificarHorario(servico, data, inicio, funcionamento, db);
    }

    const ocupadas = agendamentosDoDia.filter((a) => {
      const inicioAgendado = horaParaMinutos(formatarHora(a.dataHora));
      return sobrepoe(inicio, fim, inicioAgendado, inicioAgendado + duracao);
    }).length;
    const vagasLivres = Math.max(Number(servico.vagas) - ocupadas, 0);
    if (!motivo && vagasLivres === 0) motivo = 'Sem vagas';

    horarios.push({
      hora: minutosParaHora(inicio),
      vagasLivres,
      disponivel: motivo === '',
      motivo,
    });
  }

  return { motivo: horarios.length ? '' : 'Nenhum horário cabe na janela de funcionamento.', horarios };
}

export function conflitoDoAgendamento(agendamento, db) {
  const servico = (db.Servicos || []).find((s) => s.id === agendamento.idServico);
  if (!servico) return '';
  const data = agendamento.dataHora.substring(0, 10);
  const { motivo, funcionamento } = verificarDia(servico, data, db);
  if (motivo) return motivo;
  return verificarHorario(servico, data, horaParaMinutos(formatarHora(agendamento.dataHora)), funcionamento, db);
}

export async function buscarConflitosAgenda() {
  const db = await carregar([
    'Agendamentos', 'Servicos', 'HorariosFuncionamento', 'IntervalosAlmoco', 'Feriados',
    'Bloqueios', 'Veiculos', 'Modelos', 'Marcas', 'Cores', 'Clientes', 'Usuarios',
  ]);
  const momento = agora();
  return db.Agendamentos
    .filter((a) => a.status === 'CONFIRMADO' && a.dataHora >= momento)
    .map((a) => ({ agendamento: a, motivo: conflitoDoAgendamento(a, db), info: detalharAgendamento(a, db) }))
    .filter((c) => c.motivo)
    .sort((x, y) => x.agendamento.dataHora.localeCompare(y.agendamento.dataHora));
}

export function minutosAteHorario(agendamento) {
  return Math.round((paraDate(agendamento.dataHora) - new Date()) / 60000);
}

export function podeAlterarAgendamento(agendamento) {
  return (
    ['AGUARDANDO_PAGAMENTO', 'CONFIRMADO'].includes(agendamento.status) &&
    minutosAteHorario(agendamento) >= PRAZO_CANCELAMENTO_MIN
  );
}

export function posicaoNaFila(agendamento, agendamentos) {
  const data = agendamento.dataHora.substring(0, 10);
  const fila = agendamentos
    .filter(
      (a) =>
        a.dataHora.substring(0, 10) === data &&
        ['CONFIRMADO', 'EM_ANDAMENTO'].includes(a.status)
    )
    .sort((a, b) => a.dataHora.localeCompare(b.dataHora));
  const posicao = fila.findIndex((a) => a.id === agendamento.id);
  return posicao >= 0 ? posicao + 1 : null;
}

export function lotesValidos(lotes, idCliente) {
  const dataHoje = hoje();
  return lotes.filter(
    (l) => l.idCliente === idCliente && Number(l.saldo) > 0 && l.expiraEm >= dataHoje
  );
}

export function saldoPontos(lotes, idCliente) {
  return lotesValidos(lotes, idCliente).reduce((total, l) => total + Number(l.saldo), 0);
}

export function custoResgate(servico, lavaJato) {
  if (!servico || !lavaJato) return 0;
  return Number(servico.pontosGerados) * Number(lavaJato.fatorFidelidade);
}

export async function consumirPontos(lotes, idCliente, quantidade) {
  const ordenados = lotesValidos(lotes, idCliente).sort((a, b) => a.expiraEm.localeCompare(b.expiraEm));
  let falta = quantidade;
  const usados = [];
  for (const lote of ordenados) {
    if (falta <= 0) break;
    const usar = Math.min(Number(lote.saldo), falta);
    await alterar('LotesPontos', lote.id, { saldo: Number(lote.saldo) - usar });
    usados.push(lote);
    falta -= usar;
  }
  return usados;
}

export async function creditarFidelidade(agendamento, servico, lavaJato) {
  const quantidade = Number(servico.pontosGerados);
  return inserir('LotesPontos', {
    tipo: 'FIDELIDADE',
    quantidade,
    saldo: quantidade,
    geradoEm: hoje(),
    expiraEm: somarDias(hoje(), lavaJato.validadePontosFidelidade),
    idCliente: agendamento.idCliente,
    idAgendamento: agendamento.id,
  });
}

export async function creditarCompensacao(agendamento, servico, lavaJato) {
  const quantidade = custoResgate(servico, lavaJato);
  return inserir('LotesPontos', {
    tipo: 'COMPENSACAO',
    quantidade,
    saldo: quantidade,
    geradoEm: hoje(),
    expiraEm: somarDias(hoje(), lavaJato.validadePontosCompensacao),
    idCliente: agendamento.idCliente,
    idAgendamento: agendamento.id,
  });
}

export async function registrarNotificacao(usuario, idCliente, idAgendamento, mensagem) {
  const canal = somenteDigitos(usuario && usuario.celular).length >= 10 ? 'WHATSAPP' : 'EMAIL';
  return inserir('Notificacoes', {
    canal,
    mensagem,
    dataHora: agora(),
    idCliente,
    idAgendamento: idAgendamento || null,
    statusEnvio: 'PENDENTE',
  });
}

export function semContatoValido(usuario) {
  if (!usuario) return true;
  return somenteDigitos(usuario.celular).length < 10 && !emailValido(usuario.email);
}

export function detalharAgendamento(agendamento, db) {
  const veiculo = (db.Veiculos || []).find((v) => v.id === agendamento.idVeiculo) || {};
  const modelo = (db.Modelos || []).find((m) => m.id === veiculo.idModelo) || {};
  const marca = (db.Marcas || []).find((m) => m.id === modelo.idMarca) || {};
  const cor = (db.Cores || []).find((c) => c.id === veiculo.idCor) || {};
  const servico = (db.Servicos || []).find((s) => s.id === agendamento.idServico) || {};
  const cliente = (db.Clientes || []).find((c) => c.id === agendamento.idCliente) || {};
  const usuario = (db.Usuarios || []).find((u) => u.id === cliente.idUsuario) || {};
  const pagamento = (db.Pagamentos || [])
    .filter((p) => p.idAgendamento === agendamento.id)
    .sort((a, b) => (b.dataHora || '').localeCompare(a.dataHora || ''))[0];

  return {
    placa: veiculo.placa || '',
    modelo: modelo.nome || '',
    marca: marca.nome || '',
    cor: cor.nome || '',
    servico,
    usuario,
    nomeCliente: usuario.nome || (agendamento.idCliente ? '' : 'Walk-in'),
    pagamento: pagamento || null,
    data: formatarData(agendamento.dataHora),
    hora: formatarHora(agendamento.dataHora),
  };
}

export function nomeFuncionario(idFuncionario, db) {
  const funcionario = (db.Funcionarios || []).find((f) => f.id === idFuncionario);
  const usuario = funcionario && (db.Usuarios || []).find((u) => u.id === funcionario.idUsuario);
  return usuario ? usuario.nome : '';
}
