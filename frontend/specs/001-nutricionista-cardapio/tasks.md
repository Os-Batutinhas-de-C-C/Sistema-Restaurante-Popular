# Tasks — Painel Nutricionista: Visão Geral e Gráficos

## Implementação

- [x] **T01 — Estrutura Base e Mock de Dados**
  - Criar o arquivo `src/app/(admin)/painel-nutricionista/page.jsx` (ou caminho equivalente definido no projeto).
  - Criar um mock em `src/services/cardapioService.js` retornando dados fictícios para os gráficos (fichas e desperdício) e uma lista com 5 dias úteis (contendo exemplos preenchidos e exemplos 'Pendentes').
  - **Relacionada a:** HU03, HU13

- [x] **T02 — Grid e Responsividade da Página**
  - Implementar o layout usando MUI `Grid` ou CSS Modules com Flexbox, garantindo a visualização em duas colunas no desktop e coluna única no mobile.
  - **Relacionada a:** RNF001

- [x] **T03 — Implementar Gráficos de Fichas e Desperdício**
  - Criar componente client-side `CardapioCharts` englobando gráficos de barra simples. (Utilizar `@mui/x-charts` caso permitido no projeto, ou compor visualmente com divs).
  - Garantir que as legendas e cores sigam a especificação do design (Azul para Fichas, Laranja para Desperdício).
  - **Relacionada a:** HU13

- [x] **T04 — Implementar Controle de Semana**
  - Criar componente do seletor da semana, incluindo o texto do intervalo ("21/09/2026 - 25/09/2026") e os botões `< Anterior` e `Próxima >` usando MUI Button.
  - **Relacionada a:** HU03

- [x] **T05 — Implementar Lista de Dias do Cardápio**
  - Renderizar os 5 blocos contendo a data, o texto do resumo truncado (ou "Pendente").
  - Adicionar os MUI `IconButtons` com bordas arredondadas e cores baseadas no Figma (Lápis e Olho).
  - Configurar o botão de Lápis para fazer o push para a rota de edição de cardápio (URL a definir).
  - **Relacionada a:** HU03, RN03, RN04

- [x] **T06 — Modal de Detalhamento da Refeição**
  - Criar componente `ModalRefeicao` baseado no MUI `Dialog`.
  - Exibir título, conteúdo descritivo (Prato principal, Acompanhamentos, Valor Calórico) e o botão "Fechar" com a cor do tema.
  - Conectar a abertura do modal ao evento de clique do ícone de olho da lista.
  - **Relacionada a:** RN05

## Verificação

- [x] **T07 — Verificar cenário: Responsividade e Layout**
  - Confirmar se em telas estreitas (360px) a interface flui para coluna única sem causar rolagem horizontal, conforme imagem do Figma.
  - **Critério relacionado:** RNF001
  TESTADO PELO DESENVOLVEDOR

- [x] **T08 — Verificar cenário: Dias pendentes e Interação do Modal**
  - Confirmar que dias sem dados mockados exibem "Pendente".
  - Confirmar que o clique no ícone de "Visualizar" abre o modal com as informações correspondentes e fecha ao clicar em "Fechar" ou fora da caixa.
  - **Critério relacionado:** Cenário 2 e 3
TESTADO PELO DESENVOLVEDOR
## Pronto quando

- [ ] A tela e os gráficos estão renderizando os dados do arquivo de mock.
- [ ] O fluxo funciona em desktop e mobile (responsividade).
- [ ] O componente Navbar do projeto envolve a tela corretamente.
- [ ] Os botões de ação e modais são plenamente acessíveis por teclado (Tab e Enter).
