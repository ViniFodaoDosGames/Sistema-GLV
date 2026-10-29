import React from 'react';
import 'bootswatch/dist/flatly/bootstrap.css';
import DropDown from './dropdown';

const dropDownTitulos = [
  { label: 'Agendamentos', id: '1' },
  { label: 'Veículos', id: '2' },
  { label: 'Pagamentos e Pontos', id: '3' },
  { label: 'Configurações', id: '4' },
  { label: 'CheckIn/CheckOut', id: '5' },
  { label: 'Cadastros', id: '6' },
  { label: 'log', id: '7' },
  { label: 'Relatórios', id: '8' },
];

const linksCadastros = [
  { href: '/listagem-agendamento', label: 'Agendamentos', idDropDown: '1' },
  { href: '/listagem-veiculo', label: 'Veículos', idDropDown: '2' },
  { href: '/listagem-pagamento', label: 'Pagamentos e Pontos', idDropDown: '3' },
  { href: '/listagem-lavajato', label: 'Lava-jatos', idDropDown: '6' },
  { href: '/listagem-administrador', label: 'Administradores', idDropDown: '6' },
  { href: '/listagem-marcas', label: 'Marcas', idDropDown: '6' },
  { href: '/listagem-modelo', label: 'Modelos', idDropDown: '6' },
  { href: '/listagem-lote-ponto', label: 'Lote de pontos', idDropDown: '6' },
  { href: '/listagem-cor', label: 'Cores', idDropDown: '6' },
  { href: '/listagem-categoria-veiculo', label: 'Categorias de veículos', idDropDown: '6' },
  { href: '/listagem-usuario', label: 'Usuários', idDropDown: '6' },
  { href: '/listagem-cliente', label: 'Clientes', idDropDown: '6' },
  { href: '/listagem-intervalo-almoço', label: 'Intervalo de almoço', idDropDown: '6' },
  { href: '/listagem-horario-funcionamento', label: 'Horário de funcionamento', idDropDown: '6' },
  { href: '/listagem-tipo-feriado', label: 'Tipos de feriado', idDropDown: '6' },
  { href: '/listagem-feriado', label: 'Feriados', idDropDown: '6' },
  { href: '/listagem-tempo', label: 'Tempo de serviço', idDropDown: '6' },
  { href: '/listagem-servico', label: 'Serviços', idDropDown: '6' },
  { href: '/listagem-notificacao', label: 'Notificações', idDropDown: '6' },
  { href: '/listagem-funcionario', label: 'Funcionários', idDropDown: '6' },
  { href: '/listagem-bloqueio', label: 'Bloqueios', idDropDown: '6' },
];



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
