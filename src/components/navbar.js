import React from 'react';
import 'bootswatch/dist/flatly/bootstrap.css';

function Navbar({ sidebarOpen, onToggleSidebar, userName }) {
  return (
    <div className='navbar navbar-expand-lg'>
      <div className='container-fluid'>
        <button
          className='navbar-toggler sidebar-menu-toggle'
          type='button'
          onClick={onToggleSidebar}
          aria-controls='sidebar-navigation'
          aria-expanded={sidebarOpen}
          aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          <span className='navbar-toggler-icon'></span>
        </button>
        <div className='collapse navbar-collapse' id='navbarResponsive'>
          <ul className='navbar-nav ml-auto'>
            <li className='nav-item'>
              <a className='nav-link' href='/'>
                Sistema GLV
              </a>
            {userName && (
                <a className='nav-link' href='/configuracoes'>
                  {userName}
                </a>
            )}
              </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
