import React, { useState } from 'react';
import Modal from './Modal';
import { useAppData } from '../context/AppDataContext';

function RecoveryDialog({ open, onClose }) {
  const { data, updateRecord } = useAppData();
  const [step, setStep] = useState(1);
  const [cpf, setCpf] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');

  const reset = () => {
    setStep(1);
    setCpf('');
    setCode('');
    setPassword('');
    setConfirmation('');
    setUserId('');
    setMessage('');
    onClose();
  };

  const submitCpf = (event) => {
    event.preventDefault();
    const user = data.Usuarios.find((item) => item.cpf.replace(/\D/g, '') === cpf.replace(/\D/g, '') && item.status);
    if (!user) {
      setMessage('Não encontramos uma conta ativa com esse CPF.');
      return;
    }
    setUserId(user.id);
    setStep(2);
    setMessage('');
  };

  const submitCode = (event) => {
    event.preventDefault();
    if (code !== '123456') {
      setMessage('Código inválido. Use 123456 na demonstração local.');
      return;
    }
    setStep(3);
    setMessage('');
  };

  const submitPassword = (event) => {
    event.preventDefault();
    if (password.length < 8 || password !== confirmation) {
      setMessage(password.length < 8 ? 'A senha deve ter pelo menos 8 caracteres.' : 'As senhas não correspondem.');
      return;
    }
    updateRecord('Usuarios', userId, { senha: 'demo-local' });
    setStep(4);
    setMessage('Senha atualizada na demonstração. Nenhuma senha digitada foi armazenada.');
  };

  return (
    <Modal open={open} title="Recuperar senha" onClose={reset}>
      {step === 1 && <form className="dialog-form" onSubmit={submitCpf}><p>Informe o CPF vinculado à conta.</p><div className="field-group"><label className="field-label" htmlFor="recovery-cpf">CPF *</label><input id="recovery-cpf" inputMode="numeric" value={cpf} onChange={(event) => setCpf(event.target.value)} required /></div><div className="modal-actions"><button type="button" className="button button-quiet" onClick={reset}>Cancelar</button><button type="submit" className="button button-primary">Continuar</button></div></form>}
      {step === 2 && <form className="dialog-form" onSubmit={submitCode}><p>Digite o código de confirmação enviado ao e-mail cadastrado.</p><div className="demo-code">Código para demonstração: <strong>123456</strong></div><div className="field-group"><label className="field-label" htmlFor="recovery-code">Código de confirmação *</label><input id="recovery-code" inputMode="numeric" value={code} onChange={(event) => setCode(event.target.value)} required /></div><div className="modal-actions"><button type="button" className="button button-quiet" onClick={reset}>Cancelar</button><button type="submit" className="button button-primary">Validar código</button></div></form>}
      {step === 3 && <form className="dialog-form" onSubmit={submitPassword}><p>Crie uma nova senha para continuar.</p><div className="field-group"><label className="field-label" htmlFor="recovery-password">Nova senha *</label><input id="recovery-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div><div className="field-group"><label className="field-label" htmlFor="recovery-confirm">Confirmar senha *</label><input id="recovery-confirm" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></div><div className="modal-actions"><button type="button" className="button button-quiet" onClick={reset}>Cancelar</button><button type="submit" className="button button-primary">Salvar senha</button></div></form>}
      {step === 4 && <div><p>{message}</p><div className="modal-actions"><button type="button" className="button button-primary" onClick={reset}>Concluir</button></div></div>}
      {message && step !== 4 && <p className="form-error" role="alert">{message}</p>}
      <p className="demo-notice">Fluxo ilustrativo. Este protótipo não envia e-mails e não implementa autenticação.</p>
    </Modal>
  );
}

export default RecoveryDialog;
