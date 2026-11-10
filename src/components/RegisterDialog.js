import React, { useState } from 'react';
import Modal from './Modal';
import { useAppData } from '../context/AppDataContext';
import TermsDialog from './TermsDialog';

const initialForm = {
  nome: '',
  cpf: '',
  email: '',
  celular: '',
  senha: '',
  confirmacao: '',
  aceitou: false,
};

function isValidCpf(value) {
  const cpf = value.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calculateDigit = (sliceLength) => {
    const sum = cpf.slice(0, sliceLength).split('').reduce(
      (total, digit, index) => total + Number(digit) * (sliceLength + 1 - index),
      0
    );
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return calculateDigit(9) === Number(cpf[9]) && calculateDigit(10) === Number(cpf[10]);
}

function RegisterDialog({ open, onClose, onRegistered }) {
  const { data, createRecord } = useAppData();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [termsOpen, setTermsOpen] = useState(false);

  const handleRegister = (event) => {
    event.preventDefault();
    if (!isValidCpf(form.cpf)) {
      setError('Informe um CPF válido.');
      return;
    }
    if (data.Usuarios.some((user) => user.cpf.replace(/\D/g, '') === form.cpf.replace(/\D/g, ''))) {
      setError('Já existe uma conta cadastrada com esse CPF.');
      return;
    }
    if (form.senha.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (form.senha !== form.confirmacao) {
      setError('A confirmação de senha não corresponde.');
      return;
    }
    if (!form.aceitou) {
      setError('Aceite os Termos de Uso e a Política de Privacidade para continuar.');
      return;
    }

    const user = createRecord('Usuarios', {
      nome: form.nome.trim(),
      cpf: form.cpf.replace(/\D/g, ''),
      email: form.email.trim(),
      celular: form.celular.replace(/\D/g, ''),
      senha: 'demo-local',
      status: true,
    });
    const customer = createRecord('Clientes', {
      idUsuario: user.id,
      dataAceiteTermos: new Date().toISOString(),
    });
    setForm(initialForm);
    setError('');
    onRegistered({ role: 'cliente', userId: user.id, profileId: customer.id, user, remember: false });
  };

  return (
    <>
      <Modal open={open} title="Criar conta de cliente" onClose={onClose} size="large">
        <p>Preencha seus dados para começar a agendar. Os dados ficam somente neste navegador.</p>
        <form className="form-grid" onSubmit={handleRegister}>
          <div className="field-group field-span-2"><label className="field-label" htmlFor="register-name">Nome completo *</label><input id="register-name" value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} required /></div>
          <div className="field-group"><label className="field-label" htmlFor="register-cpf">CPF *</label><input id="register-cpf" inputMode="numeric" value={form.cpf} onChange={(event) => setForm({ ...form, cpf: event.target.value })} required /></div>
          <div className="field-group"><label className="field-label" htmlFor="register-phone">Celular *</label><input id="register-phone" inputMode="tel" value={form.celular} onChange={(event) => setForm({ ...form, celular: event.target.value })} required /></div>
          <div className="field-group field-span-2"><label className="field-label" htmlFor="register-email">E-mail *</label><input id="register-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></div>
          <div className="field-group"><label className="field-label" htmlFor="register-password">Senha *</label><input id="register-password" type="password" autoComplete="new-password" value={form.senha} onChange={(event) => setForm({ ...form, senha: event.target.value })} required /></div>
          <div className="field-group"><label className="field-label" htmlFor="register-confirm">Confirmar senha *</label><input id="register-confirm" type="password" autoComplete="new-password" value={form.confirmacao} onChange={(event) => setForm({ ...form, confirmacao: event.target.value })} required /></div>
          <label className="checkbox-label field-span-2"><input type="checkbox" checked={form.aceitou} onChange={(event) => setForm({ ...form, aceitou: event.target.checked })} /><span>Aceito os <button className="text-button" type="button" onClick={(event) => { event.preventDefault(); setTermsOpen(true); }}>Termos de Uso e a Política de Privacidade</button></span></label>
          {error && <p className="form-error field-span-2" role="alert">{error}</p>}
          <div className="modal-actions field-span-2"><button type="button" className="button button-quiet" onClick={onClose}>Cancelar</button><button type="submit" className="button button-primary">Criar conta</button></div>
        </form>
        <p className="demo-notice">Este cadastro é local e demonstrativo; não use uma senha real.</p>
      </Modal>
      <TermsDialog open={termsOpen} onClose={() => setTermsOpen(false)} />
    </>
  );
}

export default RegisterDialog;
