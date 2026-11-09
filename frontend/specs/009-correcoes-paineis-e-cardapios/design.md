# Design — Correções visuais e de navegação dos painéis

## Componentes afetados

- `ResumoMetricas`: exibir o indicador de fichas no mesmo formato do Caixa.
- `FichasHoje`: retirar o texto de fichas restantes, mantendo a barra e os demais dados.
- `painelCaixa`: retirar o rótulo de fichas restantes, mantendo a capacidade e o progresso.
- `PainelNutricionistaCardapio` e `ListaCardapios`: renderizar pendências sem adicionar um botão extra de criação.
- `NavbarPainel`: incluir “Início” na variante Caixa.

## Indicador de fichas

O indicador reutiliza `percentualFichas` e `LinearProgress` do MUI. O valor deve ser limitado e calculado pelo serviço compartilhado, sem duplicar regra de negócio nos componentes. A linha principal mostra `entregues / capacidade`; abaixo dela fica o percentual e a barra. Não há texto separado de capacidade diária nem total restante.

## Cardápios

`ListaCardapios` mantém somente o seletor de semana no cabeçalho. A lista mantém os cinco dias retornados pelo serviço; itens sem refeição usam “Pendente”. Não deve ser renderizado um botão adicional de adição.

O componente não deve criar uma semana nova automaticamente nem alterar o contrato da API. A ação de adicionar apenas direciona a pessoa para o formulário existente.

## Menu Caixa

A variante Caixa filtra o menu compartilhado para “Início” e “Sair”. O item “Início” usa `/painel-caixa`; o logout mantém o comportamento atual.

## Responsividade e acessibilidade

- A barra de progresso deve manter `aria-label` descritivo.
