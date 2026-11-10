import React from 'react';
import Modal from './Modal';

function TermsDialog({ open, onClose }) {
  return (
    <Modal open={open} title="Termos de Uso e Política de Privacidade" onClose={onClose} size="large">
      <div className="terms-copy">
        <h3>Uso da demonstração</h3>
        <p>Esta interface é um protótipo local para demonstrar agendamentos, veículos, pagamentos e atendimento. Não há integração com serviços externos nem processamento de pagamentos reais.</p>
        <h3>Dados pessoais</h3>
        <p>As informações preenchidas ficam salvas no armazenamento local deste navegador para permitir a demonstração. Não informe dados pessoais reais. Limpe os dados do site para remover os registros locais.</p>
        <h3>Consentimento</h3>
        <p>Ao aceitar, você registra localmente a data e hora do aceite. Este texto demonstrativo não substitui os termos legais de uma aplicação em produção.</p>
      </div>
      <div className="modal-actions"><button type="button" className="button button-primary" onClick={onClose}>Entendi</button></div>
    </Modal>
  );
}

export default TermsDialog;
