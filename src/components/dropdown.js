import React, { useState } from 'react';
import NavbarItem from './navbarItem';

function DropDown({ render, id, label, links }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuId = `navbar-dropdown-${id}`;

    if (!render) {
        return null;
    }

    return (
        <li className='nav-item dropdown'>
            <button
                className='nav-link dropdown-toggle'
                type='button'
                id={`${menuId}-toggle`}
                aria-expanded={isOpen}
                aria-controls={menuId}
                onClick={() => setIsOpen(!isOpen)}
            >
                {label}
            </button>
            <ul
                className={`dropdown-menu${isOpen ? ' show' : ''}`}
                id={menuId}
                aria-labelledby={`${menuId}-toggle`}
            >
                {
                    links.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR')).map((link) =>
                        <NavbarItem
                            key={link.href}
                            render='true'
                            href={link.href}
                            label={link.label}
                            onClick={() => setIsOpen(false)}
                        />
                    )}
            </ul>
        </li>
    );
}

export default DropDown;
