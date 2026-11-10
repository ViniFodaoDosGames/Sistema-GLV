import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart,
  CalendarMonth,
  Dashboard,
  DirectionsCar,
  FactCheck,
  Inventory2,
  Logout,
  Payments,
  ReceiptLong,
  Settings,
} from '@mui/icons-material';
import menuConfig from '../config/rotasMenu.json';

const icons = {
  calendar_month: CalendarMonth,
  directions_car: DirectionsCar,
  payments: Payments,
  settings: Settings,
  fact_check: FactCheck,
  inventory_2: Inventory2,
  receipt_long: ReceiptLong,
  bar_chart: BarChart,
};

const roleLabels = {
  cliente: 'Cliente',
  funcionario: 'Funcionário',
  administrador: 'Administrador',
};

function SideBaR({ session, onSignOut, mobileOpen, onNavigate }) {
  const location = useLocation();
  const [openGroup, setOpenGroup] = useState('');
  const links = useMemo(
    () => menuConfig.linksCadastros.filter((link) => link.roles.includes(session.role)),
    [session.role]
  );

  useEffect(() => {
    const activeLink = links.find((link) => link.href === location.pathname);
    if (activeLink) setOpenGroup(activeLink.idDropdown);
  }, [location.pathname, session.role, links]);

  const groups = menuConfig.dropDownTitulos
    .map((group) => ({
      ...group,
      links: links.filter((link) => link.idDropdown === group.id),
    }))
    .filter((group) => group.links.length);

  return (
    <aside className={`app-sidebar${mobileOpen ? ' app-sidebar--open' : ''}`}>
      <NavLink className="brand-lockup" to="/inicio" onClick={onNavigate}>
        <span className="brand-mark">G</span>
        <span><strong>GLV</strong><small>lava-jato</small></span>
      </NavLink>

      <div className="sidebar-section-label">MENU PRINCIPAL</div>
      <NavLink className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`} to="/inicio" onClick={onNavigate}>
        <Dashboard fontSize="small" />
        <span>Visão geral</span>
      </NavLink>

      <nav className="sidebar-nav" aria-label="Navegação principal">
        {groups.map((group) => {
          const Icon = icons[group.iconName] || Inventory2;
          const canExpand = group.links.length > 1;
          const expanded = openGroup === group.id;
          if (!canExpand) {
            return (
              <NavLink
                key={group.id}
                className={({ isActive }) => `sidebar-link${isActive ? ' is-active' : ''}`}
                to={group.links[0].href}
                onClick={onNavigate}
              >
                <Icon fontSize="small" /><span>{group.label}</span>
              </NavLink>
            );
          }
          return (
            <div className="sidebar-group" key={group.id}>
              <button
                className={`sidebar-link sidebar-group-toggle${expanded ? ' is-expanded' : ''}`}
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpenGroup(expanded ? '' : group.id)}
              >
                <Icon fontSize="small" /><span>{group.label}</span><span className="sidebar-chevron">⌄</span>
              </button>
              {expanded && (
                <div className="sidebar-submenu">
                  {group.links.map((link) => (
                    <NavLink
                      key={link.href}
                      className={({ isActive }) => `sidebar-sublink${isActive ? ' is-active' : ''}`}
                      to={link.href}
                      onClick={onNavigate}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="profile-chip">
          <span className="avatar">{session.user.nome.slice(0, 1).toUpperCase()}</span>
          <span className="profile-copy"><strong>{session.user.nome}</strong><small>{roleLabels[session.role]}</small></span>
        </div>
        <button className="sidebar-link sign-out-button" type="button" onClick={onSignOut}>
          <Logout fontSize="small" /><span>Sair</span>
        </button>
      </div>
    </aside>
  );
}

export default SideBaR;
