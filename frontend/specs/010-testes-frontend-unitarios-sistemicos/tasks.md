# Tarefas — Testes unitários e sistêmicos do frontend

## Etapa 1 — Jest

- [x] **T01 — Escolher e configurar Jest:** adicionar Jest, jsdom, Babel e Testing Library aos devDependencies.
- [x] **T02 — Criar estrutura de testes:** criar `frontend/test/`, configuração e setup compartilhado.
- [x] **T03 — Testar fichas:** cobrir dias úteis, percentual e validação de DTO.
- [x] **T04 — Testar cardápios:** cobrir cinco dias pendentes e preservação de itens existentes.
- [x] **T05 — Testar componentes corrigidos:** cobrir resumo de fichas e lista de cardápios.
- [x] **T06 — Registrar execução:** executar Jest, lint, build e cobertura.

## Etapa 2 — Selenium

- [x] **T07 — Definir os requisitos sistêmicos:** cobrir página pública, autenticação, painel Nutricionista, pendências de cardápio e painel Caixa.
- [x] **T08 — Preparar ambiente isolado:** documentar inicialização do frontend, backend, banco e navegador de teste.
- [x] **T09 — Criar scripts Selenium:** automatizar os fluxos aprovados em `frontend/test/system/sistema.e2e.cjs`.
- [x] **T10 — Executar e corrigir:** validar os fluxos no navegador integrado; a execução literal do WebDriver depende de Chrome/ChromeDriver instalados.

## Pronto quando

- [x] O Jest executa sem falhas.
- [x] Os testes das correções de fichas e cardápios estão automatizados.
- [x] Lint e build do frontend passam.
- [x] A etapa Selenium cobre os fluxos principais de autenticação, painéis e cardápio e possui relatório JSON.
