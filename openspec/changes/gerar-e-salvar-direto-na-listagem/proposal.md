# Proposal

## Why

A prévia separada exige uma etapa e controles que a Nutricionista não deseja usar. O fluxo deve preencher a própria lista semanal e persistir a semana assim que a geração for confirmada pelo botão de gerar.

## What Changes

- Remover a seção separada de prévia e seus botões específicos.
- Gerar cinco combinações completas e distintas, salvar a semana imediatamente e atualizar os cardápios exibidos na lista atual.
- Preservar os cardápios existentes se não houver combinações suficientes ou se a gravação falhar.
- Manter a edição diária existente depois que a lista for atualizada.

## Capabilities

### New Capabilities

- `geracao-semanal-cardapio`: gerar e salvar diretamente os cinco cardápios da semana selecionada, refletindo o resultado na lista existente.

### Modified Capabilities

Nenhuma. O inventário de especificações principais ainda não contém uma capability de geração semanal; esta proposta introduz o comportamento como uma capability.

## Impact

- Tela de listagem semanal da Nutricionista e serviço frontend de geração/salvamento.
- Reutiliza a operação semanal existente; sem nova API ou alteração no backend.
