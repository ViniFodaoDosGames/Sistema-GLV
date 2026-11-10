# Sistema GLV — Lava-jato

Aplicação React responsiva para demonstração dos fluxos do cliente, funcionário e administrador, baseada no documento de requisitos e nas telas de referência.

## Executar

```bash
npm install
npm start
```

O front-end abre em `http://localhost:3000`. Os três perfis podem ser acessados pelos botões rápidos na tela de login.

## Dados da demonstração

- `src/db/db.json` é a fonte dos dados iniciais.
- As alterações feitas pela interface são mantidas no `localStorage` do navegador.
- Para restaurar os dados de exemplo, remova os dados locais do site ou limpe a chave `glv-mock-data`.
- Agendamentos, pagamentos, notificações e recuperação de senha são simulações locais. Não há API, envio de e-mail/WhatsApp ou cobrança real.
- Não use credenciais ou dados pessoais reais neste protótipo.

## Validar

```bash
npm test -- --watchAll=false
npm run build
```

## Áreas implementadas

- **Cliente:** agendamentos, seleção de horários, pagamento demonstrativo, veículos, pontos e configurações.
- **Funcionário:** fila de atendimento, check-in, check-out, walk-in e atualização dos registros locais.
- **Administrador:** cadastros, pagamentos e estornos demonstrativos, logs, notificações e relatórios.
- Os grupos e links laterais por perfil são definidos em `src/config/rotasMenu.json`.
