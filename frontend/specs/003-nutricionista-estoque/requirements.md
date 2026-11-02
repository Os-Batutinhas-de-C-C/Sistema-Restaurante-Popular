# Requisitos — Gerenciamento de Estoque de Alimentos

## Objetivo

Permitir que a nutricionista visualize a lista de insumos disponíveis e gerencie o estoque através de cadastro e edição de lotes, datas de entrega e validade.

## Histórias de usuário

### HU010 — Gerenciamento de Estoque
Como um gestor / nutricionista,
quero poder visualizar e editar os alimentos em estoque,
para manter controle do estoque e comunicar à cozinha qualquer necessidade ou mudança.

## Regras de negócio

- **RN01:** A tela principal deve exibir uma lista de todos os insumos cadastrados, mostrando: Nome, Lote, Estoque Atual, Unidade, Data de Entrega, Data de Validade, Status e Observação.
- **RN02:** O campo "Status" (No prazo / Vence em breve / Vencido) deve ser sinalizado visualmente através de tags/chips com cores indicativas (Verde para "No prazo", Laranja para "Vence em breve", Vermelho para "Vencido").
- **RN03:** A tela deve conter um campo de busca textual ("Buscar insumo pelo nome...") e um botão de ação primária "+ ADICIONAR INSUMO".
- **RN04:** Clicar em "+ ADICIONAR INSUMO" deve abrir um Dialog de cadastro. Clicar no botão de edição (ícone de lápis) na lista de insumos deve abrir o Dialog de edição, já preenchido com os dados do item.
- **RN04.1:** Cada insumo deve oferecer uma ação para exclusão. Ao confirmar a exclusão, o item deve ser removido da lista exibida.
- **RN05:** O Dialog de Insumo (tanto para cadastro quanto para edição) deve possuir os seguintes campos: Nome do Insumo, Quantidade, Unidade, Lote, Data de Entrega, Data de Validade, Observações e Status.
- **RN06:** O campo "Status" no Dialog deve ser um *dropdown* (Select) com opções pré-definidas ("No prazo", "Vence em breve", "Vencido").
- **RN07:** O botão "Confirmar" no Dialog de Insumo salvará a adição ou alteração. O botão "Cancelar" (ou clique fora) fecha o modal descartando as alterações não salvas.

## Critérios de aceitação

### Cenário 1 — Adição de um novo Insumo
**Dado que** a nutricionista clica em "+ ADICIONAR INSUMO"
**Quando** preenche todos os dados no modal e clica em "CONFIRMAR"
**Então** o modal é fechado e o novo insumo aparece na lista de estoque.

### Cenário 2 — Edição de um Insumo existente
**Dado que** a nutricionista clica no botão "Editar" na linha do insumo "Tomate Cereja"
**Quando** o Dialog é aberto
**Então** os dados existentes (Quantidade, Validade, etc.) aparecem preenchidos e o botão "CONFIRMAR" atualiza a listagem correspondente.

### Cenário 3 — Exclusão de um Insumo
**Dado que** a nutricionista visualiza um insumo cadastrado
**Quando** aciona a opção de excluir e confirma a ação
**Então** o insumo é removido da lista de estoque.

## Restrições
- A persistência, por enquanto, será feita através de mocks locais no repositório do frontend (arquivo/estado em memória).
- A exclusão altera somente a lista mockada em memória; não há persistência em backend nesta etapa.
