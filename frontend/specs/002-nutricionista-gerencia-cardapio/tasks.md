# Tasks — Gerenciamento de Cardápio e Histórico

## Implementação

- [x] **T01 — Estrutura de Rotas e Estado Base**
  - Criar o arquivo `src/app/(admin)/gerenciar-cardapio/page.jsx` (ou caminho equivalente).
  - Configurar um estado local (`useState` ou um objeto de formulário) para armazenar os 9 campos obrigatórios do dia.
  - **Relacionada a:** HU003

- [x] **T02 — Cabeçalho e Navegação de Dias**
  - Implementar o componente superior contendo o título e o seletor horizontal dos 5 dias da semana.
  - O clique em um dia diferente deve limpar ou carregar os dados mockados daquele dia específico.
  - **Relacionada a:** RN01

- [x] **T03 — Formulário de Edição**
  - Construir o `Card` central e estruturar o layout em 2 colunas usando MUI `Grid`.
  - Adicionar os 9 `TextField` (variante "standard") com seus respectivos labels e fazer o bind (*two-way binding*) com o estado local.
  - **Relacionada a:** HU003, RN02

- [x] **T04 — Botão de Salvar e Feedback**
  - Adicionar o botão "Salvar Cardápio" verde de largura total na base do card.
  - Implementar a função de salvar que exibe um componente MUI `Snackbar` confirmando o salvamento.
  - **Relacionada a:** RN07

- [x] **T05 — Estrutura do Modal de Histórico**
  - Criar o componente `ModalHistorico` usando MUI `Dialog`.
  - Adicionar os três inputs de filtro ("Data inicial", "Data final", "Pesquisar") e o botão de ação.
  - Criar um mock com uma lista de 3 dias de cardápios antigos.
  - **Relacionada a:** HU016, RN05

- [x] **T06 — Seleção e Cópia do Histórico**
  - Renderizar a lista de resultados no modal usando `List`, `ListItem` e `Radio`.
  - Controlar o estado do item selecionado (estilizar o fundo/borda do item ativo).
  - Ao clicar em "Selecionar Cardápio", transferir os dados do objeto do mock para o estado do formulário principal e fechar o modal.
  - **Relacionada a:** HU016, RN06

## Verificação

- [ ] **T07 — Verificar cenário: Preenchimento e Cópia**
  - Clicar em "Copiar Do Histórico", selecionar um cardápio, confirmar, e verificar se os `TextFields` do formulário refletem exatamente o prato selecionado.
  - **Critério relacionado:** Cenário 2

- [ ] **T08 — Verificar cenário: Responsividade do Formulário e Modal**
  - Inspecionar a tela em 360px. Confirmar se o Grid quebra os inputs em 1 coluna e se o modal não gera scroll horizontal.
  - **Critério relacionado:** RNF001

## Pronto quando

- [ ] O formulário principal pode ser preenchido manualmente ou sobreposto pelos dados do histórico.
- [ ] O componente MUI Dialog funciona perfeitamente (abre, fecha, seleciona).
- [ ] A tela atende às diretrizes mobile-first e exibe mensagens de feedback ao salvar.
- [ ] Os botões de navegação dos dias permitem trocar o contexto do cardápio visualizado.
