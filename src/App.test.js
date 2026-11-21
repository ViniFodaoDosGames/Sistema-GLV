import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./rotas', () => () => null);

test('opens the sidebar from the navbar and closes it with Escape', () => {
  sessionStorage.setItem('sistema-glv-session', JSON.stringify({
    usuario: { id: 'usuario-02', nome: 'Usuário Teste' },
    role: 'ADMINISTRADOR',
  }));

  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
  expect(screen.getByRole('navigation', { name: 'Navegação principal' })).toHaveClass('is-open');
  expect(screen.getByRole('button', { name: 'Fechar navegação' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Fechar navegação' }));
  expect(screen.getByRole('navigation', { name: 'Navegação principal' })).not.toHaveClass('is-open');

  fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.getByRole('navigation', { name: 'Navegação principal' })).not.toHaveClass('is-open');
  expect(screen.getByRole('button', { name: 'Abrir menu' })).toBeInTheDocument();
});

test('shows the vehicles page for a client', () => {
  sessionStorage.setItem('sistema-glv-session', JSON.stringify({
    usuario: { id: 'usuario-04', nome: 'Cliente Teste' },
    role: 'CLIENTE',
  }));

  render(<App />);

  expect(screen.getByRole('link', { name: 'Veículos' })).toHaveAttribute(
    'href',
    '/listagem-veiculo'
  );
  expect(screen.queryByText('Cadastros')).not.toBeInTheDocument();
});
