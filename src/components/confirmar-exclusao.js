import React from 'react';
import { createRoot } from 'react-dom/client';

import Modal from './modal';

export function confirmarExclusao(titulo) {
  return new Promise((resolve) => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const root = createRoot(div);

    function responder(resposta) {
      resolve(resposta);
      setTimeout(() => {
        root.unmount();
        div.remove();
      });
    }

    root.render(
      <Modal
        aberto
        titulo={titulo}
        onFechar={() => responder(false)}
        rodape={
          <>
            <button type='button' className='btn btn-secondary' onClick={() => responder(false)}>
              Voltar
            </button>
            <button type='button' className='btn btn-danger' onClick={() => responder(true)}>
              Excluir
            </button>
          </>
        }
      >
        <p className='mb-0'>Confirma a exclusão? Essa ação não pode ser desfeita.</p>
      </Modal>
    );
  });
}
