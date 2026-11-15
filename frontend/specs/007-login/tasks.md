# Tasks — Login de Funcionários e Recuperação de Acesso

## Implementação

- [x] **T01 — Estrutura Base e Mock de Autenticação**
- Criar `src/app/login/page.js` (ou caminho equivalente definido no projeto) e o componente `LoginRestaurante`.
- Criar `src/services/authService.js` com o usuário mock (`admin` / `admin`, perfil Nutricionista) e funções `autenticar(usuario, senha)`, `obterSessao()` e `encerrarSessao()`.
- **Relacionada a:** RF002, HU006

- [x] **T02 — Layout da Tela de Login**
- Implementar o cabeçalho (logo, "Restaurante Popular", "PREFEITURA MUNICIPAL DE QUIXADÁ" e botão "Voltar"), o fundo em degradê e o card centralizado de 320px.
- Aplicar as correções do protótipo: `100dvh`, tokens do tema no lugar de `slate.*`, remover `data-palette-mode` e usar um único `h1` (o do card).
- **Relacionada a:** RF002, RNF001

- [x] **T03 — Formulário de Login**
- Implementar os campos "Usuário" e "Senha de acesso" controlados (senha começando vazia), com ícone de olho para mostrar/ocultar.
- Migrar `inputProps`/`InputProps` para `slotProps`.
- "ENTRAR" desabilitado com campo vazio; submissão por Enter.
- **Relacionada a:** RF002, RN02

- [x] **T04 — Autenticação, Sessão e Redirecionamento**
- No submit, chamar `autenticar` do mock; com sucesso, gravar a sessão e redirecionar para `/painel-nutricionista`. Com falha, permanecer na tela sem mensagem de erro.
- Encerrar uma sessão anterior e manter o formulário visível quando `/login` for aberto.
- Ligar o botão "Voltar" à rota `/mainPage`.
- **Relacionada a:** RN03, RN04, RN06, RN08, RN09, HU006

- [x] **T05 — Proteção de Rotas Administrativas**
- Criar um componente/guard reutilizável que lê a sessão e redireciona para `/login` quando não há usuário logado (evitar flash de conteúdo e erro de hidratação lendo o `localStorage` apenas no cliente).
- Aplicar em `/painel-nutricionista`, Cardápio (incluindo edição), Estoque, Caixa, Meu Perfil, Notícias e Mensagens.
- **Relacionada a:** RN05, HU006

- [x] **T06 — Modal de Recuperação de Acesso**
- Criar `ModalRecuperarAcesso` (MUI Dialog) com título "Recuperação de Acesso", o texto "Informe o seu E-mail de recuperação.", campo de e-mail controlado e botões "CANCELAR" e "ENVIAR LINK".
- Validar o formato de e-mail e manter "ENVIAR LINK" desabilitado enquanto inválido; ligar o botão ao formulário para o Enter enviar.
- Ao enviar, fechar o modal, limpar o campo e exibir o Snackbar genérico; ao cancelar, limpar e devolver o foco ao botão "RECUPERAR SENHA".
- **Relacionada a:** RN07

- [x] **T07 — Responsividade e Acessibilidade**
- Garantir o card sem rolagem horizontal a partir de 360px e o cabeçalho com subtítulo quebrando em duas linhas.
- Touch target de no mínimo 44x44px em "Voltar", "ENTRAR", "RECUPERAR SENHA" e no ícone de olho; `aria-label` nos campos e no ícone; Dialog com `aria-labelledby`, foco inicial e Esc.
- **Relacionada a:** RNF001, HU001

## Verificação

- [x] **T08 — Verificar cenário: Login e Credenciais Inválidas**
- Confirmar que `admin`/`admin` leva a `/painel-nutricionista`, que credenciais erradas mantêm a pessoa em `/login` e que uma sessão anterior não pula o formulário.
- **Critério relacionado:** Cenários 1, 2 e 10

- [x] **T09 — Verificar cenário: Mostrar Senha e Voltar**
- Confirmar a alternância de visibilidade da senha (e do `aria-label`) e que "Voltar" leva ao Portal.
- **Critério relacionado:** Cenários 3 e 4

- [x] **T10 — Verificar cenário: Recuperação de Acesso**
- Confirmar que o modal abre com foco no e-mail, que "ENVIAR LINK" fica desabilitado com e-mail vazio ou inválido, que o envio fecha o modal com Snackbar e que cancelar, Esc e clique fora fecham e limpam o campo.
- **Critério relacionado:** Cenários 5, 6, 7 e 8

- [x] **T11 — Verificar cenário: Proteção de Rotas**
- Confirmar que, sem sessão, `/painel-nutricionista`, Notícias e Mensagens redirecionam para `/login`, sem erro de hidratação no console.
- **Critério relacionado:** Cenário 9

- [x] **T12 — Verificar cenário: Responsividade e Layout**
- Confirmar que em 360px a tela não tem rolagem horizontal e que os alvos de toque têm 44px.
- **Critério relacionado:** RNF001, HU001

## Pronto quando

- [x] O login valida no mock, redireciona para o painel da nutricionista e mantém a sessão.
- [x] Todas as rotas administrativas bloqueiam acesso sem login: Painel Nutricionista, Cardápio, Estoque, Caixa, Meu Perfil, Notícias e Mensagens.
- [x] A recuperação de acesso funciona de ponta a ponta no mock (validação, confirmação, cancelamento).
- [x] O fluxo funciona em desktop e mobile (responsividade).
- [x] Os botões, campos e o modal são plenamente acessíveis por teclado (Tab, Enter e Esc).
- [x] As pendências com o cliente (perfis, tela de redefinição, mensagens de erro) estão registradas.
