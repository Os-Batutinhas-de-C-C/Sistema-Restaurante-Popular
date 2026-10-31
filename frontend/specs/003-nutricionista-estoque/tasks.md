# Tasks — Gerenciamento de Estoque de Alimentos

## Implementação

- [x] **T01 — Preparação do Mock e Estado**
  - Criar a rota `src/app/estoque/page.js`, mantendo a estrutura atual do App Router.
  - Criar a composição principal em `src/components/painelNutricionistaEstoque/` e manter o `page.js` enxuto.
  - Criar ou importar um array de mock data de insumos (`estoqueMockData`) com propriedades como `nome`, `lote`, `quantidade`, `unidade`, `dataEntrega`, `dataValidade`, `observacao`, `status`.
  - Configurar estado para gerenciar a lista de exibição (conectado ao filtro de busca).
  - **Relacionada a:** HU010

- [x] **T02 — Barra de Pesquisa e Adição**
  - Renderizar o `<Card>` superior contendo o campo de pesquisa (Search input) e o botão "+ ADICIONAR INSUMO".
  - Configurar CSS Flex/Grid ou MUI `<Stack>` para empilhar em mobile e alinhar lado a lado em desktop.
  - **Relacionada a:** RN03, RNF001

- [x] **T03 — Lista de Estoque (Responsiva)**
  - Implementar a renderização da lista. Criar dois fluxos de renderização (ou estilos dinâmicos) para Desktop (linha horizontal com rótulos de cabeçalho) e Mobile (Card empilhado).
  - Usar os componentes `<Chip>` do MUI para estilizar dinamicamente o status ("No prazo" = Verde, "Vence em breve" = Laranja).
  - Adicionar os botões de ação na lista (Editar e Excluir), usando ícones e componentes MUI.
  - Implementar exclusão do item no estado local após confirmação da ação.
  - **Relacionada a:** RN01, RN02, RNF001

- [x] **T04 — Implementação do Modal (Dialog) de Insumo**
  - Criar componente separado (ex: `DialogInsumo.jsx`) englobando o MUI `<Dialog>`.
  - Adicionar os campos solicitados no design (Nome, Quantidade, Unidade, Lote, Datas, Observação).
  - Configurar o select do campo "Status".
  - **Relacionada a:** RN05, RN06

- [x] **T05 — Integração Dialog <-> Página (Ações)**
  - Fazer o controle de abertura e fechamento do Dialog (`open`, `onClose`).
  - Ao clicar em "+ ADICIONAR INSUMO", abrir o modal com state vazio.
  - Ao clicar no lápis (Editar) na lista, abrir o modal setando o insumo respectivo no estado de edição.
  - O botão "CONFIRMAR" no Dialog deve enviar os dados para a função mãe e atualizar a lista do estado local (simulando salvamento).
  - **Relacionada a:** RN04, RN07

- [x] **T05.1 — Exclusão de Insumo**
  - Ao acionar Excluir, solicitar confirmação antes de remover o item da lista em memória.
  - Após confirmar, remover o insumo correspondente do estado e atualizar a listagem.
  - **Relacionada a:** RN04.1

## Verificação

- [x] **T06 — Verificar cenário: Abertura Modal de Edição**
  - Clicar no botão de edição de um insumo específico e confirmar se os TextFields aparecem preenchidos (ex: O campo Status deve abrir marcando a opção preexistente).
  - **Critério relacionado:** Cenário 2
TESTADO PELO DESENVOLVEDOR

- [x] **T07 — Verificar cenário: Responsividade Extrema**
  - Redimensionar a tela para a largura de um smartphone (360px). Confirmar que o Cabeçalho de categorias de tabela da versão desktop desaparece e o card do insumo assume layout em bloco para não causar scroll horizontal.
  - **Critério relacionado:** RNF001
TESTADO PELO DESENVOLVEDOR

- [x] **T08 — Verificar cenário: Exclusão de Insumo**
  - Confirmar a ação de exclusão e verificar que somente o item selecionado desaparece da listagem.
  - **Critério relacionado:** Cenário 3
TESTADO PELO DESENVOLVEDOR

## Pronto quando

- [ ] A página é renderizada corretamente nas versões mobile e desktop sem layout quebrado.
- [ ] O filtro de busca (mesmo de forma básica no mock) afeta a lista em tela.
- [ ] O formulário Dialog de insumo funciona perfeitamente para abrir limpo ou preenchido.
