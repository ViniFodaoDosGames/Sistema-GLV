import axios from 'axios';
import { BASE_URL } from './axios';
import { autenticar, getSession, setSession } from '../auth';

export const PERFIS = {
  CLIENTE: 'CLIENTE',
  FUNCIONARIO: 'FUNCIONARIO',
  ADMIN: 'ADMINISTRADOR',
};

export function obterSessao() {
  const sessao = getSession();
  if (!sessao) return null;

  return {
    idUsuario: sessao.usuario.id,
    nome: sessao.usuario.nome,
    perfil: sessao.role,
    idCliente: sessao.idCliente || null,
    idFuncionario: sessao.idFuncionario || null,
  };
}

export function ehFuncionario(sessao) {
  return sessao && (sessao.perfil === PERFIS.FUNCIONARIO || sessao.perfil === PERFIS.ADMIN);
}

export async function fazerLogin(cpf, senha) {
  const autenticado = await autenticar(cpf, senha);

  const [funcionarios, clientes] = await Promise.all([
    axios.get(`${BASE_URL}/Funcionarios`),
    axios.get(`${BASE_URL}/Clientes`),
  ]);
  const funcionario = funcionarios.data.find((f) => f.idUsuario === autenticado.usuario.id);
  const cliente = clientes.data.find((c) => c.idUsuario === autenticado.usuario.id);

  const sessao = {
    ...autenticado,
    idCliente: cliente ? cliente.id : null,
    idFuncionario: funcionario ? funcionario.id : null,
  };
  setSession(sessao, false);
  return sessao;
}
