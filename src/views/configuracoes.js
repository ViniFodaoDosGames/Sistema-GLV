import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../components/card';
import FormGroup from '../components/form-group';
import { clearSession, getSession } from '../auth';
import { BASE_URL } from '../config/axios';
import { mensagemErro, mensagemSucesso } from '../components/toastr';
import '../custom.css';

function Configuracoes() {
  const session = getSession();
  const usuarioId = session?.usuario?.id;
  const [usuario, setUsuario] = useState(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  function cancelarDados() {
    setNome(usuario.nome);
    setEmail(usuario.email);
  }

  useEffect(() => {
    if (!usuarioId) return;

    axios
      .get(`${BASE_URL}/Usuarios/${usuarioId}`)
      .then((response) => {
        setUsuario(response.data);
        setNome(response.data.nome);
        setEmail(response.data.email);
      })
      .catch(() => mensagemErro('Não foi possível carregar seus dados.'));
  }, [usuarioId]);

  async function salvarDados(event) {
    event.preventDefault();

    try {
      const atualizado = { ...usuario, nome, email };
      await axios.put(
        `${BASE_URL}/Usuarios/${usuario.id}`,
        atualizado,
        { headers: { 'Content-Type': 'application/json' } }
      );
      setUsuario(atualizado);

      const storage =
        localStorage.getItem('sistema-glv-session')
          ? localStorage
          : sessionStorage;
      const raw = storage.getItem('sistema-glv-session');
      if (raw) {
        const current = JSON.parse(raw);
        storage.setItem(
          'sistema-glv-session',
          JSON.stringify({
            ...current,
            usuario: { ...current.usuario, nome, email },
          })
        );
      }

      mensagemSucesso('Dados cadastrais alterados com sucesso.');
    } catch (error) {
      mensagemErro('Não foi possível alterar os dados cadastrais.');
    }
  }

  async function alterarSenha(event) {
    event.preventDefault();

    if (senhaAtual !== usuario.senha) {
      mensagemErro('A senha atual está incorreta.');
      return;
    }

    if (!novaSenha || novaSenha !== confirmarSenha) {
      mensagemErro('A nova senha e a confirmação devem ser iguais.');
      return;
    }

    try {
      await axios.put(
        `${BASE_URL}/Usuarios/${usuario.id}`,
        { ...usuario, senha: novaSenha },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setUsuario({ ...usuario, senha: novaSenha });
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      mensagemSucesso('Senha alterada com sucesso.');
    } catch (error) {
      mensagemErro('Não foi possível alterar a senha.');
    }
  }

  function cancelarSenha() {
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
  }

  async function excluirConta() {
    if (session.role !== 'CLIENTE') return;

    if (!window.confirm('Deseja realmente excluir sua conta?')) return;

    try {
      await axios.patch(`${BASE_URL}/Usuarios/${usuario.id}`, {
        status: false,
      });
      clearSession();
      mensagemSucesso('Conta encerrada com sucesso.');
    } catch (error) {
      mensagemErro('Não foi possível excluir a conta.');
    }
  }

  if (!session || !usuario) return null;

  return (
    <div className='container'>
      <Card title='Configurações'>
        <div className='row g-4'>
          <div className='col-lg-7'>
            <form onSubmit={salvarDados}>
              <h5>Dados cadastrais</h5>
              <FormGroup label='Nome: *' htmlFor='config-nome'>
                <input
                  id='config-nome'
                  className='form-control'
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  required
                />
              </FormGroup>
              <FormGroup label='E-mail: *' htmlFor='config-email'>
                <input
                  id='config-email'
                  type='email'
                  className='form-control'
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </FormGroup>
              <div className='d-flex gap-2 mt-3'>
                <button type='submit' className='btn btn-primary'>
                  Salvar dados
                </button>
                <button
                  type='button'
                  className='btn btn-secondary'
                  onClick={cancelarDados}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>

          <div className='col-lg-5'>
            <form onSubmit={alterarSenha}>
              <h5>Alterar senha</h5>
              <FormGroup label='Senha atual: *' htmlFor='senha-atual'>
                <input
                  id='senha-atual'
                  type='password'
                  className='form-control'
                  value={senhaAtual}
                  onChange={(event) => setSenhaAtual(event.target.value)}
                  required
                />
              </FormGroup>
              <FormGroup label='Nova senha: *' htmlFor='nova-senha'>
                <input
                  id='nova-senha'
                  type='password'
                  className='form-control'
                  value={novaSenha}
                  onChange={(event) => setNovaSenha(event.target.value)}
                  required
                />
              </FormGroup>
              <FormGroup label='Confirmar senha: *' htmlFor='confirmar-senha'>
                <input
                  id='confirmar-senha'
                  type='password'
                  className='form-control'
                  value={confirmarSenha}
                  onChange={(event) => setConfirmarSenha(event.target.value)}
                  required
                />
              </FormGroup>
              <div className='d-flex gap-2 mt-3'>
                <button type='submit' className='btn btn-primary'>
                  Alterar senha
                </button>
                <button
                  type='button'
                  className='btn btn-secondary'
                  onClick={cancelarSenha}
                >
                  Cancelar
                </button>
              </div>
            </form>

            {session.role === 'CLIENTE' && (
              <button
                type='button'
                className='btn btn-danger mt-4'
                onClick={excluirConta}
              >
                Excluir conta
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Configuracoes;
