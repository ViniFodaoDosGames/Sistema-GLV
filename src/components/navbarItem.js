import React from 'react';

function NavbarItem({ render, ...props }) {
  if (!render) {
    return null;
  }

  return (
    <li>
      <a onClick={props.onClick} className='dropdown-item' href={props.href}>
        {props.label}
      </a>
    </li>
  );
}

export default NavbarItem;
