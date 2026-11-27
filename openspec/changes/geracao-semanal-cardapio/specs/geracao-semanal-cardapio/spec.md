# Spec Delta

## Purpose

Permitir que a Nutricionista gere e revise uma semana de cardápios com uma composição diferente para cada dia útil antes de salvar a semana.

## ADDED Requirements

### Requirement: Gerar uma prévia semanal com combinações distintas
O sistema SHALL gerar uma prévia com um cardápio histórico completo para cada dia útil da semana selecionada, sem repetir a combinação completa de itens.

#### Scenario: Semana tem cinco combinações históricas distintas
- **WHEN** a Nutricionista solicita a geração de cardápio para uma semana com pelo menos cinco combinações históricas completas e distintas
- **THEN** o sistema apresenta uma prévia preenchida de segunda a sexta com cinco combinações diferentes
- **AND** diferenças somente de caixa, espaços externos, identificador histórico ou valor calórico não contam como combinações distintas
- **AND** pratos individuais podem se repetir quando a combinação completa do dia for diferente

#### Scenario: Histórico não tem combinações suficientes
- **WHEN** a Nutricionista solicita a geração e há menos de cinco combinações históricas completas e distintas
- **THEN** o sistema informa que não há combinações suficientes para preencher a semana
- **AND** não apresenta uma prévia parcial nem altera os cardápios salvos

### Requirement: Revisar e confirmar a prévia semanal
O sistema SHALL manter a prévia separada dos cardápios salvos até a Nutricionista confirmar explicitamente sua gravação.

#### Scenario: Confirmar a semana gerada
- **WHEN** a Nutricionista revisa a prévia e confirma salvar a semana
- **THEN** o sistema grava os cinco cardápios para os dias úteis da semana selecionada
- **AND** substitui os cardápios salvos dessa semana somente após a confirmação

#### Scenario: Descartar ou sair da prévia
- **WHEN** a Nutricionista descarta a prévia ou navega para outro período sem confirmar
- **THEN** o sistema remove a prévia e mantém os cardápios já salvos sem alterações

#### Scenario: Falha ao salvar a prévia
- **WHEN** a gravação da semana confirmada falha
- **THEN** o sistema informa a falha, mantém a prévia disponível para nova tentativa e preserva os cardápios salvos exibidos

### Requirement: Disponibilizar a geração na tela semanal
O sistema SHALL disponibilizar a ação de gerar semana na listagem de cardápios da Nutricionista e removê-la do formulário de edição diária.

#### Scenario: Acessar geração pela listagem semanal
- **WHEN** a Nutricionista abre a listagem da semana selecionada
- **THEN** a tela oferece a ação para gerar uma prévia semanal
- **AND** o formulário de edição de um dia não oferece mais a ação de geração
