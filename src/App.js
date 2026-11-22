import React, { useEffect, useState } from 'react';
import 'bootswatch/dist/flatly/bootstrap.css';
import 'toastr/build/toastr.min';
import 'toastr/build/toastr.css';
import './menu.css';
import Navbar from './components/navbar.js';
import Rotas from './rotas.js';
import SideBaR from './components/sideBar.js';
import { getSession } from './auth';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [session, setSession] = useState(() => getSession());

  useEffect(() => {
    const atualizarSessao = () => setSession(getSession());
    window.addEventListener('auth-change', atualizarSessao);
    window.addEventListener('storage', atualizarSessao);
    return () => {
      window.removeEventListener('auth-change', atualizarSessao);
      window.removeEventListener('storage', atualizarSessao);
    };
  }, []);

  useEffect(() => {
    if (!isSidebarOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  return (
    <div className='app-layout'>
      {session && (
        <SideBaR
          isOpen={isSidebarOpen}
          onNavigate={() => setIsSidebarOpen(false)}
          role={session.role}
        />
      )}
      {session && isSidebarOpen && (
        <button
          className='sidebar-backdrop'
          type='button'
          aria-label='Fechar navegação'
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div className='app-main'>
        {session && (
          <Navbar
            sidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
            userName={session.usuario.nome}
          />
        )}
        <main className='app-content'>
          <Rotas />
        </main>
      </div>
    </div>
  );
}

export default App;