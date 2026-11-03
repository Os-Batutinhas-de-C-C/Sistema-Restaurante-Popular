# Tarefas — Integração entre Frontend e Backend

## Preparação e decisões

- [x] **T01 — Inspecionar contratos e restrições:** comparar telas/serviços, controllers, DTOs, configuração de segurança e documentos de ambiente.
- [x] **T02 — Confirmar decisões de integração:** proxy Next, JWT em memória por uma hora, permissões DTO, semana de segunda a sexta com cinco posições, menu público, mensagens anônimas, estoque e operações administrativas.

## Implementação

- [x] **T03 — Transporte:** cliente `fetch` compartilhado em `/api`, rewrite Next de mesma origem, tratamento de JSON/204/erros e sem repetição automática de gravações.
- [x] **T04 — Notícias e mensagens:** consultas, publicações, exclusões, formulário público anônimo e estados assíncronos conectados à API.
- [x] **T05 — Estoque:** leitura/criação/atualização/exclusão integradas; status derivado da validade pelo backend.
- [x] **T06 — Cardápio:** trocar mocks por API pública/administrativa, converter campos, manter os cinco índices e persistir edição diária/histórico/desperdício.
- [x] **T07 — Autenticação e acesso:** login por e-mail/senha com JWT Bearer em memória, proteção das rotas frontend e regras Spring por papel.
- [x] **T08 — Schema e migração:** persistir salada, posições de refeição/métricas, datas de segunda-feira e mensagens sem autor; incluir migração PostgreSQL e pré-condições documentadas.
- [x] **T09 — Registro das decisões:** atualizar requirements/design/tasks e change-log com mudanças e razões.

## Verificação

- [x] **T10 — Testes focados de segurança:** executar `JwtSecurityIntegrationTests` para login, JWT ausente/malformado/expirado e matriz pública/401/403; os três testes passaram com JDK 25.
- [x] **T11 — Verificação de frontend e integração no navegador (concluída):** `npm run lint` e `npm run build` passaram após corrigir 11 atualizações síncronas de estado em effects e remover o foco automático não acessível, sem alterar CSS ou layout. Edge headless em 390×844 e 1440×900 confirmou que o proxy Next encaminha consultas públicas de cardápio/notícias ao Spring/H2 e recebe `200`; a captura mobile mostrou conteúdo cortado horizontalmente, registrado como limitação visual sem correção nesta tarefa.
- [x] **T12 — Aplicar migração em PostgreSQL de desenvolvimento:** concluída em `restaurante_popular`, schema `public`. As dez tabelas JPA atuais foram inicializadas vazias com Hibernate `update`, conforme decisão do solicitante; `V20261102__integracao_frontend_backend.sql` foi aplicada com sucesso e a validação Hibernate `validate` passou. Foram conferidos tipos, nulabilidade, unicidade, chaves estrangeiras e o limite de posições `0–4`. A comparação integral dos registros e das identidades das tabelas confirmou a preservação do legado (`refeicao`: 20; `semana`: 20; `usuario`: 2; `mensagem_usuario`: 2), sem importação. A configuração local permanente agora usa `ddl-auto=validate`.

- [x] **T13 — Corrigir e validar origem no proxy de login:** correção autorizada em 03/11/2026. O proxy valida a origem antes de removê-la no encaminhamento ao Spring, mantendo CORS/JWT/permissões e o visual. Os 21 testes de regressão, lint, build e 35 verificações HTTP passaram. Em Edge headless (1440×900), a submissão real do formulário retornou `200` para ambos os perfis: Gestor chegou a `/painel-nutricionista`, com consultas de semanas `200`, e Caixa a `/painel-caixa`. Não houve erros de console ou exceções de execução nos dois fluxos. Os testes iniciais de login anteriores a esta correção omitiam `Origin` e não verificavam a submissão do navegador.

- [x] **T14 — Corrigir navegação autenticada do painel:** substituir `href` por `router.push()` no perfil e na edição diária, e conectar as ações rápidas às páginas existentes de notícias e estoque. O lint dos três componentes, o build de produção e a revisão dos destinos/callbacks passaram. A verificação dos cliques e da conservação da sessão no navegador não foi executada: a solicitação de permissão para iniciar Edge headless foi cancelada. Esta limitação permanece registrada; nenhum serviço em execução foi reiniciado ou encerrado.

- [x] **T15 — Corrigir falha no primeiro cadastro de cardápio:** reproduzido HTTP `500` em `POST /api/semanas` com `1000` kcal. A consulta derivada `existsByData()` falhava com `PropertyReferenceException: No property 'id' found for type 'Semana'` antes da gravação. O service agora usa `findByData(...).isPresent()` e o método derivado defeituoso foi removido. O novo teste focado `DtoApiIntegrationTests#firstMenuCanBeCreatedWithFiveDaySlotsAndReadBack` passou em H2 explicitamente isolado. Em um backend temporário na porta `18080`, o cadastro autorizado da semana `2099-01-05` retornou `200`, persistiu refeição/slots e foi lido novamente com `200`; os registros de teste foram removidos e as contagens voltaram a zero. A instância temporária foi encerrada. O backend do usuário em `8080` não foi reiniciado e precisa de reinício para carregar a correção.

- [x] **T16 — Navbar do painel do Caixa:** reutilizar a navbar existente com título “Painel do Caixa”, dropdown contendo somente “Sair” e espaçamento para a barra fixa. O lint dos componentes alterados e o build de produção passaram. Edge headless, com respostas de API de teste isoladas no navegador, confirmou em `360×844` e `1440×900` título/menu, assets reutilizados, barra de 64 px, espaço de 28 px antes do conteúdo e logout com limpeza da sessão da interface. A variante da nutricionista conservou título e sete itens. Não houve exceções JavaScript. O servidor temporário `3100` foi encerrado; nenhum backend ou banco foi utilizado nesta verificação.

- [x] **T17 — Integrar Meu Perfil e distinguir os papéis:** dados próprios por `GET /api/usuarios/me`, atualização de nome/e-mail e senha, papel somente leitura, navbar Caixa ou Nutricionista/Gestor. Senha atual, confirmação, unicidade do e-mail e revogação por `tokenVersion` seguem o plano aprovado. Migração `V20261103__perfil_usuario.sql` aplicada e preservação dos usuários/credenciais verificada; 12 testes H2, lint/build frontend e guards PostgreSQL passaram. Next/Spring/H2 no navegador confirmou Caixa em `360×844`, Nutricionista em `1440×900`, nome persistido com sessão mantida, erros inline/dados preservados, bloqueio de senha curta e novo login após e-mail/senha alterados. Capturas inspecionadas; servidores temporários encerrados e build normal restaurado para backend `8080`.

## Decisões confirmadas

- `/api` usa proxy Next de mesma origem; CORS não foi alterado.
- JWT Bearer é mantido somente em memória, expira em uma hora e requer novo login.
- `GESTOR` tem permissões de `NUTRICIONISTA`; `CAIXA` acessa mensagens conforme a spec DTO.
- A data semanal é segunda-feira e o array de refeições possui cinco posições, segunda a sexta; posição vazia é `null`.
- Refeições legadas sem ordem são migradas por ID crescente, aceitando que alguns dias possam ficar incorretos.
- Métricas semanais legadas sem índice são migradas pela ordem física atual das linhas, aceitando que os dias possam ficar incorretos.
- O menu público retorna somente datas e refeições.
- Mensagens públicas não coletam nome nem contato; exclusão administrativa de mensagens/notícias e CRUD de estoque estão habilitados.
- “Vence em breve” aplica-se até sete dias antes da validade; “Vencido” começa no dia seguinte.
- O dashboard não inventa capacidade total de fichas, campo ausente no contrato.
- O PostgreSQL mantém as tabelas legadas e seus registros; o conjunto JPA atual foi inicializado vazio ao lado delas, sem importar dados ou contas antigas.

## Limitações registradas

- Recuperação de senha continua sem endpoint nem serviço de e-mail no backend.
- As credenciais locais do PostgreSQL autenticaram com sucesso; o arquivo local `application.properties` permanece ignorado pelo Git. Seus valores não foram registrados na documentação ou nos resultados da verificação.
- A verificação frontend/browser foi executada: build e lint passaram após instalar as dependências ESLint e ajustar os effects de carregamento. O proxy respondeu com o backend H2; foi observado overflow horizontal na tela pública mobile, mantido como pendência visual. Nenhuma alteração de CSS/layout foi feita ao concluir T11.
- O schema PostgreSQL e a migração foram validados diretamente com Hibernate e consultas SQL. Em seguida, a execução completa do backend em `8080` e do frontend em `3000` foi confirmada contra PostgreSQL; página pública, login e consultas públicas via proxy retornaram `200`. O solicitante autorizou uma chave JWT aleatória de 32 bytes somente no ambiente do processo backend. A chave não foi exibida nem persistida: novas execuções precisam fornecer ou gerar sua própria chave conforme o README. Posteriormente, o solicitante autorizou o bootstrap de duas contas locais, Gestor e Caixa. As duas contas e suas credenciais com hash BCrypt foram persistidas e os logins retornaram `200` diretamente no backend e pelo proxy; os recursos autorizados de semanas e mensagens também responderam `200`. Os registros legados foram mantidos e as permissões existentes não foram alteradas.
