# Tarefas — Correções visuais e de navegação dos painéis

## Preparação

- [x] **T01 — Confirmar decisões de comportamento:** registrar o padrão da barra, o alcance da remoção do restante, a navegação da adição, as semanas pendentes e o menu do Caixa.

## Implementação

- [x] **T02 — Corrigir indicador de fichas da Nutricionista:** exibir capacidade, percentual e barra linear no `ResumoMetricas`.
- [x] **T03 — Remover textos de fichas restantes:** retirar a apresentação de “Restam X fichas” de todas as telas e preservar os demais indicadores.
- [x] **T04 — Ajustar formato compartilhado de fichas:** exibir `entregues / capacidade`, percentual e barra na Nutricionista, sem texto separado de capacidade.
- [x] **T05 — Preservar pendências sem botão adicional:** garantir que os cinco dias sejam exibidos e que dias sem refeição apareçam como “Pendente”, sem botão de adicionar no cabeçalho.
- [x] **T06 — Adicionar Início ao menu Caixa:** apontar o item para `/painel-caixa`.

## Verificação

- [x] **T07 — Validar lint e build do frontend:** ambos passaram com `BACKEND_API_BASE_URL=http://localhost:8080`.
- [x] **T08 — Validar navegação, indicadores e estados pendentes nos componentes alterados:** revisão dos caminhos, busca sem ocorrências de “Restam” em `frontend/src` e verificação dos estados pendentes no serviço.
