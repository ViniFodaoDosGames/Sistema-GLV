import React, { useState } from 'react';
import { ArrowForward, DirectionsCar, FactCheck, Shield } from '@mui/icons-material';
import RecoveryDialog from '../components/RecoveryDialog';
import RegisterDialog from '../components/RegisterDialog';
import { useAppData, findProfile } from '../context/AppDataContext';

const demoProfiles = [
  { role: 'cliente', label: 'Cliente', caption: 'Agende e acompanhe suas lavagens', Icon: DirectionsCar },
  { role: 'funcionario', label: 'Funcionário', caption: 'Acesse a fila e registre atendimentos', Icon: FactCheck },
  { role: 'administrador', label: 'Administrador', caption: 'Gerencie a operação e os cadastros', Icon: Shield },
];

function LoginPage({ onLogin }) {
  const { data } = useAppData();
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [selectedRole, setSelectedRole] = useState('cliente');
  const [error, setError] = useState('');
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const enterDemo = (role) => {
    try {
      onLogin(findProfile(data, role));
    } catch (loginError) {
      setError(loginError.message);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const digits = cpf.replace(/\D/g, '');
    const user = data.Usuarios.find((item) => item.cpf.replace(/\D/g, '') === digits);
    if (!user || !user.status) {
      setError('Não encontramos uma conta ativa com esse CPF.');
      return;
    }
    if (!password.trim()) {
      setError('Informe sua senha para continuar.');
      return;
    }

    try {
      const profile = findProfile(data, selectedRole);
      if (profile.userId !== user.id) {
        setError(`Este CPF não está vinculado ao perfil ${selectedRole}. Use o acesso rápido abaixo para conhecer a demonstração.`);
        return;
      }
      setError('');
      onLogin({ ...profile, remember });
    } catch (loginError) {
      setError(loginError.message);
    }
  };

  return (
    <main className="login-page">
      <section className="login-showcase">
        <div className="login-brand">
          <span className="brand-mark">G</span>
          <span><strong>GLV</strong><small>lava-jato</small></span>
        </div>
        <div className="showcase-copy">
          <span className="eyebrow">CUIDADO EM CADA DETALHE</span>
          <h1>Seu carro bem cuidado.<br />Seu tempo bem aproveitado.</h1>
          <p>Agende sua lavagem com praticidade e acompanhe tudo em um só lugar.</p>
        </div>
        <div className="showcase-note">
          <span className="showcase-dot" />
          <span>Experiência simples, do agendamento à entrega.</span>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <div className="login-heading-row">
            <div><span className="eyebrow">BEM-VINDO DE VOLTA</span><h2>Entre na sua conta</h2></div>
            <button type="button" className="text-button" onClick={() => setRegisterOpen(true)}>Criar conta</button>
          </div>
          <p className="muted-copy">Acesse sua área para continuar.</p>
          <form onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="login-cpf">CPF</label>
            <input
              id="login-cpf"
              autoComplete="username"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(event) => setCpf(event.target.value)}
              inputMode="numeric"
            />
            <label className="field-label" htmlFor="login-password">Senha</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <div className="login-options">
              <label className="checkbox-label">
                <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                <span>Lembrar de mim</span>
              </label>
              <button className="text-button" type="button" onClick={() => setRecoveryOpen(true)}>
                Esqueci minha senha
              </button>
            </div>
            <label className="field-label" htmlFor="login-role">Perfil de acesso</label>
            <select id="login-role" value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>
              {demoProfiles.map((profile) => <option value={profile.role} key={profile.role}>{profile.label}</option>)}
            </select>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-primary button-full" type="submit">
              Entrar <ArrowForward fontSize="small" />
            </button>
          </form>

          <div className="login-divider"><span>Acesso rápido à demonstração</span></div>
          <div className="quick-access-list">
            {demoProfiles.map(({ role, label, caption, Icon }) => (
              <button className="quick-access-card" type="button" onClick={() => enterDemo(role)} key={role}>
                <span className="quick-access-icon"><Icon fontSize="small" /></span>
                <span className="quick-access-copy"><strong>{label}</strong><small>{caption}</small></span>
                <ArrowForward className="quick-access-arrow" fontSize="small" />
              </button>
            ))}
          </div>
          <p className="demo-caption">Ambiente demonstrativo · a senha não é validada · dados salvos apenas neste navegador.</p>
        </div>
      </section>
      <RegisterDialog open={registerOpen} onClose={() => setRegisterOpen(false)} onRegistered={onLogin} />
      <RecoveryDialog open={recoveryOpen} onClose={() => setRecoveryOpen(false)} />
    </main>
  );
}

export default LoginPage;
