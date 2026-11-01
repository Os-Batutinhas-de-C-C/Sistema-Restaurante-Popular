# Tasks — Painel Administrativo: Notícias e Avisos

## Implementação

- [ ] **T01 — Estrutura Base e Mock de Dados**
- Criar `src/app/(admin)/noticias/page.jsx` (ou caminho equivalente definido no projeto).
- Criar `src/services/noticiasService.js` com a lista inicial (id, data, hora, título, texto, duração em horas) e funções de listar por período, publicar e remover.
- **Relacionada a:** HU018, RF009

- [ ] **T02 — Layout e Responsividade da Página**
- Implementar o container centralizado (máx. ~616px) com os cards de filtros e lista.
- Garantir coluna única, sem rolagem horizontal, a partir de 360px.
- **Relacionada a:** RNF001, HU001

- [ ] **T03 — Filtro de Período**
- Criar o componente "Selecione o Período" com intervalo padrão (semana atual).
- Recarregar a lista ao alterar o período.
- **Relacionada a:** HU018

- [ ] **T04 — Lista de Notícias**
- Renderizar a tabela (desktop) com Data/Hora, Título, Descrição truncada, Duração e Ações, do mais recente para o mais antigo.
- Renderizar cards no mobile no lugar da tabela.
- Implementar estados de carregando (Skeleton), vazio e erro.
- **Relacionada a:** HU018

- [ ] **T05 — Modal de Publicação**
- Criar `ModalPublicarNoticia` (MUI Dialog) com "Título do Aviso", "Texto do Aviso" e "Duração (horas)" numérica, com validação de obrigatórios, limites de caracteres e duração como inteiro positivo no intervalo definido.
- Ao publicar, chamar o mock, atualizar a lista e exibir Snackbar.
- **Relacionada a:** HU018, RF009

- [ ] **T06 — Modal de Visualização**
- Criar `ModalVisualizarNoticia` (MUI Dialog) com cabeçalho "Visualizar Notícia" e data/hora separadas por divisor vertical, seguido de título, texto completo, duração e botão "Fechar". Os dados vêm do mock.
- Conectar ao clique do ícone de olho.
- **Relacionada a:** RN05

- [ ] **T07 — Modal de Confirmação de Remoção**
- Criar `ModalRemoverNoticia` (MUI Dialog) com "Cancelar" e "Remover".
- Ao confirmar, remover do mock, atualizar a lista e exibir Snackbar.
- Substituir os `onClick` placeholders (`setSelectedNotice`) do protótipo pelos handlers reais.
- **Relacionada a:** RN04, RF009

- [ ] **T08 — Proteção de Rota**
- Restringir a página a usuários autenticados com perfil Nutricionista ou Gestor, redirecionando os demais para o login.
- **Relacionada a:** RN01, HU006

- [ ] **T09 — Acessibilidade**
- Adicionar `aria-label` descritivo nos ícones de ação, `aria-labelledby` nos modais e foco inicial automático.
- Garantir navegação por teclado (Tab, Enter, Esc) e touch target de 44x44px no mobile.
- **Relacionada a:** RNF001

## Verificação

- [ ] **T10 — Verificar cenário: Responsividade e Layout**
- Confirmar que em 360px a interface flui para coluna única sem rolagem horizontal e que a tabela vira cards.
- **Critério relacionado:** RNF001, HU001

- [ ] **T11 — Verificar cenário: Publicação e Validação**
- Confirmar que "Publicar" fica desabilitado com campos vazios ou duração inválida e que a nova notícia aparece no topo da lista.
- **Critério relacionado:** Cenários 2 e 3

- [ ] **T12 — Verificar cenário: Visualização, Remoção e Lista Vazia**
- Confirmar que o modal de visualização abre e fecha corretamente, que a remoção só ocorre após confirmação e que período sem notícias mostra a mensagem de vazio.
- **Critério relacionado:** Cenários 4, 5 e 6

- [ ] **T13 — Verificar cenário: Acesso restrito**
- Confirmar que usuário não logado é redirecionado para o login.
- **Critério relacionado:** Cenário 7

## Pronto quando

- [ ] A tela renderiza e manipula os dados do arquivo de mock.
- [ ] Publicar, visualizar e remover funcionam, com feedback via Snackbar.
- [ ] O fluxo funciona em desktop e mobile (responsividade).
- [ ] O componente Navbar do projeto envolve a tela corretamente.
- [ ] Os botões de ação e modais são plenamente acessíveis por teclado (Tab, Enter e Esc).