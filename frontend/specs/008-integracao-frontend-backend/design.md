# Design — Integração entre Frontend e Backend

## Decisões confirmadas

O escopo cobre as alterações necessárias no frontend, backend e PostgreSQL. O navegador chama o Next.js pela mesma origem; a regra de CORS Spring permanece inalterada. Login usa e-mail/senha e JWT Bearer, mantido somente em memória por uma hora. O backend aplica a matriz de acesso de `backend/specs/DTOs/requirements.md` e inclui `GESTOR` com permissões de `NUTRICIONISTA`.

O cardápio semanal usa `Semana.data` como segunda-feira e cinco posições de refeição (segunda a sexta); posições vazias são `null`. O endpoint público do cardápio retorna somente datas/refeições. Mensagens públicas não coletam nome ou contato. O change log registra todas as definições aprovadas e os motivos das mudanças.

## Transporte e sessão

- `frontend/next.config.mjs` encaminha `/api/:path*` para `BACKEND_API_BASE_URL` no servidor Next; o navegador nunca recebe uma origem backend pública.
- `apiClient.js` processa JSON, `204`, erros HTTP, JSON inválido e falhas de rede. Gravações não são repetidas automaticamente.
- `authSession.js` mantém token e perfil apenas no módulo em memória. `apiClient.js` envia `Authorization: Bearer` quando há sessão.
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
