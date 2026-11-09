# Design — Testes unitários e sistêmicos do frontend

## Organização

- `frontend/jest.config.mjs`: ambiente, descoberta de testes, transformação Babel e mapeamento de CSS/alias.
- `frontend/babel.config.cjs`: transformação de JavaScript/JSX para o Jest.
- `frontend/test/setup.js`: extensões de asserção do Testing Library.
- `frontend/test/services/`: regras puras e conversões de serviços.
- `frontend/test/components/`: comportamento renderizado dos componentes corrigidos.

## Estratégia de teste

Os serviços são testados com entradas determinísticas e sem rede. Os componentes são renderizados com `@testing-library/react`, verificando o texto visível, papéis acessíveis e atributos relevantes, evitando acoplamento a detalhes internos de implementação.

## Relatório

`npm test` fornece a execução rápida. `npm run test:coverage` gera o relatório em `frontend/coverage/`, que não deve ser versionado. O resultado deve ser transcrito no change log com data e quantidade de suites/casos.

## Etapa Selenium

A etapa 2 deverá usar um navegador real ou headless, backend/frontend de teste isolados e dados controlados. Os scripts devem cobrir fluxos completos, como login, navegação por papel, fichas, cardápio pendente e edição. A seleção final dos 50% será registrada antes da implementação dos scripts.
