import { BASE_URL } from './config/axios';

const SESSION_KEY = 'sistema-glv-session';

export function getSession() {
  const session =
    sessionStorage.getItem(SESSION_KEY) ||
    localStorage.getItem(SESSION_KEY);

  return session ? JSON.parse(session) : null;
}

export function setSession(session, remember) {
  const value = JSON.stringify(session);
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);

  if (remember) {
    localStorage.setItem(SESSION_KEY, value);
  } else {
    sessionStorage.setItem(SESSION_KEY, value);
  }

  window.dispatchEvent(new Event('auth-change'));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event('auth-change'));
}

export function resolveRole(usuarioId, dados) {
  const funcionario = dados.Funcionarios?.find(
    (item) => String(item.idUsuario) === String(usuarioId)
  );

  if (funcionario) {
    const administrador = dados.Administradores?.find(
      (item) => String(item.idFuncionario) === String(funcionario.id)
    );

    if (administrador) {
      return 'ADMINISTRADOR';
    }

    return 'FUNCIONARIO';
  }

  const cliente = dados.Clientes?.find(
    (item) => String(item.idUsuario) === String(usuarioId)
  );

  return cliente ? 'CLIENTE' : null;
}

export async function autenticar(cpf, senha) {
  const [usuariosRes, clientesRes, funcionariosRes, administradoresRes] =
    await Promise.all([
      fetch(`${BASE_URL}/Usuarios`),
      fetch(`${BASE_URL}/Clientes`),
      fetch(`${BASE_URL}/Funcionarios`),
      fetch(`${BASE_URL}/Administradores`),
    ]);

  if (
    !usuariosRes.ok ||
    !clientesRes.ok ||
    !funcionariosRes.ok ||
    !administradoresRes.ok
  ) {
    throw new Error('Não foi possível acessar os dados de acesso.');
  }

  const dados = {
    Usuarios: await usuariosRes.json(),
    Clientes: await clientesRes.json(),
    Funcionarios: await funcionariosRes.json(),
    Administradores: await administradoresRes.json(),
  };
  const usuario = dados.Usuarios.find(
    (item) =>
      item.cpf === cpf.replace(/\D/g, '') &&
      item.senha === senha &&
      item.status === true
  );

  if (!usuario) {
    throw new Error('CPF ou senha inválidos.');
  }

  const role = resolveRole(usuario.id, dados);
  if (!role) {
    throw new Error('Usuário sem perfil de acesso ativo.');
  }

  return { usuario, role };
}
