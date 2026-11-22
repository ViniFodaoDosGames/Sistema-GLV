import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';

import FormGroup from '../../components/form-group';
import { mensagemSucesso, mensagemErro } from '../../components/toastr';

import '../../custom.css';

import { obterSessao, fazerLogin } from '../../config/sessao';
import { mascaraCpf, somenteDigitos } from '../../config/util';

function Login() {
  const navigate = useNavigate();

  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');

  if (obterSessao()) {
    return <Navigate to='/' replace />;
  }

  async function entrar(e) {
    e.preventDefault();
    if (somenteDigitos(cpf).length !== 11) {
      mensagemErro('Informe o CPF completo');
      return;
    }
    if (!senha) {
      mensagemErro('Informe a senha');
      return;
    }

    try {
      const sessao = await fazerLogin(cpf, senha);
      mensagemSucesso(`Bem-vindo, ${sessao.usuario.nome}!`);
      navigate('/');
    } catch (erro) {
      mensagemErro(erro instanceof TypeError ? 'Não foi possível conectar ao servidor' : erro.message);
    }
  }

  return (
    <div className='tela-login'>
      <div className='card shadow-sm'>
        <div className='card-body p-4'>
          <h3 className='text-center mb-1'>Sistema GLV</h3>
          <p className='text-center text-muted mb-4'>Entre com seu CPF e senha</p>
          <form onSubmit={entrar}>
            <FormGroup label='CPF: *' htmlFor='inputCpf'>
              <input
                type='text'
                id='inputCpf'
                value={cpf}
                className='form-control'
                placeholder='000.000.000-00'
                inputMode='numeric'
                autoComplete='username'
                onChange={(e) => setCpf(mascaraCpf(e.target.value))}
              />
            </FormGroup>
            <FormGroup label='Senha: *' htmlFor='inputSenha'>
              <input
                type='password'
                id='inputSenha'
                value={senha}
                className='form-control'
                autoComplete='current-password'
                onChange={(e) => setSenha(e.target.value)}
              />
            </FormGroup>
            <div className='text-end mb-3'>
              <Link to='/recuperar-senha'>Esqueci minha senha</Link>
            </div>
            <button type='submit' className='btn btn-success w-100'>
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
