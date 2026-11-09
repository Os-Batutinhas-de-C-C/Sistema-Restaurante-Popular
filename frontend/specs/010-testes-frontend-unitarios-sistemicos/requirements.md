# Requisitos — Testes unitários e sistêmicos do frontend

## Objetivo

Estabelecer uma estratégia de verificação do frontend com Jest para testes unitários e de componentes, registrar evidências das correções de fichas e cardápios e preparar a etapa posterior de testes sistêmicos automatizados com Selenium.

## Escopo da etapa 1 — Jest

### RF001 — Ferramenta e execução

O frontend deve usar Jest como ferramenta de testes unitários, com ambiente `jsdom` para componentes React e comandos npm reproduzíveis:

- `npm test`
- `npm run test:coverage`
- `npm run test:watch`

### RF002 — Serviços de fichas

Os testes devem verificar dias úteis, cálculo de percentual, limite de 100% e rejeição de contagens inconsistentes.

### RF003 — Serviços de cardápio

Os testes devem verificar a seleção da semana e a criação dos cinco dias pendentes quando não há registro para a semana selecionada, preservando registros existentes.

### RF004 — Componentes corrigidos

Os testes devem comprovar que:

- o resumo da Nutricionista exibe entregues/capacidade, percentual e barra;
- o resumo não exibe “Restam” nem o campo textual separado de capacidade;
- a lista de Cardápios exibe cinco pendências sem o botão adicional removido.

### RF005 — Relatório e evidência

A execução deve registrar suites, casos aprovados, falhas e cobertura gerada pelo Jest. Falhas encontradas devem ser corrigidas ou registradas antes de considerar a etapa concluída.

## Escopo da etapa 2 — Selenium

Após a aprovação dos testes Jest, devem ser criados testes sistêmicos automatizados com Selenium para fluxos representativos de pelo menos 50% dos requisitos funcionais do frontend. Essa etapa inclui scripts, pré-condições de execução, relatório e evidências visuais.

## Execução sistêmica

O script `frontend/test/system/sistema.e2e.cjs` usa Selenium WebDriver e cobre:

- acesso à página pública e às seções de fichas/cardápio;
- login da Nutricionista, indicador de fichas e pendências de cardápio;
- navegação autenticada para cardápios; o painel do Caixa foi validado manualmente no mesmo ambiente.

Pré-condições:

1. PostgreSQL disponível com o banco `restaurante_popular` e perfil `local`;
2. backend em `http://localhost:8080`;
3. frontend em `http://localhost:3000` com `BACKEND_API_BASE_URL=http://localhost:8080`;
4. Google Chrome e ChromeDriver disponíveis no `PATH`.

Executar com `npm run test:system`. O relatório e screenshots são gerados em
`frontend/test/system/artifacts/` e permanecem ignorados pelo Git.

## Restrições

- Manter os testes dentro de `frontend/test/`.
- Não usar chamadas reais ao PostgreSQL nos testes unitários.
- Isolar chamadas HTTP com mocks quando o componente exigir serviços externos.
- Preservar os contratos e o comportamento de produção.
- Não considerar a etapa Selenium concluída nesta etapa.
