# Spec Delta

## Purpose

Permitir gerar uma semana completa de cardápios e gravá-la diretamente na semana selecionada, exibindo os resultados na lista semanal já existente.

## ADDED Requirements

### Requirement: Gerar e salvar a semana diretamente na listagem
O sistema SHALL gerar cinco combinações históricas completas e distintas, salvá-las para os dias úteis selecionados e atualizar a lista semanal exibida sem apresentar uma seção separada de prévia.

#### Scenario: Semana gerada e salva
- **WHEN** a Nutricionista aciona a geração para uma semana válida e há pelo menos cinco combinações elegíveis
- **THEN** o sistema salva as cinco refeições em uma única operação semanal
- **AND** atualiza a lista existente com os cardápios salvos
- **AND** não apresenta ações específicas de salvar ou descartar prévia

#### Scenario: Histórico insuficiente
- **WHEN** há menos de cinco combinações completas e distintas no histórico
- **THEN** o sistema informa que não há sugestões suficientes
- **AND** mantém os cardápios atualmente salvos e exibidos sem alterações

#### Scenario: Falha ao salvar a semana gerada
- **WHEN** a gravação da semana falha
- **THEN** o sistema informa a falha e mantém a lista com os cardápios anteriormente salvos

#### Scenario: Editar cardápio após a geração
- **WHEN** a semana gerada já foi exibida na lista
- **THEN** a Nutricionista pode usar a edição diária existente para alterar um cardápio
- **AND** a alteração é salva pelo fluxo normal de edição diária
