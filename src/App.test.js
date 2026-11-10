import { fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

test('allows a customer to enter through the quick demo access', async () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /entre na sua conta/i })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /agende e acompanhe suas lavagens/i }));

  expect(await screen.findByRole('heading', { name: /seus próximos atendimentos/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /veículos/i })).toBeInTheDocument();
});

test('opens the local registration and password recovery dialogs', async () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: 'Criar conta', exact: true }));
  expect(await screen.findByRole('dialog', { name: 'Criar conta de cliente' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
  fireEvent.click(screen.getByRole('button', { name: 'Esqueci minha senha' }));
  expect(await screen.findByRole('dialog', { name: 'Recuperar senha' })).toBeInTheDocument();
});

test('requires confirmation before completing a check-out', async () => {
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /acesse a fila e registre atendimentos/i }));
  fireEvent.click(await screen.findByRole('link', { name: 'Check-in e check-out' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Check-in', exact: true }));
  fireEvent.click(await screen.findByRole('button', { name: 'Confirmar check-in' }));

  fireEvent.click(screen.getByRole('tab', { name: /check-out/i }));
  fireEvent.click(await screen.findByRole('button', { name: 'Concluir e check-out' }));
  expect(await screen.findByRole('dialog', { name: 'Confirmar check-out' })).toBeInTheDocument();
  expect(within(screen.getByRole('dialog')).getByText('Bruno Silva')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
  expect(screen.queryByRole('dialog', { name: 'Confirmar check-out' })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Concluir e check-out' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Confirmar entrega' }));
  expect(await screen.findByText(/nenhum veículo em atendimento/i)).toBeInTheDocument();
});
