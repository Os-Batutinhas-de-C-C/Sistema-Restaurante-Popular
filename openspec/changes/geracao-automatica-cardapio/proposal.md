# Proposal

## Why

O botão “Gerar Cardápio” já aparece no formulário diário da Nutricionista, mas ainda não produz sugestões. Preencher esse fluxo reduz o trabalho repetitivo de planejamento e permite reaproveitar composições já registradas, mantendo a revisão profissional antes da publicação.

## What Changes

- Implementar a geração de uma sugestão de refeição para o dia selecionado a partir de composições de cardápios já registrados, reutilizando a consulta de semanas existente.
- Preencher os campos do formulário com a sugestão, permitindo editar, gerar outra opção e salvar manualmente.
- Informar quando não houver composição disponível para sugerir e preservar os dados atuais do formulário nesse caso.
- Manter a função no gerenciamento existente da Nutricionista e sujeita às permissões atuais de cardápio.

## Capabilities

### New Capabilities

- `geracao-automatica-cardapio`: sugerir uma composição diária com base no histórico de cardápios e permitir sua revisão antes do salvamento.

### Modified Capabilities

Nenhuma.

## Impact

- Frontend: botão “Gerar Cardápio” e formulário diário no gerenciamento de cardápios da Nutricionista.
- Frontend service: seleção de uma composição elegível do histórico retornado pela API existente, sem criar novo endpoint.
- Persistência e autorização: reutilizar os dados e as permissões atuais de semanas/refeições; nenhuma alteração para o papel Gestor.
