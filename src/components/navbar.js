import React from 'react';
import 'bootswatch/dist/flatly/bootstrap.css';

import NavbarItem from './navbarItem';


function Navbar(props) {
  return (
    <div className='navbar navbar-expand-lg fixed-top navbar-dark bg-primary'>
      <div className='container'>
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
          <ul className='navbar-nav'>
            <NavbarItem
              render='true'
              href='/listagem-marca'
              label='Marcas'
            />
            <NavbarItem
              render='true'
              href='/listagem-modelo'
              label='Modelos'
            />
            <NavbarItem
              render='true'
              href='/listagem-cor'
              label='Cores'
            />
            <NavbarItem
              render='true'
              href='/listagem-categoria-veiculo'
              label='Categorias de Veículos'
            />
            <NavbarItem
              render='true'
              href='/listagem-usuario'
              label='Usuários'
            />
            <NavbarItem
              render='true'
              href='/listagem-cliente'
              label='Clientes'
            />
            <NavbarItem
              render='true'
              href='/listagem-veiculo'
              label='Veiculos'
            />
            <NavbarItem
              render='true'
              href='/listagem-intervalo-almoço'
              label='Intervalo de Almoço'
            />
            <NavbarItem
              render='true'
              href='/listagem-horario-funcionamento'
              label='Horario de Funcionamento'
            />
            <NavbarItem
              render='true'
              href='/listagem-tipo-feriado'
              label='Tipo de Feriados'
            />
            <NavbarItem
              render='true'
              href='/listagem-feriado'
              label='Feriados'
            />
            <NavbarItem
              render='true'
              href='/listagem-lavajato'
              label='Parametros Lavajato'
            />
            {
              //
            }
            <NavbarItem
              render='true'
              href='/listagem-tempo'
              label='Tempo de Serviço'
            />
            <NavbarItem
              render='true'
              href='/listagem-servico'
              label='Serviços'
            />
            <NavbarItem
              render='true'
              href='/listagem-pagamento'
              label='Pagamentos'
            />
            <NavbarItem
              render='true'
              href='/listagem-notificacao'
              label='Notificações'
            />
            <NavbarItem
              render='true'
              href='/listagem-funcionario'
              label='Funcionários'
            />
            <NavbarItem
              render='true'
              href='/listagem-bloqueio'
              label='Bloqueios'
            />
            <NavbarItem
              render='true'
              href='/listagem-agendamento'
              label='Agendamentos'
            />
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
