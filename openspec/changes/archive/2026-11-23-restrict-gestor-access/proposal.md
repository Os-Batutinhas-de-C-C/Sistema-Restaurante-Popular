# Proposta — Acesso do Gestor

## Why

O Gestor usa a mesma composição e várias das mesmas permissões operacionais da Nutricionista. O acompanhamento do Gestor precisa se limitar às fichas entregues, ao desperdício do dia e à gestão da própria conta.

## What Changes

- Mostrar somente os indicadores de fichas entregues e desperdício do dia na área de conteúdo de `/painel-gestor`, com dados reais e atualização de leitura.
- Disponibilizar “Meu Perfil” no cabeçalho para consultar a própria conta e alterar e-mail e senha. O menu oferece “Início” e “Sair” no painel e no perfil.
- **BREAKING** — Revogar para o Gestor o acesso ao Painel Nutricionista, às ferramentas administrativas de cardápios, refeições, estoque, notícias e mensagens, ao registro de desperdício e à administração de contas. Aplicar a restrição às páginas e aos endpoints, inclusive para sessões já autenticadas.
- Fornecer uma consulta autenticada para o Gestor receber a data e o valor de desperdício do dia. O painel usa a contagem de fichas do mesmo endpoint público que alimenta os demais indicadores.

## Capabilities

### New Capabilities

### Modified Capabilities

- `painel-gestor` — Indicadores diários, navegação do Gestor e permissões para acessar telas e operações da API. A exigência de alterar as credenciais da própria conta faz parte da [especificação entregue em `add-painel-gestor`](../2026-11-23-add-painel-gestor/specs/painel-gestor/spec.md).

## Impact

- Frontend Next.js — composição do Painel Gestor, cartões de métricas, menu e guards das rotas operacionais.
- Backend Spring Boot — matriz de acesso, consulta diária de desperdício e testes de integração de autorização.
- Especificações vigentes de integração — matriz DTO e regras de navegação que concediam operações ao Gestor.
