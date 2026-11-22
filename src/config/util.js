function doisDigitos(numero) {
  return String(numero).padStart(2, '0');
}

export function hoje() {
  const d = new Date();
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`;
}

export function agora() {
  const d = new Date();
  return `${hoje()} ${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}:${doisDigitos(d.getSeconds())}`;
}

export function somarDias(data, dias) {
  const d = new Date(`${data}T00:00:00`);
  d.setDate(d.getDate() + Number(dias));
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`;
}

export function paraDate(dataHora) {
  if (!dataHora) return null;
  return new Date(dataHora.replace(' ', 'T'));
}

export function formatarData(data) {
  if (!data) return '';
  const [ano, mes, dia] = data.substring(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

export function formatarHora(valor) {
  if (!valor) return '';
  const hora = valor.length > 8 ? valor.substring(11) : valor;
  return hora.substring(0, 5);
}

export function formatarDataHora(dataHora) {
  if (!dataHora) return '';
  return `${formatarData(dataHora)} ${formatarHora(dataHora)}`;
}

export function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function horaParaMinutos(hora) {
  if (!hora) return null;
  const [h, m] = hora.split(':');
  return Number(h) * 60 + Number(m);
}

export function minutosParaHora(minutos) {
  return `${doisDigitos(Math.floor(minutos / 60))}:${doisDigitos(minutos % 60)}`;
}

export const DIAS_SEMANA = ['DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'];

export function diaDaSemana(data) {
  return DIAS_SEMANA[new Date(`${data}T00:00:00`).getDay()];
}

export function somenteDigitos(valor) {
  return (valor || '').replace(/\D/g, '');
}

export function mascaraCpf(valor) {
  return somenteDigitos(valor)
    .substring(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function mascaraCelular(valor) {
  return somenteDigitos(valor)
    .substring(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

export function mascaraPlaca(valor) {
  return (valor || '')
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .substring(0, 8);
}

export function cpfValido(valor) {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  for (let tamanho = 9; tamanho <= 10; tamanho++) {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) {
      soma += Number(cpf[i]) * (tamanho + 1 - i);
    }
    let digito = (soma * 10) % 11;
    if (digito === 10) digito = 0;
    if (digito !== Number(cpf[tamanho])) return false;
  }
  return true;
}

export function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor || '');
}

export function normalizarPlaca(valor) {
  return (valor || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function placaValida(valor) {
  const placa = normalizarPlaca(valor);
  return /^[A-Z]{3}\d{4}$/.test(placa) || /^[A-Z]{3}\d[A-Z]\d{2}$/.test(placa);
}

export const STATUS_AGENDAMENTO = {
  AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
  CONFIRMADO: 'Confirmado',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluído',
  NAO_COMPARECEU: 'Não compareceu',
  CANCELADO: 'Cancelado',
};

export const STATUS_PAGAMENTO = {
  PENDENTE: 'Pendente',
  APROVADO: 'Aprovado',
  ESTORNADO: 'Estornado',
};

export const FORMA_PAGAMENTO = {
  PIX: 'Pix',
  CARTAO: 'Cartão',
  PONTOS: 'Pontos',
  DINHEIRO: 'Dinheiro',
};

export const TIPO_LOTE_PONTOS = {
  FIDELIDADE: 'Fidelidade',
  COMPENSACAO: 'Compensação',
};

export const NOME_DIA_SEMANA = {
  DOMINGO: 'Domingo',
  SEGUNDA: 'Segunda-feira',
  TERCA: 'Terça-feira',
  QUARTA: 'Quarta-feira',
  QUINTA: 'Quinta-feira',
  SEXTA: 'Sexta-feira',
  SABADO: 'Sábado',
};

export const CANAL_NOTIFICACAO = {
  WHATSAPP: 'WhatsApp',
  EMAIL: 'E-mail',
};
