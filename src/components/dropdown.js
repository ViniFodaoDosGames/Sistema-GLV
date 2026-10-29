//!REFERENCIAS DE ESTUDO: https://pt.stackoverflow.com/questions/227604/para-que-servem-os-atributos-data-target-e-data-toggle
//!REFERENCIAS DE ESTUDO: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes
//!REFERENCIAS DE ESTUDO: https://www.youtube.com/watch?v=R7b3OlEyqug&t=1077s


import React, { useState } from 'react';
import NavbarItem from './navbarItem';

function DropDown({ render, id, label, links, icon, iconName, setDropdownOpen, isSidebar }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuId = `navbar-dropdown-${id}`;

    if (!render) {
        return null;
    }

    const renderLinks = links
        .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
        .map((link) =>
            <NavbarItem
                key={link.href}
                render='true'
                href={link.href}
                label={link.label}
                onClick={() => setIsOpen(false)}
            />
        )

    return (
        <li className='sidebar-item'>{/* items que vai aparecer primeiro*/}
            <div className='sidebar-item-header'> {/* cabecalho da opção */}
                {setDropdownOpen /*valida se é um dropdown */ && isSidebar  /*valida se é sidebar */ ? (
                    <button
                        className='sidebar-link'
                        type='button' //* define o tipo do botão
                        id={`${menuId}-toggle`} //* define o id do botão
                        data-bs-toggle='collapse' //* define o comportamento do botão. Colapse que dizer que ele vai abrir e fechar alguem
                        data-bs-target={`#${menuId}`} //* define o alvo do botão (quem ele comanda) que é o menu dropdown que vai sofrer a ação de abrir e fechar
                        aria-expanded={isOpen} //* define se o menu dropdown está aberto ou fechado (leitor de tela)
                        aria-controls={menuId} //* define o id do menu dropdown que ele controla (leitor de tela)
                        onClick={() => setIsOpen(!isOpen)} //* mudsa o estado do menu dropdown de aberto para fechado e vice-versa através do useState
                    >
                        <span className={icon || 'material-symbols-outlined'}>
                            {iconName}
                        </span>
                        <span>{label}</span>
                        <span class="material-symbols-outlined arrow-icon">
                            stat_minus_1
                        </span>
                    </button> /*cria o botão do dropdown se for verdadeiro*/
                ) : (
                    <a //! os comentarios anteriores são vailidos aqui também, mas esse é um link e não um botão
                        className='sidebar-link'
                        id={`${menuId}-toggle`}
                        aria-expanded={isOpen}
                        aria-controls={menuId}
                        data-bs-toggle='collapse'
                        href={links[0]?.href}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <span className={icon || 'material-symbols-outlined'}>
                            {iconName}
                        </span>
                        <span>{label}</span>
                    </a> /* cria um link se for falso*/
                )}

            </div>
            {
                setDropdownOpen /**valida se é um dropdown */ && (isSidebar /**valida se é um sidebar*/ ? (
                    <div
                        className={`sidebar-dropdown-collapse${isOpen ? ' is-open' : ''}`} //! define a classe do menu dropdown, se ele estiver aberto adiciona a classe is-open
                        id={menuId}
                        aria-labelledby={`${menuId}-toggle`} //* define o id do botão que controla o menu dropdown - papai do negócio (leitor de tela)
                        aria-hidden={!isOpen} //* define se o menu dropdown está visível ou não (leitor de tela)
                        inert={!isOpen} //* define se o menu dropdown está interativo ou não (leitor de tela) - !mt bacana esses negócios, mas vou dar uma olhada melhor depois
                    >
                        <ul className='list-unstyled sidebar-dropdown'>
                            {renderLinks}
                        </ul>
                    </div>
                ) : (
                    <ul
                        className={`collapse list-unstyled sidebar-dropdown${isOpen ? ' show' : ''}`}
                        id={menuId}
                        aria-labelledby={`${menuId}-toggle`} //* define o id do botão que controla o menu dropdown - papai do negócio (leitor de tela)
                        inert={!isOpen}
                    >
                        {renderLinks}
                    </ul>
                ))

            }
        </li>
    );
}

export default DropDown;
