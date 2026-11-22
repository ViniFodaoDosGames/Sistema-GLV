import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { mensagemAlert } from './toastr';

function CancelarCadastro() {
  const navigate = useNavigate();
  const [versao, setVersao] = useState(0);
  const [alterado, setAlterado] = useState(false);

  function cancelar(destino) {
    if (alterado) {
      setAlterado(false);
      setVersao(versao + 1);
      mensagemAlert('Alterações apagadas. Clique em Cancelar de novo para sair.');
    } else {
      navigate(destino);
    }
  }

  return (
    <div key={versao} onChange={() => setAlterado(true)}>
      <Outlet context={{ cancelar }} />
    </div>
  );
}

export default CancelarCadastro;
