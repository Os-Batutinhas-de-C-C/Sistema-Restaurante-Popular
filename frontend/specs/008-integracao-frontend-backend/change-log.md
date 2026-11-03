# Registro de decisões e alterações

Este arquivo registra as decisões confirmadas para a integração e a razão das alterações feitas. Itens sem resposta continuam pendentes e não devem ser tratados como concluídos.

## Decisões confirmadas

| Tema | Decisão | Motivo |
|---|---|---|
| Escopo | Alterar o backend e o schema quando necessário; manter o frontend dentro do escopo da integração. | Completar fluxos que não podem ser implementados apenas no cliente. |
| Transporte | Usar proxy/rewrite Next.js de mesma origem. | Evitar chamadas do navegador entre origens sem alterar CORS. |
| Login | E-mail e senha com token JWT Bearer. | Substituir o login simulado e autenticar chamadas protegidas. |
| Permissões | Aplicar as regras pública/autenticada/papel descritas em `backend/specs/DTOs/requirements.md`. | Manter a API alinhada ao contrato autorizado. |
| Semana | `Semana.data` identifica a segunda-feira; `cardapio[0..4]` representa segunda a sexta; a lista tem cinco posições e posições vazias são `null`. | Preservar a correspondência entre dia e índice, inclusive quando houver lacunas. |
| Refeição | Adicionar `saladaDoDia` ao modelo, DTOs e banco. | O campo existe no formulário frontend e precisa ser persistido. |
| Mensagens públicas | Permitir envio anônimo em rota dedicada; não coletar nome nem contato; manter assunto/texto. | O formulário público não deve exigir identidade nem armazenar dados de remetente que não são coletados. |
| Exclusões | Habilitar a exclusão de mensagens pela rota existente e criar exclusão de notícias. | Decisão do solicitante sobre as ações administrativas. |
| Estoque | Derivar status da validade e adicionar atualização/exclusão. | Evitar persistir um status manual que possa divergir da data de validade. |
| Cardápio frontend | Substituir dados de demonstração por dados da API. | Usar dados persistidos como fonte do sistema. |
| Validade do estoque | “Vence em breve” nos 7 dias anteriores à validade; “Vencido” começa no dia seguinte à data de validade. | Regra confirmada pelo solicitante. |
| Sessão JWT | Guardar o JWT somente em memória e dar validade de 1 hora, exigindo novo login após expirar. | Evitar armazenamento persistente no navegador e definir a duração da sessão. |
| Remetente público | Não coletar nem persistir nome ou contato. | O formulário atual deve permanecer sem identificação pessoal. |
| Semanas antigas | Ordenar refeições associadas pelo ID de refeição para preencher as posições antigas, aceitando que os dias resultantes podem estar incorretos. | Migrar os dados legados conforme decisão explícita, sem bloquear o novo formato. |
| Métricas semanais antigas | Atribuir posições a desperdício/fichas pela ordem física atual das linhas PostgreSQL; os dias históricos podem ficar incorretos. | Decisão do solicitante para manter as métricas acessíveis apesar de as tabelas antigas não registrarem índice/dia. |
| Papel Gestor | Adicionar `GESTOR` com permissões equivalentes às de `NUTRICIONISTA`. | Alinhar o backend ao perfil já citado no frontend. |
| Usuários de demonstração | Criar usuários iniciais somente no perfil local e ler as credenciais de variáveis de ambiente. | Remover senhas fixas do código e evitar o seed fora do ambiente local. |
| Segurança JWT | Implementar Resource Server/JOSE, JWT stateless, regras de acesso DTO e respostas JSON 401/403. | O solicitante aprovou o plano de segurança. |
| Verificação de segurança | Executar testes focados de login, token malformado/expirado e matriz 401/403 após a implementação. | O solicitante autorizou especificamente esses testes. |
| Menu público | Criar endpoint GET público e somente leitura com datas/refeições, sem fichas vendidas ou desperdício. | Integrar o menu público sem expor as métricas administrativas da semana. |
| Banco legado local | Criar as tabelas JPA atuais vazias ao lado das tabelas antigas, sem importar registros ou contas. | Decisão do solicitante para concluir T12 preservando integralmente o conteúdo legado. |
| Chave JWT da execução local | Gerar uma chave aleatória de 32 bytes somente no ambiente do processo backend, sem exibição ou persistência. | Autorização explícita do solicitante para iniciar o sistema local mantendo os segredos fora do repositório. |

## Arquivos de especificação atualizados

| Arquivo | Alteração | Razão |
|---|---|---|
| `frontend/specs/008-integracao-frontend-backend/requirements.md` | Base da especificação de integração revisada durante a preparação. | Registrar contratos e divergências encontrados antes de implementar. |
| `frontend/specs/008-integracao-frontend-backend/design.md` | Registrar arquitetura do proxy e do cliente HTTP, conversões e limites então conhecidos. | Orientar uma implementação sem chamadas diretas do navegador ao backend. |
| `frontend/specs/008-integracao-frontend-backend/tasks.md` | Registrar T11 com build/lint aprovados e achados de browser e T12 concluída após inicialização, migração e validação do PostgreSQL. | Manter o progresso coerente com as verificações executadas e com a decisão de preservar o legado sem importação. |

## Alterações feitas

| Arquivo | Alteração | Razão |
|---|---|---|
| `frontend/next.config.mjs` | Rewrite `/api/:path*` para `BACKEND_API_BASE_URL`. | Encaminhar chamadas pela origem do Next.js sem expor a origem do backend ao navegador. |
| `frontend/.env.example` | Documentar a variável server-side do destino Spring. | Tornar a configuração por ambiente explícita sem incluir credenciais. |
| `frontend/package.json`, `frontend/package-lock.json`, `frontend/eslint.config.mjs` | Instalar as dependências ESLint importadas diretamente pela configuração e ajustar resolução de aliases/imports e exclusão dos artefatos gerados. | Fazer o lint iniciar e analisar o código fonte; a execução agora revela erros de hooks/acessibilidade existentes que precisam de tratamento separado. |
| `frontend/.env.local` (ignorado pelo Git) | Definir `BACKEND_API_BASE_URL` para o backend local. | Permitir build/execução local sem versionar configuração de ambiente. |
| `README.md` | Acrescentar comandos PowerShell de configuração e inicialização de Spring Boot/Next.js, JDK 25, dependências, proxy, chave JWT temporária e encerramento. | Permitir que a equipe execute os dois serviços com o PostgreSQL migrado e sem credenciais padrão. |
| Componentes de carregamento do dashboard, cardápio, estoque, mensagens, notícias e histórico; `ProtectedRoute`; `RegistrarDesperdicio` | Ajustar gatilhos assíncronos de carregamento/recarregamento para eliminar atualizações síncronas de estado em effects; remover o foco automático não acessível do campo de título. | Fazer o lint passar mantendo a apresentação existente e o comportamento de carregamento/repetição. |
| `frontend/src/services/apiClient.js` | Criar cliente `fetch` compartilhado com leitura de JSON/204 e erros HTTP/rede. | Padronizar transporte e evitar repetição automática de gravações. |
| `frontend/src/services/authSession.js`, `frontend/src/services/authService.js`, `frontend/src/components/login/ProtectedRoute.jsx`, `frontend/src/components/login/LoginForm.jsx` | Implementar sessão JWT em memória por uma hora, login por e-mail e proteção de rota por perfil. | Substituir autenticação simulada sem persistir token no navegador. |
| `frontend/src/components/NavbarPainel/NavbarPainel.jsx`, `frontend/src/app/painel-caixa/page.js`, páginas dos painéis de notícia/mensagem/estoque/cardápio/nutricionista | Limpar sessão ao sair e restringir cada painel aos papéis autorizados. | Manter frontend alinhado à matriz de acesso Spring. |
| `frontend/src/services/noticiasService.js` | Buscar, publicar e excluir notícias pela API; mapear DTOs e filtrar/ordenar localmente. | Integrar leitura/escrita com a sessão JWT e mostrar sucesso somente após a API confirmar. |
| `frontend/src/components/mainPage/main/newsCard/index.jsx` | Carregar notícias da API e apresentar estados assíncronos. | Integrar o carrossel público sem fallback silencioso para mock. |
| `frontend/src/components/mainPage/main/newsCard/noticiasMock.js` | Remover o mock do fluxo integrado. | Evitar exibir conteúdo de demonstração como dado atual. |
| `frontend/src/components/mainPage/main/newsCard/style.css` | Estilizar os estados de carregamento/erro/vazio adicionados. | Manter o carrossel utilizável durante a consulta. |
| `frontend/src/services/mensagensService.js` | Buscar e converter mensagens da API; filtrar por período; adicionar envio para `/mensagens/publicas`. | Integrar listagem administrativa e submissão pública com os campos do DTO. |
| `frontend/src/components/painelNutricionistaMensagens/PainelNutricionistaMensagens.jsx` | Carregar/excluir mensagens via API e apresentar carregamento/erro. | Ligar a tela às rotas protegidas após aprovação da matriz de acesso. |
| `frontend/src/components/painelNutricionistaMensagens/ListaMensagens/ListaMensagens.jsx` | Adaptar a lista aos dados e estados recebidos do serviço. | Exibir dados reais e estados da consulta. |
| `frontend/src/services/estoqueService.js` | Buscar/criar/atualizar/excluir estoque e converter o status calculado da API. | Implementar os fluxos confirmados e remover o status manual do request. |
| `frontend/src/components/painelNutricionistaEstoque/DialogInsumo/DialogInsumo.jsx` | Remover a entrada manual de status do formulário. | Status vem da regra de validade do backend. |
| `frontend/src/components/painelNutricionistaEstoque/PainelNutricionistaEstoque.jsx` | Integrar operações e estados assíncronos de estoque. | Confirmar gravações/exclusões somente após resposta do servidor. |
| `frontend/src/components/painelNutricionistaEstoque/ListaEstoque/ListaEstoque.jsx` | Adaptar a lista aos campos e estados da API. | Exibir corretamente os DTOs recebidos. |
| `frontend/src/components/painelNutricionistaEstoque/ItemEstoqueMobile/ItemEstoqueMobile.jsx` | Adaptar o cartão móvel aos dados convertidos. | Preservar a apresentação responsiva com dados da API. |
| `frontend/src/components/painelNutricionistaNoticias/PainelNutricionistaNoticias.jsx` | Conectar leitura e ações ao serviço e exibir erros de gravação. | Mostrar sucesso somente após resposta confirmada pelo servidor. |
| `frontend/src/components/painelNutricionistaNoticias/ModalPublicarNoticia/ModalPublicarNoticia.jsx` | Alinhar limites do formulário ao contrato da notícia. | Evitar requests que o backend rejeita por tamanho. |
| `frontend/src/utils/painelFormatadores.js` | Centralizar formatação de datas usada pelos painéis integrados. | Evitar deslocamentos de data e manter apresentação consistente. |
| `frontend/src/app/painelCliente/page.js` | Passar o serviço de envio público ao formulário. | Conectar a página de contato à camada de API. |
| `frontend/src/components/painelCliente/main/index.jsx` | Aguardar o envio antes de limpar os campos ou mostrar sucesso. | Preservar o formulário em falha e confirmar sucesso somente após persistência. |
| `frontend/src/app/painel-nutricionista/page.js` | Carregar dados do dashboard pela API e salvar desperdício no índice do dia. | Remover mock local e refletir somente dados persistidos; não inventar capacidade total de fichas. |
| `frontend/src/components/painelNutricionista/RegistrarDesperdicio/RegistrarDesperdicio.jsx` | Persistir por API, mostrar a data real e preservar entrada/erro quando a gravação falha. | Evitar confirmação falsa e atualização local sem servidor. |
| `frontend/src/components/painelNutricionista/DashboardNutricionista/DashboardNutricionista.jsx`, `CardapioHoje/CardapioHoje.jsx`, `ResumoMetricas/ResumoMetricas.jsx` | Exibir menu, fichas vendidas, desperdício e estado de carregamento vindos da API. | Remover referências a valores de demonstração e alinhar os nomes aos campos do contrato. |
| `frontend/src/components/painelNutricionistaGerenciarCardapio/GerenciarCardapio.jsx`, `ModalHistorico/ModalHistorico.jsx` | Carregar/salvar semanas via API, corrigir o hook de efeito e separar estados vazio/carregando. | Integrar edição/histórico real sem confundir carga pendente com resultado vazio. |
| `frontend/src/components/mainPage/main/cardapio/index.jsx`, `cardapio/cardapioMock.js` | Buscar o menu público e remover o mock não utilizado. | Usar a rota pública aprovada, que não expõe estatísticas da semana. |
| `frontend/src/services/cardapiosApiService.js`, `cardapioService.js`, `gerenciamentoCardapioService.js`, `frontend/src/components/painelNutricionistaCardapio/PainelNutricionistaCardapio.jsx` | Converter/consultar cardápios, métricas e histórico pelas rotas de API e manter os cinco índices. | Remover o mock das telas pública e administrativa e preservar slots/estatísticas semanais. |
| `frontend/.gitignore` | Ignorar `application.properties`. | Evitar versionar configuração local e credenciais. |
| `frontend/src/components/login/LoginForm.jsx` | Informar que recuperação de senha não está disponível. | Evitar alegar envio de e-mail sem endpoint/serviço backend. |

## Alterações backend e schema

| Arquivos | Alteração | Razão |
|---|---|---|
| `backend/pom.xml`, `backend/src/main/java/.../config/JwtConfig.java`, `SecurityConfig.java`, `DataInitializer.java`, `service/JwtTokenService.java`, `service/UsuarioPapel.java`, `controller/AuthController.java`, `dto/AuthResponseDTO.java` | Implementar JWT HS256 stateless de uma hora, autenticação por e-mail/senha, matriz de papéis, JSON 401/403, contas locais configuradas por ambiente e suporte a `GESTOR`. Compatibilizar o `ObjectMapper` e as authorities com Spring Boot 4/Spring Security 7. | Usar autenticação real, aplicar as permissões contratadas e evitar credenciais fixas no seed. |
| `backend/src/main/java/.../model/Semana.java`, `model/SemanaRefeicao.java`, `repository/SemanaRepository.java`, `service/SemanaService.java`, `controller/CardapioPublicoController.java`, `dto/CardapioPublicoResponseDTO.java`, `model/Refeicao.java`, DTOs de refeição e `service/RefeicaoService.java` | Persistir datas únicas de segunda-feira e cinco slots posicionais com refeição ou `null`; expor rota pública sem métricas; adicionar `saladaDoDia`; persistir índices de desperdício/fichas. | Garantir a associação dia/índice, compartilhar refeições entre semanas e atender ao formato visual sem perder posições. |
| `backend/src/main/java/.../controller/EstoqueController.java`, `dto/EstoqueResponseDTO.java`, `dto/EstoqueUpdateRequestDTO.java`, `service/EstoqueService.java` | Adicionar PUT/DELETE e status calculado por data em `America/Fortaleza`. | Implementar as ações da tela e aplicar os limiares de validade confirmados. |
| `backend/src/main/java/.../model/Mensagem.java`, `controller/MensagemController.java`, `dto/MensagemPublicaCreateRequestDTO.java`, `service/MensagemService.java` | Permitir mensagem anônima, assunto/texto público, data/hora do servidor e filtrar notícias das operações de mensagem. | Atender ao formulário sem usuário/nome/contato e impedir que exclusão de mensagem remova notícia. |
| `backend/src/main/java/.../controller/NoticiaController.java`, `service/NoticiaService.java` | Adicionar exclusão de notícia. | Conectar a ação administrativa aprovada. |
| `backend/database/migrations/V20261102__integracao_frontend_backend.sql` | Adicionar salada, permitir autor nulo e texto de 1000, criar slots de refeições, preservar índices de métricas, normalizar semanas e migrar vínculos antigos por ID crescente; interromper em dados ambíguos/incompatíveis. Usar `INTEGER` para `posicao` e garantir o check nomeado `ck_semana_cardapio_posicao` por `ALTER TABLE` condicional. | Alinhar o tipo ao Java `int` e garantir o limite `0–4` também quando Hibernate já criou a tabela antes de executar `CREATE TABLE IF NOT EXISTS`. |
| `backend/src/main/resources/application.properties` (arquivo local ignorado), `backend.md` | Documentar conexão, JWT, bootstrap e migração; substituir localmente `ddl-auto=create-drop` por `validate` após inicialização pontual com `update`. | Preservar o schema e os registros nas próximas execuções, mantendo credenciais fora do Git. |
| `backend/src/test/java/.../JwtSecurityIntegrationTests.java`, `DtoApiIntegrationTests.java`, `factory/SemanaFactory.java`, `backend/src/test/resources/application.properties` | Criar testes de login/JWT/perfis, adaptar fixtures a Bearer e cinco slots, fornecer chave de teste. | Cobrir as decisões de segurança autorizadas e manter fixtures alinhadas ao novo contrato. |
| `backend/specs/DTOs/requirements.md`, `design.md`, `tasks.md` | Atualizar a spec para as decisões aprovadas e substituir restrições históricas incompatíveis. | Manter documentação de API, segurança e schema coerente com a implementação. |

## Verificação e itens operacionais ainda pendentes

`mvn -Dtest=JwtSecurityIntegrationTests test` passou: 3 testes, 0 falhas/erros, com JDK 25. A primeira tentativa de teste com o Java 21 instalado no PATH não suportava `--release 25`; o wrapper local também não iniciou, então a execução foi feita com o JDK 25 instalado na máquina.

- Testes gerais de DTO/API não foram executados nesta etapa; o build, lint e verificação em navegador da integração frontend estão descritos abaixo.
- O build Next de produção e `npm run lint` passaram com `BACKEND_API_BASE_URL` configurado localmente e dependências ESLint instaladas.
- O navegador Edge headless em 390×844 e 1440×900 carregou a página pública. Com Spring Boot em H2 isolado, as consultas de cardápio público e notícias passaram pelo proxy Next e retornaram HTTP 200 com listas vazias. A captura mobile revelou conteúdo cortado horizontalmente; a tela desktop renderizou sem esse corte.
- O solicitante escolheu inicializar as tabelas JPA atuais vazias ao lado das tabelas legadas, sem importar os registros existentes. Hibernate `update`, usando as entidades e as estratégias de nomes padrão do Spring Boot, criou as dez tabelas atuais. A migração `V20261102__integracao_frontend_backend.sql` foi aplicada em transação em `restaurante_popular/public` e Hibernate `validate` passou; a compilação Maven também passou.
- As consultas de catálogo confirmaram salada, texto de 1000 caracteres, autor de mensagem anulável, datas semanais não nulas e únicas, posições inteiras, índices únicos, check `0–4` dos slots e chaves estrangeiras para as tabelas atuais. Todas as dez tabelas atuais ficaram vazias, incluindo usuários e credenciais.
- Uma cópia temporária dos registros legados, mantida somente na sessão PostgreSQL de verificação, permitiu comparar o conteúdo integral antes/depois sem expor seus valores: todos os 44 registros permaneceram iguais, assim como as identidades das quatro tabelas (`refeicao`: 20; `semana`: 20; `usuario`: 2; `mensagem_usuario`: 2). A sessão foi encerrada após a verificação.
- A configuração local permanente usa `ddl-auto=validate`. A primeira validação do schema foi executada diretamente pelas ferramentas Hibernate. Depois da autorização para uma chave JWT aleatória no ambiente do processo, Spring Boot iniciou em `8080` com conexão PostgreSQL a `restaurante_popular/public` e Next.js iniciou em `3000`. As instâncias anteriores deste projeto que ocupavam essas portas foram substituídas. A chave temporária não foi registrada nem persistida; nenhuma conta legada foi migrada ou criada.
- As requisições a `/mainPage` e `/login` no frontend e a `/api/cardapios/publicos` e `/api/noticias`, tanto diretamente no backend quanto via proxy Next.js, retornaram HTTP `200`. As consultas públicas retornaram listas vazias, coerentes com a decisão de iniciar o conjunto JPA sem registros.
- Recuperação de senha permanece indisponível; a interface agora comunica isso em vez de afirmar que enviou e-mail.

T01–T12 estão concluídas e os dois serviços foram iniciados contra PostgreSQL. A decisão operacional para este ambiente é preservar as tabelas legadas sem importação e utilizar o conjunto JPA novo, inicialmente vazio. Nas próximas execuções, fornecer a chave JWT conforme o README; contas locais ainda precisam ser criadas para usar os fluxos autenticados.
