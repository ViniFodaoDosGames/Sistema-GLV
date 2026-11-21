import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Card from '../../components/card';
import FormGroup from '../../components/form-group';
import { autenticar, getSession, setSession } from '../../auth';
import { mensagemErro, mensagemSucesso } from '../../components/toastr';
import '../../custom.css';

function Login() {
  const navigate = useNavigate();
  const session = getSession();
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(false);
  const [carregando, setCarregando] = useState(false);

  if (session) {
    return <Navigate to='/configuracoes' replace />;
  }

  async function entrar(event) {
    event.preventDefault();
    setCarregando(true);

    try {
      const autenticado = await autenticar(cpf, senha);
      setSession(autenticado, lembrar);
      mensagemSucesso(`Bem-vindo, ${autenticado.usuario.nome}!`);
      navigate('/configuracoes');
    } catch (error) {
      mensagemErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className='container py-5'>
      <div className='row justify-content-center'>
        <div className='col-lg-5 col-md-8'>
          <Card title='Entrar'>
            <form onSubmit={entrar}>
              <FormGroup label='CPF: *' htmlFor='login-cpf'>
                <input
                  id='login-cpf'
                  className='form-control'
                  value={cpf}
                  onChange={(event) => setCpf(event.target.value)}
                  inputMode='numeric'
                  required
                />
              </FormGroup>
              <FormGroup label='Senha: *' htmlFor='login-senha'>
                <input
                  id='login-senha'
                  type='password'
                  className='form-control'
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  required
                />
              </FormGroup>
              <div className='form-check my-3'>
                <input
                  id='lembrar'
                  className='form-check-input'
                  type='checkbox'
                  checked={lembrar}
                  onChange={(event) => setLembrar(event.target.checked)}
                />
                <label className='form-check-label' htmlFor='lembrar'>
                  Lembrar de mim
                </label>
              </div>
              <button
                type='submit'
                className='btn btn-primary w-100'
                disabled={carregando}
              >
                {carregando ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Login;
