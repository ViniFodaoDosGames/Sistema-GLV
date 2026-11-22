import React from 'react';
import { createPortal } from 'react-dom';

function Modal({ aberto, titulo, onFechar, rodape, children, grande }) {
  if (!aberto) return null;

  return createPortal(
    <>
      <div className='modal d-block' tabIndex='-1' role='dialog' aria-modal='true'>
        <div className={`modal-dialog modal-dialog-scrollable${grande ? ' modal-lg' : ''}`} role='document'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>{titulo}</h5>
              <button type='button' className='btn-close' aria-label='Fechar' onClick={onFechar} />
            </div>
            <div className='modal-body'>{children}</div>
            {rodape && <div className='modal-footer'>{rodape}</div>}
          </div>
        </div>
      </div>
      <div className='modal-backdrop show' />
    </>,
    document.body
  );
}

export default Modal;
