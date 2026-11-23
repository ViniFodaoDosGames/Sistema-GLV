import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';

import FormGroup from '../../components/form-group';
import { mensagemErro } from '../../components/toastr';

import '../../custom.css';

import { carregar, inserir } from '../../config/api';
import { obterSessao, fazerLogin } from '../../config/sessao';
import { agora, emailValido, mascaraCelular, mascaraCpf, somenteDigitos } from '../../config/util';

function Registrar() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [aceite, setAceite] = useState(false);

  if (obterSessao()) {
    return <Navigate to='/' replace />;
  }

  async function criarConta(e) {
    e.preventDefault();
    if (!nome.trim()) {
      mensagemErro('Informe o nome');
      return;
    }
    if (somenteDigitos(cpf).length !== 11) {
      mensagemErro('Informe o CPF completo');
      return;
    }
    if (!emailValido(email)) {
      mensagemErro('Informe um e-mail válido');
      return;
    }
    if (somenteDigitos(celular).length < 10) {
      mensagemErro('Informe o celular com DDD');
      return;
    }
    if (senha.length < 6) {
      mensagemErro('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (senha !== confirmacao) {
      mensagemErro('A confirmação não confere com a senha');
      return;
    }
    if (!aceite) {
      mensagemErro('É preciso aceitar os termos de uso');
      return;
    }

    try {
      const { Usuarios } = await carregar(['Usuarios']);
      if (Usuarios.some((usuario) => somenteDigitos(usuario.cpf) === somenteDigitos(cpf))) {
        mensagemErro('Já existe uma conta com este CPF');
        return;
      }
      const usuario = await inserir('Usuarios', {
        nome: nome.trim(),
        cpf: somenteDigitos(cpf),
        email: email.trim(),
        celular: somenteDigitos(celular),
        senha,
        status: true,
      });
      await inserir('Clientes', { idUsuario: usuario.id, dataAceiteTermos: agora() });
      await fazerLogin(cpf, senha);
      navigate('/');
    } catch (erro) {
      mensagemErro('Não foi possível criar a conta');
    }
  }

  return (
    <div className='tela-login'>
      <div className='card shadow-sm'>
        <div className='card-body p-4'>
          <h3 className='text-center mb-1'>Criar conta</h3>
          <p className='text-center text-muted mb-4'>Preencha seus dados para agendar</p>
          <form onSubmit={criarConta}>
            <FormGroup label='Nome: *' htmlFor='inputNome'>
              <input
                type='text'
                id='inputNome'
                value={nome}
                className='form-control'
                autoComplete='name'
                onChange={(e) => setNome(e.target.value)}
              />
            </FormGroup>
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
            <FormGroup label='E-mail: *' htmlFor='inputEmail'>
              <input
                type='email'
                id='inputEmail'
                value={email}
                className='form-control'
                autoComplete='email'
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormGroup>
            <FormGroup label='Celular: *' htmlFor='inputCelular'>
              <input
                type='text'
                id='inputCelular'
                value={celular}
                className='form-control'
                placeholder='(00) 00000-0000'
                inputMode='numeric'
                autoComplete='tel'
                onChange={(e) => setCelular(mascaraCelular(e.target.value))}
              />
            </FormGroup>
            <FormGroup label='Senha: *' htmlFor='inputSenha'>
              <input
                type='password'
                id='inputSenha'
                value={senha}
                className='form-control'
                autoComplete='new-password'
                onChange={(e) => setSenha(e.target.value)}
              />
            </FormGroup>
            <FormGroup label='Confirmar senha: *' htmlFor='inputConfirmacao'>
              <input
                type='password'
                id='inputConfirmacao'
                value={confirmacao}
                className='form-control'
                autoComplete='new-password'
                onChange={(e) => setConfirmacao(e.target.value)}
              />
            </FormGroup>
            <div className='form-check my-3'>
              <input
                type='checkbox'
                id='inputAceite'
                className='form-check-input'
                checked={aceite}
                onChange={(e) => setAceite(e.target.checked)}
              />
              <label className='form-check-label' htmlFor='inputAceite'>
                Li e aceito os termos de uso
              </label>
            </div>
            <button type='submit' className='btn btn-success w-100'>
              Criar conta
            </button>
            <Link className='btn btn-danger w-100 mt-2' to='/login'>
              Voltar
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Registrar;
