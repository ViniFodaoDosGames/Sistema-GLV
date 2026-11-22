import React from 'react';

function NavbarItem({ render, ...props }) {
  if (!render) {
    return null;
  }

  return (
    <li>
      <a
        onClick={() => {
          if (props.onClick) props.onClick();
          if (props.onNavigate) props.onNavigate();
        }}
        className='sidebar-link'
        href={props.href}
      >
        {props.label}
      </a>
    </li>
  );
}

export default NavbarItem;
