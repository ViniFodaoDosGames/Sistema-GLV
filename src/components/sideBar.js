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
                <button
                        className='sidebar-link'
                        type='button' //* define o tipo do botão
                        id={`sideBar`} //* define o id do botão
                        data-bs-toggle='collapse' //* define o comportamento do botão. Colapse que dizer que ele vai abrir e fechar alguem
                        data-bs-target='#sideBar'
                    >
                <span class="material-symbols-outlined ">
                    double_arrow
                </span></button>
            </div>
            <ul className='sidebar-nav' id=''>
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
