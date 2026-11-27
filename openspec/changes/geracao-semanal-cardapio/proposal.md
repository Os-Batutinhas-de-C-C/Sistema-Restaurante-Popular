# Proposal

## Why

A geração atual sugere uma refeição por vez dentro do formulário diário, enquanto o planejamento e a consulta dos cardápios acontecem por semana. Gerar uma semana de uma vez, com uma combinação diferente para cada dia útil e revisão antes de salvar, reduz trabalho repetitivo sem retirar o controle da Nutricionista.

## What Changes

- Remover o botão de geração do formulário de edição diária e disponibilizar a geração na tela que lista os cardápios da semana.
- Gerar uma prévia para os cinco dias úteis da semana selecionada, usando combinações completas do histórico e sem repetir a combinação em dias diferentes.
- Permitir revisar a prévia e salvá-la explicitamente; gerar não deve persistir nem substituir cardápios existentes.
- Se não houver combinações históricas suficientes para preencher os cinco dias com opções distintas, informar a Nutricionista e preservar a semana atual sem aplicar uma prévia parcial.

## Capabilities

### New Capabilities

- `geracao-semanal-cardapio`: gerar, revisar e salvar uma prévia de cardápios distintos para os dias úteis de uma semana.

### Modified Capabilities

Nenhuma.

## Impact

- Frontend: listagem semanal em `painel-nutricionista-cardapio` e formulário diário em `painel-nutricionista-cardapio/gerenciar`.
- Serviços existentes de consulta de histórico e gravação semanal; avaliar uma gravação única da semana para preservar a prévia como unidade.
- API e autorização existentes de cardápios da Nutricionista; sem mudança de permissão solicitada.
