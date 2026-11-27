# Spec Delta

## Purpose

Permitir revisar a semana de cardápios gerada antes de salvá-la, com opções para regenerar e ajustar individualmente cada refeição.

## ADDED Requirements

### Requirement: Revisar e confirmar a prévia semanal
O sistema SHALL manter a prévia separada dos cardápios salvos até a Nutricionista confirmar explicitamente sua gravação. A Nutricionista SHALL poder gerar uma nova prévia ou editar individualmente as refeições apresentadas antes de salvar.

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

#### Scenario: Gerar outra prévia
- **WHEN** a Nutricionista solicita gerar novamente enquanto revisa uma prévia
- **THEN** o sistema busca uma nova semana completa de combinações distintas e atualiza a prévia sem salvar nenhuma das duas versões
- **AND** se não houver combinações suficientes, mantém a prévia atual e informa que não foi possível gerar outra

#### Scenario: Editar refeição da prévia
- **WHEN** a Nutricionista edita uma refeição em um dos dias da prévia
- **THEN** o sistema atualiza os campos daquele dia somente na prévia
- **AND** mantém as edições ao salvar a semana
- **AND** descartar a prévia remove também essas edições sem alterar o histórico salvo
