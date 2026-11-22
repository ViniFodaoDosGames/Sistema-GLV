import React from 'react';
import { Navigate } from 'react-router-dom';

import Card from '../components/card';
import { obterSessao, PERFIS } from '../config/sessao';

function Inicio() {
  const sessao = obterSessao();

  if (sessao.perfil === PERFIS.CLIENTE) return <Navigate to='/listagem-agendamento' replace />;
  if (sessao.perfil === PERFIS.FUNCIONARIO) return <Navigate to='/agendamentos' replace />;
  if (sessao.perfil === PERFIS.ADMIN) return <Navigate to='/relatorios' replace />;

  return (
    <div className='container'>
      <Card title='Sistema GLV'>
        <p>
          Seu usuário ainda não está vinculado como cliente, funcionário ou administrador.
          Procure o administrador do lava-jato.
        </p>
      </Card>
    </div>
  );
}

export default Inicio;
