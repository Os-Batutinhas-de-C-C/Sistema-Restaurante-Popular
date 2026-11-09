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
- A etapa Selenium foi registrada como fase 2 e ainda não foi executada.
