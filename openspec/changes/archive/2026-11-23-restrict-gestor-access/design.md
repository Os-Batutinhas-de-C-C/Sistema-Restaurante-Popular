# Design — Acesso do Gestor

## Context

`PainelGestor` renderiza `PainelOperacional`, que consulta `/api/semanas` para obter cardápio e desperdício e monta as ações da Nutricionista. O menu leva às telas compartilhadas e a rota de edição de cardápio com data exige apenas uma sessão. No Spring, algumas permissões incluem explicitamente `GESTOR` e a política geral de autenticação também permite ao Gestor publicar notícias e administrar contas.

O delta usa a capacidade `painel-gestor` já implementada em `add-painel-gestor`. A matriz em [DTOs](../../../../backend/specs/DTOs/requirements.md), o RF008 e o RN13 da [integração de frontend](../../../../frontend/specs/008-integracao-frontend-backend/requirements.md) e os acessos documentados nas especificações de cardápio, estoque, notícias e mensagens descrevem os acessos anteriores e precisam refletir a nova regra.

## Goals / Non-Goals

Limitar as respostas e as permissões do Gestor no servidor. Reutilizar os indicadores visuais, a autenticação e o fluxo de perfil próprio para entregar a consulta diária no frontend.

## Decisions

### Autorizar por verbo e rota

Em `SecurityConfig`, manter explícitas as operações públicas e as operações de perfil próprio `GET /api/usuarios/me`, `PUT /api/usuarios/me` e `PUT /api/usuarios/me/senha`. O acesso autenticado adicional do Gestor é `GET /api/desperdicio/hoje`. As exceções de perfil e de acesso público entram antes dos matchers mais amplos. A identidade do perfil vem do JWT validado em `PerfilController`.

Aplicar `NUTRICIONISTA` às operações de semanas, refeições, estoque e exclusão de notícias. Aplicar `NUTRICIONISTA` e `CAIXA` ao atendimento administrativo de mensagens. O incremento de fichas exige `CAIXA`. A regra geral de autenticação exclui `GESTOR` para as demais rotas da API, inclusive publicação de notícia e listagem ou criação de usuários, com as permissões contratadas dos demais papéis. Isso cobre caminhos que hoje permitem acesso por autenticação sem verificar o papel. O Spring aplica as regras a JWTs de Gestor válidos já emitidos.

### Ler o desperdício do dia

Adicionar a operação de leitura `GET /api/desperdicio/hoje` com DTO `{ data, desperdicioKg }`. Usar o relógio injetável que determina o dia de fichas em `America/Fortaleza`. Em dia útil, o serviço consulta a semana pela segunda-feira e lê a posição correspondente da lista persistida de desperdício. O serviço usa uma transação de leitura e retorna `null` se a semana, a posição ou o valor estiver ausente ou se a data for de fim de semana. A API usa o valor registrado, inclusive zero. A resposta projetada reduz a leitura exposta ao Gestor a um único dia.

### Compor o painel e proteger a navegação

Compor o conteúdo em `PainelGestor` com cabeçalho, data, atualização de leitura e `ResumoMetricas` reutilizado para as duas métricas. Usar `useFichasDia` para a contagem sincronizada e `apiClient` com uma integração de desperdício autenticada em `src/services/`. A composição independente mantém as chamadas de semana, formulário de desperdício e atalhos operacionais no painel que os utiliza. O estado vazio do desperdício usa um texto informativo para Gestor e a leitura distingue `null` de zero.

Apresentar carregamento e erro por consulta e oferecer nova tentativa. Se a data das respostas divergir durante a virada do dia, descartar o valor anterior para a apresentação de hoje e recarregar a consulta que ficou defasada. Usar os cartões e a barra de navegação MUI existentes, com layout adaptável a partir de 360 px e acesso por teclado. A [referência mobile](<../../../../frontend/docs/interface/001-cardapio/PAINEL NUTRICIONISTA - CARDAPIO mobile.png>) orienta a barra fixa, o foco e o espaçamento.

Em `NavbarPainel`, usar “Início” e “Sair” para a variante Gestor e preservar a ação do avatar “Meu Perfil”. Configurar os papéis permitidos no `ProtectedRoute` da página inicial da Nutricionista, Cardápios, edição por data, Estoque, Notícias e Mensagens. As rotas específicas da Nutricionista aceitam Nutricionista e Mensagens também aceita Caixa. O redirecionamento de papel incompatível usa `/mainPage`. A lógica de formulário de `useMeuPerfil` aplica as validações vigentes e redireciona para login após salvar e-mail ou senha.

## Risks / Trade-offs

- O frontend anterior do Gestor carrega `/api/semanas`. Publicar os dois serviços na mesma entrega, para que a versão restrita da API seja consumida pela nova página.
- A troca da data pode acontecer entre as duas respostas. Usar as datas de referência retornadas pelo servidor para evitar apresentar indicadores de dias diferentes como se fossem do mesmo dia.
- Manter casos de autorização para operações liberadas por autenticação genérica e para acesso direto à edição de cardápio. Esses caminhos exigem verificação em conjunto com os atalhos e menus.

## Migration Plan

Publicar frontend e API sobre o esquema atual. O serviço lê os registros semanais já gravados e usa as contas existentes. A revisão de permissões entra em vigor quando a versão nova da API começa a receber requisições.

Para arquivar o delta, integrar primeiro a especificação de `add-painel-gestor` em `openspec/specs/painel-gestor/spec.md`. A mudança anterior foi implementada e fornece a base dos requisitos modificados. A implementação desta proposta pode usar essa base diretamente.
