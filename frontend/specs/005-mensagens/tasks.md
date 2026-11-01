# Tasks — Painel Administrativo: Mensagens (Fale Conosco)

## Implementação

- [x] **T01 — Estrutura Base e Mock de Dados**
- Criar `src/app/painel-nutricionista-mensagens/page.js` (ou caminho equivalente definido no projeto) e o componente `PainelNutricionistaMensagens`.
- Criar `src/services/mensagensService.js` com a lista inicial (id, data, hora, título, texto, nome opcional) e a função de listar por período.
- **Relacionada a:** RF010, HU011

- [x] **T02 — Layout e Responsividade da Página**
- Implementar o container centralizado (máx. ~616px) com os cards de filtro e lista.
- Garantir coluna única, sem rolagem horizontal, a partir de 360px.
- **Relacionada a:** RNF001, HU001

- [x] **T03 — Filtro de Período**
- Criar o componente "Selecione o Período" com intervalo padrão (semana atual), reaproveitando o mesmo componente da tela de Notícias.
- Recarregar a lista ao alterar o período.
- **Relacionada a:** RF010

- [x] **T04 — Lista de Mensagens**
- Renderizar a tabela (desktop) com Data/Hora, Título, Descrição truncada e Ações, da mais recente para a mais antiga, usando o `id` da mensagem como `key`.
- Renderizar cards no mobile no lugar da tabela.
- Implementar estados de carregando (Skeleton), vazio e erro.
- **Relacionada a:** RF010, RN02, RN03

- [x] **T05 — Modal de Visualização**
- Criar `ModalVisualizarMensagem` (MUI Dialog) com cabeçalho "Visualizar Mensagem" e data/hora separadas por divisor vertical, título da mensagem, nome do remetente ("Não informado" quando vazio), bloco do texto completo (`ConteudoMensagem`, com `whiteSpace: "pre-wrap"`) e botão "Fechar".
- Corrigir o `borderColor: "slate.200"` do protótipo (token inexistente no tema).
- Conectar ao clique do ícone de olho.
- **Relacionada a:** RN04

- [x] **T06 — Botão Responder**
- Manter o ícone de envelope conforme o Figma, com `aria-label` "Responder mensagem: {título}".
- Desabilitar com Tooltip "Cliente não informou contato" até a decisão do cliente (ver pendências em Requisitos).
- **Relacionada a:** RN06

- [x] **T07 — Proteção de Rota**
- Restringir a página a usuários autenticados com perfil Nutricionista ou Gestor, redirecionando os demais para o login.
- **Relacionada a:** RN01, HU006

- [x] **T08 — Acessibilidade**
- Adicionar `aria-label` descritivo nos ícones de ação, `aria-labelledby` no modal e foco inicial automático.
- Garantir navegação por teclado (Tab, Enter, Esc) e touch target de 44x44px no mobile.
- **Relacionada a:** RNF001

## Verificação

- [x] **T09 — Verificar cenário: Responsividade e Layout**
- Confirmar que em 360px a interface flui para coluna única sem rolagem horizontal e que a tabela vira cards.
- **Critério relacionado:** RNF001, HU001

- [x] **T10 — Verificar cenário: Lista, Filtro e Lista Vazia**
- Confirmar que a lista carrega do mock em ordem decrescente, que o filtro de período atualiza a lista e que um período sem mensagens mostra a mensagem de vazio.
- **Critério relacionado:** Cenários 1, 2 e 5

- [x] **T11 — Verificar cenário: Visualização da Mensagem**
- Confirmar que o modal abre com as informações corretas, mostra "Não informado" quando o nome está vazio, preserva quebras de linha do texto e fecha por "Fechar", Esc e clique fora.
- **Critério relacionado:** Cenários 3 e 4

- [x] **T12 — Verificar cenário: Acesso restrito**
- Confirmar que usuário não logado é redirecionado para o login.
- **Critério relacionado:** Cenário 6

## Pronto quando

- [x] A tela renderiza os dados do arquivo de mock.
- [x] Filtrar por período e visualizar a mensagem completa funcionam.
- [x] O fluxo funciona em desktop e mobile (responsividade).
- [x] O componente Navbar do projeto envolve a tela corretamente.
- [x] Os botões de ação e o modal são plenamente acessíveis por teclado (Tab, Enter e Esc).
- [x] As pendências com o cliente (resposta por e-mail e status de leitura) estão registradas e decididas.