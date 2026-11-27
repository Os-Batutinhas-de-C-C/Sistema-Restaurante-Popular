# Proposal

## Why

A prévia semanal atual só pode ser salva ou descartada. A Nutricionista precisa poder pedir outra combinação e ajustar cada refeição, mantendo controle sobre o conteúdo antes de gravá-lo.

## What Changes

- Adicionar à prévia uma ação para gerar outra semana completa, substituindo somente a prévia atual.
- Permitir editar os campos de cada refeição da prévia antes de salvar.
- Manter alterações e nova geração somente na prévia até confirmar o salvamento; descartar continua sem alterar a semana persistida.

## Capabilities

### New Capabilities

Nenhuma.

### New Capabilities

- `geracao-semanal-cardapio`: revisar uma prévia semanal, gerar outra versão e editar refeições antes da confirmação.

## Impact

- Tela de listagem semanal e estado da prévia no frontend da Nutricionista.
- Formulários de edição de refeição e testes existentes; sem mudanças na API ou no backend.
