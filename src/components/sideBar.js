import React from 'react';
import DropDown from './dropdown';
import rotasMenu from '../config/rotasMenu.json';


function SideBaR() {

    const dropDownTitulos = rotasMenu.dropDownTitulos;
    const linksCadastros = rotasMenu.linksCadastros;

    return (
        <nav className='sidebar'>
            <div className='sidebar-header'>
                <a href='/' className='logo'>
                    <span className='navbar-brand-text'>Sistema GLV</span>
                </a>
            </div>
            <ul className='sidebar-nav'>
                {dropDownTitulos.map((titulo) => {
                    const links = linksCadastros.filter(
                        (link) => link.idDropDown === titulo.id
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
                        isSidebar
                        render
                    />);
                })}
            </ul>
        </nav>
    );
}

export default SideBaR;
