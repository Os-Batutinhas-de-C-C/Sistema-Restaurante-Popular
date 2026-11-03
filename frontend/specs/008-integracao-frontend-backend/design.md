# Design — Integração entre Frontend e Backend

## Decisões confirmadas

O escopo cobre as alterações necessárias no frontend, backend e PostgreSQL. O navegador chama o Next.js pela mesma origem; a regra de CORS Spring permanece inalterada. Login usa e-mail/senha e JWT Bearer, mantido somente em memória por uma hora. O backend aplica a matriz de acesso de `backend/specs/DTOs/requirements.md` e inclui `GESTOR` com permissões de `NUTRICIONISTA`.

O cardápio semanal usa `Semana.data` como segunda-feira e cinco posições de refeição (segunda a sexta); posições vazias são `null`. O endpoint público do cardápio retorna somente datas/refeições. Mensagens públicas não coletam nome ou contato. O change log registra todas as definições aprovadas e os motivos das mudanças.

## Transporte e sessão

- `frontend/next.config.mjs` encaminha `/api/:path*` para `BACKEND_API_BASE_URL` no servidor Next; o navegador nunca recebe uma origem backend pública.
- `frontend/src/proxy.js` executa antes desse rewrite, apenas em `/api/:path*`. Valida `Origin` contra o protocolo e o `Host` recebido (sem confiar em `X-Forwarded-Host`), rejeita origens diferentes/inválidas e Fetch Metadata `same-site`/`cross-site` com JSON `403`, e remove `Origin` somente após aceitar a requisição. O uso de `Host` preserva acesso válido por `localhost`, `127.0.0.1` e IPv6 apesar da normalização interna do Next. Chamadas sem `Origin` continuam aceitas quando não há indicação de outra origem. Os cabeçalhos são modificados na requisição upstream, preservando `Authorization`; não são copiados para a resposta ao navegador.
- `apiClient.js` processa JSON, `204`, erros HTTP, JSON inválido e falhas de rede. Gravações não são repetidas automaticamente.
- `authSession.js` mantém token e perfil apenas no módulo em memória. `apiClient.js` envia `Authorization: Bearer` quando há sessão.
- `NavbarPainel`, `CardapioHoje` e `AcoesRapidas` usam `useRouter` de `next/navigation` para perfil, edição diária, notícias e estoque. Os botões não usam navegação nativa por `href`, que recarregava o documento e apagava a sessão em memória. O callback opcional de perfil é preservado, inclusive `preventDefault()`. As ações rápidas levam às páginas administrativas existentes; registrar desperdício mantém seu callback de abertura do diálogo.
- `ProtectedRoute` valida expiração e perfil; o servidor rejeita cada operação conforme a matriz de autorização.

## Conversão e telas

- Serviços de recurso convertem os DTOs HTTP aos modelos visuais. Notícias, mensagens e estoque carregam dados reais e mostram estados de loading/empty/error.
- Formulários só mostram sucesso depois da resposta do backend e conservam valores em caso de falha.
- Estoque exibe o status calculado pela API, não solicita status manual. Edição e exclusão usam PUT/DELETE.
- Mensagens usam a rota pública anônima com assunto/texto e as rotas administrativas protegidas para lista/exclusão.
- O cardápio público usa `GET /api/cardapios/publicos`. A área nutricionista usa `GET /api/semanas` e envia as cinco posições ao criar/atualizar uma semana, preservando os IDs de refeições já existentes.
- O dashboard nutricionista usa métricas de `/api/semanas`; não inventa limite de fichas quando não há capacidade no contrato. O registro diário de desperdício atualiza somente o índice do dia.

## Configuração e limites

Frontend requer `BACKEND_API_BASE_URL`. Backend requer `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` e `JWT_SECRET_BASE64`. Contas de bootstrap são opcionais, perfil `local` apenas, por variáveis de ambiente. Não incluir segredos no repositório.

O botão de recuperação de senha ainda não possui endpoint nem serviço de e-mail backend; não deve ser considerado integrado. A aplicação da migração PostgreSQL é um passo operacional separado, descrito em `backend.md`. No ambiente de desenvolvimento atual, as tabelas JPA foram inicializadas vazias ao lado das tabelas legadas, preservadas sem importação por decisão do solicitante. Após a migração, a configuração local usa `ddl-auto=validate`.

## Verificação

Os testes focados de segurança estão definidos em `JwtSecurityIntegrationTests`. A validação autorizada de frontend/browser foi executada e seus resultados e pendências estão em `tasks.md`: build e lint passaram, o proxy público funcionou com Spring/H2 e a tela pública apresentou overflow horizontal em viewport mobile. T12 foi concluída em PostgreSQL com inicialização Hibernate, migração transacional, validação `validate`, checagem das constraints e comparação integral dos registros legados. As dez tabelas atuais permaneceram vazias; os 44 registros antigos foram preservados. A execução conjunta do backend em `8080` e do frontend em `3000` também foi confirmada com PostgreSQL: página pública, login e consultas públicas de menu/notícias via proxy retornaram `200`. Uma chave JWT aleatória foi autorizada somente para o processo backend atual; o README explica como fornecer a chave nas próximas inicializações.

Após a inicialização vazia, o solicitante autorizou criar duas contas de desenvolvimento pelos parâmetros de ambiente do bootstrap `local`: Gestor e Caixa. Foram confirmados dois usuários e dois registros de credenciais BCrypt, além de login e acesso aos recursos esperados com HTTP `200`, diretamente no backend e via proxy Next.js. Essa provisão não importa contas antigas nem amplia as permissões dos perfis; credenciais e tokens não são registrados nestes documentos.

A verificação inicial desses logins usou clientes HTTP sem `Origin` e não comprovava a submissão do formulário no navegador. Em 03/11/2026, a falha foi reproduzida: o mesmo login com `Origin` do frontend recebia `403 Invalid CORS request` do Spring. A correção autorizada acima passou em 21 testes de regressão (`node --test tests/api-proxy.test.mjs`), lint e build. Foram aprovadas 35 verificações HTTP nos serviços em execução, incluindo login dos dois perfis com origem de navegador em `localhost` e `127.0.0.1`, leitura pública, token ausente/malformado, senha inválida, permissões dos perfis e rejeição de origens externas. O CORS direto do Spring continua rejeitando a origem frontend, como antes; o navegador usa o proxy validado.

A submissão real do formulário também passou em Edge headless a 1440×900, usando contextos isolados: Gestor recebeu `200`, abriu `/painel-nutricionista` e consultou semanas com `200`; Caixa recebeu `200` e abriu `/painel-caixa`. Nenhum dos fluxos apresentou erro de console ou exceção de execução. A correção foi carregada pelo Next em execução; não exigiu reiniciar ou modificar o backend.

Para a correção posterior dos quatro botões do dashboard (T14/RN11), o lint dos três componentes e o build de produção passaram; a revisão confirmou os destinos e a preservação dos callbacks de perfil/desperdício. A verificação de navegação no navegador não foi executada porque a permissão necessária para iniciar Edge headless foi cancelada. Portanto, os resultados anteriores de login não comprovam os novos cliques. Os serviços existentes não foram reiniciados ou encerrados.

A investigação posterior do botão “Salvar Cardápio” (T15) confirmou em Edge isolado que o formulário com `1000` kcal era válido e emitia `POST /api/semanas`; essa primeira etapa interceptou a escrita. Após autorização para salvar um registro temporário e removê-lo, o endpoint retornou `500`. Um backend de diagnóstico na porta `18080` revelou que `existsByData()` tentava resolver uma propriedade `id` inexistente em `Semana`. A verificação de semana duplicada passou a reutilizar `findByData(...).isPresent()`, preservando a rejeição de duplicatas e o mapeamento existente. O teste focado em H2 passou; o teste PostgreSQL do backend corrigido confirmou cadastro e leitura `200`, cinco posições e `1000` kcal. Seus registros foram removidos e o backend temporário foi encerrado. O processo do usuário em `8080` requer reinício para receber a alteração.
