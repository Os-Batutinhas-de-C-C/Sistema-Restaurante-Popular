# Tasks

## 1. Seleção semanal de combinações históricas

- [x] 1.1 Implementar seleção de cinco refeições históricas completas, sem duplicar a combinação normalizada dos oito itens; verificar que IDs e calorias diferentes não tornam uma mesma combinação única.
- [x] 1.2 Tratar histórico insuficiente sem produzir prévia parcial ou alterar a semana carregada; verificar o estado da interface para histórico com menos de cinco combinações elegíveis.

## 2. Prévia na listagem semanal

- [x] 2.1 Mover o controle “Gerar Cardápio” do formulário diário para a listagem da semana selecionada; verificar que a ação aparece na tela semanal e não aparece mais na edição diária.
- [x] 2.2 Exibir os cinco dias da prévia, estados de carregamento e mensagens de sucesso/erro, com ações claras para salvar ou descartar; verificar a revisão da prévia antes da gravação.
- [x] 2.3 Descartar a prévia ao mudar de semana ou sair da tela, preservando os cardápios salvos; verificar que a navegação não grava dados gerados.

## 3. Gravação e integração

- [x] 3.1 Gravar os cinco cardápios em uma única operação de criação ou atualização semanal somente após confirmação; verificar que a semana salva reflete a prévia e que uma falha mantém a prévia para nova tentativa.
- [x] 3.2 Confirmar visualmente o fluxo completo na tela da Nutricionista, inclusive substituição de uma semana já preenchida somente após confirmar salvar e uso da edição diária após a gravação.
