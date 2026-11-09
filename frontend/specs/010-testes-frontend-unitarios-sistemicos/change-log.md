# Change log — Testes unitários e sistêmicos do frontend

## 09/11/2026 — Etapa 1: Jest

- Branch de trabalho renomeada para `testes-bugfix-frontend`.
- A branch `testes-unitarios-back` foi mesclada sem conflitos.
- Jest configurado com jsdom, Babel e Testing Library.
- Criada a pasta `frontend/test/`.
- Criados testes para `fichasService`, `cardapioService`, `ResumoMetricas` e `ListaCardapios`.
- Resultado inicial: 4 suites, 7 testes aprovados, 0 falhas.
- Cobertura Jest: 31,46% de statements, 23,07% de branches, 30,76% de funções e 33,65% de linhas.
- `npm run lint` e `npm run build` passaram após excluir o diretório gerado `coverage/` da análise do ESLint.

## 09/11/2026 — Etapa 2: Selenium

- Definidos fluxos sistêmicos cobrindo página pública, Nutricionista, cardápios e Caixa.
- Adicionado `selenium-webdriver` e o script `npm run test:system`.
- A execução manual equivalente no navegador integrado validou login, `77 / 300`, percentual, barra, pendências e ação do Caixa.
- O script valida a navegação pública, o login da Nutricionista e a tela autenticada de cardápios; as cinco pendências e o painel do Caixa foram confirmados na execução manual e permanecem cobertos pelos testes Jest.
- A execução literal do WebDriver ficou condicionada à instalação de Chrome/ChromeDriver, ausentes no ambiente atual.
- O relatório esperado pelo script é `frontend/test-reports/selenium/report.json`.

## 09/11/2026 — Ampliação de cobertura

- Jest passou a coletar cobertura de todos os serviços e utilitários, gerando HTML, JSON, LCOV e resumo textual em `frontend/test-reports/jest/`.
- Criado `npm run test:report`, que também gera `frontend/test-reports/jest/results.json`.
- Adicionados testes para transformação de cardápios, estoque, gerenciamento de cardápio, mensagens, notícias, perfil e formatadores.
- Resultado: 9 suites e 20 testes aprovados; 40,68% statements, 32,21% branches, 44,82% funções e 43,07% linhas.
- Selenium ampliado para 8 de 13 rotas funcionais (61,5%), incluindo gerenciamento, estoque, mensagens, notícias e perfil.
