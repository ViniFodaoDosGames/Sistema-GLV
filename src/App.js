import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AppDataProvider } from './context/AppDataContext';
import AppLayout from './components/AppLayout';
import LoginPage from './views/LoginPage';
import DashboardPage from './views/DashboardPage';
import AppointmentsPage from './views/AppointmentsPage';
import PointsPage from './views/PointsPage';
import VehiclesPage from './views/VehiclesPage';
import OperationsPage from './views/OperationsPage';
import CatalogPage from './views/CatalogPage';
import ReportsPage from './views/ReportsPage';
import SettingsPage from './views/SettingsPage';
import './App.css';

function RoleGate({ session, roles, children }) {
  return roles.includes(session.role) ? children : <Navigate to="/inicio" replace />;
}

const legacyCollections = {
  administrador: 'Administradores',
  agendamento: 'Agendamentos',
  bloqueio: 'Bloqueios',
  'categoria-veiculo': 'CategoriasVeiculo',
  cliente: 'Clientes',
  cor: 'Cores',
  feriado: 'Feriados',
  funcionario: 'Funcionarios',
  'horario-funcionamento': 'HorariosFuncionamento',
  'intervalo-almoço': 'IntervalosAlmoco',
  'intervalo-almoco': 'IntervalosAlmoco',
  lavajato: 'LavaJatos',
  marca: 'Marcas',
  modelo: 'Modelos',
  notificacao: 'Notificacoes',
  pagamento: 'Pagamentos',
  servico: 'Servicos',
  'tipo-feriado': 'TiposFeriado',
  usuario: 'Usuarios',
  veiculo: 'Veiculos',
  'lote-ponto': 'LotesPontos',
};

function LegacyCatalogRedirect() {
  const { resource } = useParams();
  const collection = legacyCollections[resource];
  return <Navigate to={collection ? `/admin/cadastros/${collection}` : '/inicio'} replace />;
}

function AppRoutes() {
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem('glv-remembered-session'))
        || JSON.parse(window.sessionStorage.getItem('glv-session'))
        || null;
    } catch (error) {
      console.error('Não foi possível restaurar a sessão local.', error);
      return null;
    }
  });

  useEffect(() => {
    if (session) {
      const storage = session.remember ? window.localStorage : window.sessionStorage;
      const otherStorage = session.remember ? window.sessionStorage : window.localStorage;
      storage.setItem(session.remember ? 'glv-remembered-session' : 'glv-session', JSON.stringify(session));
      otherStorage.removeItem(session.remember ? 'glv-session' : 'glv-remembered-session');
    } else {
      window.sessionStorage.removeItem('glv-session');
      window.localStorage.removeItem('glv-remembered-session');
    }
  }, [session]);

  const signOut = () => setSession(null);

  return (
    <Routes>
      <Route
        path="/login"
        element={session ? <Navigate to="/inicio" replace /> : <LoginPage onLogin={setSession} />}
      />
      <Route path="/" element={<Navigate to={session ? '/inicio' : '/login'} replace />} />
      <Route
        element={
          session ? (
            <AppLayout session={session} onSignOut={signOut} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route path="/inicio" element={<DashboardPage session={session} />} />
        <Route path="/cliente/agendamentos" element={<RoleGate session={session} roles={['cliente']}><AppointmentsPage session={session} /></RoleGate>} />
        <Route path="/cliente/novo-agendamento" element={<RoleGate session={session} roles={['cliente']}><AppointmentsPage session={session} startNew /></RoleGate>} />
        <Route path="/cliente/veiculos" element={<RoleGate session={session} roles={['cliente']}><VehiclesPage session={session} /></RoleGate>} />
        <Route path="/cliente/pontos" element={<RoleGate session={session} roles={['cliente']}><PointsPage session={session} /></RoleGate>} />
        <Route path="/operacao/atendimentos" element={<RoleGate session={session} roles={['funcionario', 'administrador']}><OperationsPage session={session} /></RoleGate>} />
        <Route path="/operacao/agendamentos" element={<RoleGate session={session} roles={['funcionario', 'administrador']}><AppointmentsPage session={session} staffMode /></RoleGate>} />
        <Route path="/admin/cadastros/:collection" element={<RoleGate session={session} roles={['administrador']}><CatalogPage session={session} /></RoleGate>} />
        <Route path="/admin/pagamentos" element={<RoleGate session={session} roles={['administrador']}><CatalogPage session={session} fixedCollection="Pagamentos" /></RoleGate>} />
        <Route path="/admin/lotes-pontos" element={<RoleGate session={session} roles={['administrador']}><CatalogPage session={session} fixedCollection="LotesPontos" /></RoleGate>} />
        <Route path="/admin/notificacoes" element={<RoleGate session={session} roles={['administrador']}><CatalogPage session={session} fixedCollection="Notificacoes" /></RoleGate>} />
        <Route path="/admin/logs" element={<RoleGate session={session} roles={['administrador']}><CatalogPage session={session} fixedCollection="LogsMovimentacao" /></RoleGate>} />
        <Route path="/admin/relatorios" element={<RoleGate session={session} roles={['administrador']}><ReportsPage session={session} /></RoleGate>} />
        <Route path="/configuracoes" element={<SettingsPage session={session} onSignOut={signOut} onProfileUpdate={setSession} />} />
        <Route path="/listagem-:resource" element={<RoleGate session={session} roles={['administrador']}><LegacyCatalogRedirect /></RoleGate>} />
        <Route path="/cadastro-:resource/:idParam?" element={<RoleGate session={session} roles={['administrador']}><LegacyCatalogRedirect /></RoleGate>} />
        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AppDataProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </BrowserRouter>
    </AppDataProvider>
  );
}

export default App;
