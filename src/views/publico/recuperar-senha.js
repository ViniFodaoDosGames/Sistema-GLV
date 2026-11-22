import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import FormGroup from '../../components/form-group';
import { mensagemSucesso, mensagemErro, mensagemAlert } from '../../components/toastr';

import '../../custom.css';

import { carregar, alterar } from '../../config/api';
import { mascaraCpf, somenteDigitos } from '../../config/util';

function mascararEmail(email) {
  const [nome, dominio] = (email || '').split('@');
  if (!dominio) return 'e-mail cadastrado';
  return `${nome.substring(0, 2)}${'*'.repeat(Math.max(nome.length - 2, 1))}@${dominio}`;
}

function RecuperarSenha() {
  const navigate = useNavigate();

  const [etapa, setEtapa] = useState(1);
  const [cpf, setCpf] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [codigoGerado, setCodigoGerado] = useState('');
  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');

  async function enviarCodigo(e) {
    e.preventDefault();
    try {
      const { Usuarios } = await carregar(['Usuarios']);
      const encontrado = Usuarios.find((u) => somenteDigitos(u.cpf) === somenteDigitos(cpf));
      if (!encontrado) {
        mensagemErro('CPF não encontrado');
        return;
      }
      const novoCodigo = String(Math.floor(100000 + Math.random() * 900000));
      setUsuario(encontrado);
      setCodigoGerado(novoCodigo);
      setEtapa(2);
      mensagemAlert(`Código enviado para ${mascararEmail(encontrado.email)}. Simulação: ${novoCodigo}`);
    } catch (erro) {
      mensagemErro('Não foi possível conectar ao servidor');
    }
  }

  function conferirCodigo(e) {
    e.preventDefault();
    if (codigo.trim() !== codigoGerado) {
      mensagemErro('Código inválido');
      return;
    }
    setEtapa(3);
  }

  async function salvarSenha(e) {
    e.preventDefault();
    if (senha.length < 6) {
      mensagemErro('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (senha !== confirmacao) {
      mensagemErro('A confirmação não confere com a senha');
      return;
    }
    try {
      await alterar('Usuarios', usuario.id, { senha });
      mensagemSucesso('Senha alterada! Entre com a nova senha.');
      navigate('/login');
    } catch (erro) {
      mensagemErro('Erro ao alterar a senha');
    }
  }

  return (
    <div className='tela-login'>
      <div className='card shadow-sm'>
        <div className='card-body p-4'>
          <h3 className='text-center mb-1'>Recuperar senha</h3>

          {etapa === 1 && (
            <form onSubmit={enviarCodigo}>
              <p className='text-center text-muted mb-4'>Informe seu CPF para receber um código</p>
              <FormGroup label='CPF: *' htmlFor='inputCpf'>
                <input
                  type='text'
                  id='inputCpf'
                  value={cpf}
                  className='form-control'
                  placeholder='000.000.000-00'
                  inputMode='numeric'
                  onChange={(e) => setCpf(mascaraCpf(e.target.value))}
                />
              </FormGroup>
              <button type='submit' className='btn btn-success w-100'>
                Enviar código
              </button>
              <Link className='btn btn-danger w-100 mt-2' to='/login'>
                Voltar
              </Link>
            </form>
          )}

          {etapa === 2 && (
            <form onSubmit={conferirCodigo}>
              <p className='text-center text-muted mb-4'>
                Digite o código de 6 dígitos enviado para {mascararEmail(usuario.email)}.
              </p>
              <FormGroup label='Código: *' htmlFor='inputCodigo'>
                <input
                  type='text'
                  id='inputCodigo'
                  value={codigo}
                  className='form-control'
                  inputMode='numeric'
                  maxLength={6}
                  onChange={(e) => setCodigo(somenteDigitos(e.target.value))}
                />
              </FormGroup>
              <button type='submit' className='btn btn-success w-100'>
                Confirmar
              </button>
              <button type='button' className='btn btn-danger w-100 mt-2' onClick={() => setEtapa(1)}>
                Voltar
              </button>
            </form>
          )}

          {etapa === 3 && (
            <form onSubmit={salvarSenha}>
              <p className='text-center text-muted mb-4'>Escolha uma nova senha</p>
              <FormGroup label='Nova senha: *' htmlFor='inputSenha'>
                <input
                  type='password'
                  id='inputSenha'
                  value={senha}
                  className='form-control'
                  autoComplete='new-password'
                  onChange={(e) => setSenha(e.target.value)}
                />
              </FormGroup>
              <FormGroup label='Confirmação: *' htmlFor='inputConfirmacao'>
                <input
                  type='password'
                  id='inputConfirmacao'
                  value={confirmacao}
                  className='form-control'
                  autoComplete='new-password'
                  onChange={(e) => setConfirmacao(e.target.value)}
                />
              </FormGroup>
              <button type='submit' className='btn btn-success w-100'>
                Salvar nova senha
              </button>
              <Link className='btn btn-danger w-100 mt-2' to='/login'>
                Cancelar
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecuperarSenha;
