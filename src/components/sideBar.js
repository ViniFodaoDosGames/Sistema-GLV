import React from 'react';
import DropDown from './dropdown';
import rotasMenu from '../config/rotasMenu.json';
import { clearSession } from '../auth';


function SideBaR({ isOpen, onNavigate, role }) {

    const dropDownTitulos = rotasMenu.dropDownTitulos;
    const linksCadastros = rotasMenu.linksCadastros;

    function sair() {
        clearSession();
        if (onNavigate) onNavigate();
    }

    return (
        <nav
            id='sidebar-navigation'
            className={`sidebar${isOpen ? ' is-open' : ''}`}
            aria-label='Navegação principal'
        >
            <div className='sidebar-header'>
                <a href='/' className='logo'>
                    <span className='navbar-brand-text'>Sistema GLV</span>
                </a>
            </div>
            <ul className='sidebar-nav' id=''>
                {dropDownTitulos
                    .filter((titulo) => titulo.role?.includes(role))
                    .map((titulo) => {
                    const links = linksCadastros.filter(
                        (link) =>
                            link.idDropDown === titulo.id &&
                            link.role?.includes(role)
                    );

                    return links.length > 1 ? (
                        <DropDown
                            key={titulo.id}
                            id={titulo.id}
                            label={titulo.label}
                            links={links}
                            icon={titulo.icon}
                            iconName={titulo.iconName}
                            setDropdownOpen={true}
                            onNavigate={onNavigate}
                            isSidebar
                            render
                        />
                    ) : (<DropDown
                        key={titulo.id}
                        id={titulo.id}
                        label={titulo.label}
                        links={links}
                        icon={titulo.icon}
                        iconName={titulo.iconName}
                        setDropdownOpen={false}
                        onNavigate={onNavigate}
                        isSidebar
                        render
                    />);
                })}
            </ul>
            {role && (
                <div className='sidebar-footer'>
                    <button
                        type='button'
                        className='sidebar-link'
                        onClick={sair}
                    >
                        <span className='material-symbols-outlined'>logout</span>
                        <span>Sair</span>
                    </button>
                </div>
            )}
        </nav>
    );
}

export default SideBaR;
