import React from 'react';
import 'bootswatch/dist/flatly/bootstrap.css';
import DropDown from './dropdown';
import rotasMenu from '../config/rotasMenu.json';

const dropDownTitulos = rotasMenu.dropDownTitulos;

const linksCadastros = rotasMenu.linksCadastros;


function Navbar(props) {
  return (
    <div className='navbar navbar-expand-lg fixed-top navbar-dark bg-primary '>
      <div className='container-fluid'>
        <a href='/' className='navbar-brand'>
          Sistema GLV
        </a>
        <button
          className='navbar-toggler'
          type='button'
          data-toggle='collapse'
          data-target='#navbarResponsive'
          aria-controls='navbarResponsive'
          aria-expanded='false'
          aria-label='Toggle navigation'
        >
          <span className='navbar-toggler-icon'></span>
        </button>
        <div className='collapse navbar-collapse' id='navbarResponsive'>
          <ul className='navbar-nav ml-auto'>
            {dropDownTitulos.map((titulo) => {
              const links = linksCadastros.filter(
                (link) => link.idDropDown === titulo.id
              );

              return links.length > 0 ? (
                <DropDown
                  key={titulo.id}
                  id={titulo.id}
                  label={titulo.label}
                  links={links}
                  render
                />
              ) : null;
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
