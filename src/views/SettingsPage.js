import React, { useState } from 'react';
import { Check, Lock, Person } from '@mui/icons-material';
import Modal from '../components/Modal';
import { useAppData } from '../context/AppDataContext';

function SettingsPage({ session, onSignOut, onProfileUpdate }) {
  const { updateRecord } = useAppData();
  const [values, setValues] = useState({
    nome: session.user.nome || '',
    email: session.user.email || '',
    celular: session.user.celular || '',
  });
  const [saved, setSaved] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [error, setError] = useState('');

  const saveProfile = (event) => {
    event.preventDefault();
    if (!values.nome.trim() || !values.email.trim()) {
      setError('Nome e e-mail são obrigatórios.');
      return;
    }
    updateRecord('Usuarios', session.userId, values);
    onProfileUpdate({ ...session, user: { ...session.user, ...values } });
    setError('');
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const deactivateAccount = () => {
    updateRecord('Usuarios', session.userId, { status: false });
    setAccountDialogOpen(false);
    onSignOut();
  };

  return (
    <div className="settings-layout">
      <aside className="settings-nav panel">
        <div className="settings-nav-item is-active"><Person fontSize="small" /> Dados pessoais</div>
        <div className="settings-nav-item"><Lock fontSize="small" /> Segurança e acesso</div>
      </aside>
      <div className="settings-main">
        <section className="panel settings-card">
          <div className="section-title-row"><div><h2>Dados pessoais</h2><p>Atualize as informações associadas à sua conta.</p></div></div>
          <form className="settings-form" onSubmit={saveProfile}>
            <div className="field-group"><label className="field-label" htmlFor="settings-name">Nome completo *</label><input id="settings-name" value={values.nome} onChange={(event) => setValues({ ...values, nome: event.target.value })} required /></div>
            <div className="field-group"><label className="field-label" htmlFor="settings-email">E-mail *</label><input id="settings-email" type="email" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} required /></div>
            <div className="field-group"><label className="field-label" htmlFor="settings-phone">Celular</label><input id="settings-phone" value={values.celular} onChange={(event) => setValues({ ...values, celular: event.target.value })} /></div>
            <div className="field-group"><label className="field-label" htmlFor="settings-cpf">CPF</label><input id="settings-cpf" value={session.user.cpf} readOnly /></div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="settings-form-footer"><button className="button button-primary" type="submit">{saved ? <><Check fontSize="small" /> Salvo</> : 'Salvar alterações'}</button>{saved && <span className="success-copy">Dados atualizados neste navegador.</span>}</div>
          </form>
        </section>
        <section className="panel settings-card security-card">
          <div><span className="settings-security-icon"><Lock /></span><div><h2>Segurança da conta</h2><p>As credenciais desta demonstração são apenas locais. A autenticação real exige um serviço seguro no servidor.</p></div></div>
          <button type="button" className="button button-outline" onClick={() => setError('A troca de senha precisa de uma API de autenticação, indisponível nesta demonstração frontend.')}>Alterar senha</button>
        </section>
        <section className="danger-zone">
          <div><h2>Excluir conta</h2><p>A desativação encerra o acesso demonstrativo e preserva os registros do histórico.</p></div>
          <button type="button" className="button button-danger-outline" onClick={() => setAccountDialogOpen(true)}>Excluir conta</button>
        </section>
      </div>
      <Modal open={accountDialogOpen} title="Excluir conta" onClose={() => setAccountDialogOpen(false)}>
        <p>Deseja encerrar o acesso desta conta? Os dados de histórico da demonstração não serão removidos.</p>
        <div className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setAccountDialogOpen(false)}>Manter conta</button><button type="button" className="button button-danger" onClick={deactivateAccount}>Confirmar exclusão</button></div>
      </Modal>
    </div>
  );
}

export default SettingsPage;
