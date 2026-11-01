import React from 'react';
import 'bootswatch/dist/flatly/bootstrap.css';
import DropDown from './dropdown';
import rotasMenu from '../config/rotasMenu.json';

const dropDownTitulos = rotasMenu.dropDownTitulos;

const linksCadastros = rotasMenu.linksCadastros;


function Navbar(props) {
  return (
    <div className='navbar navbar-expand-lg navbar-dark bg-primary '>
      <div className='container-fluid'>
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

              return links.length > 1 ? (
                <DropDown
                  key={titulo.id}
                  id={titulo.id}
                  label={titulo.label}
                  links={links}
                  setDropdownOpen={true}
                  render
                />
              ) : (<DropDown
                  key={titulo.id}
                  id={titulo.id}
                  label={titulo.label}
                  links={links}
                  setDropdownOpen={false}
                  render
                />);
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
