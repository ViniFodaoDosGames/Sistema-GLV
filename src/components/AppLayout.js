import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, Settings } from '@mui/icons-material';
import SideBar from './sideBar';
import menuConfig from '../config/rotasMenu.json';

const pageTitles = {
  '/inicio': 'Visão geral',
  '/cliente/agendamentos': 'Meus agendamentos',
  '/cliente/novo-agendamento': 'Novo agendamento',
  '/cliente/veiculos': 'Meus veículos',
  '/cliente/pontos': 'Meus pontos',
  '/operacao/atendimentos': 'Check-in e check-out',
  '/operacao/agendamentos': 'Agendamentos',
  '/configuracoes': 'Configurações',
  '/admin/pagamentos': 'Pagamentos',
  '/admin/lotes-pontos': 'Lotes de pontos',
  '/admin/notificacoes': 'Notificações',
  '/admin/logs': 'Log de movimentações',
  '/admin/relatorios': 'Relatórios',
};

const roleLabels = {
  cliente: 'CLIENTE',
  funcionario: 'FUNCIONÁRIO',
  administrador: 'ADMINISTRADOR',
};

function AppLayout({ session, onSignOut }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const activeMenuItem = menuConfig.linksCadastros.find((item) => item.href === location.pathname);
  const title = pageTitles[location.pathname] || activeMenuItem?.label || 'Cadastros';

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <div className="app-shell">
      <SideBar
        session={session}
        onSignOut={onSignOut}
        mobileOpen={mobileOpen}
        onNavigate={closeMobileMenu}
      />
      {mobileOpen && <button className="mobile-backdrop" aria-label="Fechar menu" onClick={closeMobileMenu} />}
      <div className="app-main">
        <header className="topbar">
          <button
            className="mobile-menu-button"
            type="button"
            aria-label="Abrir menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu />
          </button>
          <div className="topbar-title">
            <span className="eyebrow">SISTEMA GLV / {roleLabels[session.role]}</span>
            <h1>{title}</h1>
          </div>
          <div className="topbar-actions">
            <span className="today-label">
              {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date())}
            </span>
            <Link className="topbar-settings" to="/configuracoes" aria-label="Configurações" title="Configurações"><Settings fontSize="small" /></Link>
            <span className="topbar-avatar">{session.user.nome.slice(0, 1).toUpperCase()}</span>
          </div>
        </header>
        <main className="app-content"><Outlet /></main>
      </div>
    </div>
  );
}

export default AppLayout;
