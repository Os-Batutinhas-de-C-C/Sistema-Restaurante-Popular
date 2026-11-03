# Tarefas — DTOs nos contratos HTTP da API

## Planejamento e decisões

- [x] **T01 — Resolver decisões de contrato:** manter `emailRecuperacao` na resposta, permitir refeição sem semana, permitir associação de uma refeição a várias semanas e definir `Noticia.duracao` em horas inteiras de 1 a 72.
- [x] **T02 — Obter autorização para os ajustes de model:** o solicitante autorizou exatamente as alterações de model descritas em `design.md`.

## Implementação

- [x] **T03 — Criar DTOs:** criar request/response DTOs em `dto/` para usuários, semanas, refeições, mensagens, notícias e estoque, conforme `requirements.md`.
- [x] **T04 — Aplicar ajustes autorizados nos models:** corrigir setters de `Usuario`, adicionar setters em `Estoque`, adicionar `Noticia.setDuracao` e mapear a associação muitos-para-muitos de `Semana` para `Refeicao`.
- [x] **T05 — Implementar serviços e mapeamentos:** implementar conversão nos dois sentidos e persistência nos services; usar injeção por construtor.
- [x] **T06 — Migrar controllers:** alterar as assinaturas dos endpoints para DTOs, preservando rotas, códigos HTTP, tratamento de `404` e regras de acesso existentes.
- [x] **T07 — Proteger campos sensíveis:** confirmar que nenhum response DTO expõe `CredencialAutenticacao`, senha, hash, salt, token ou tentativas de autenticação.

## Verificação

- [x] **T08 — Testar mapeamentos:** cobrir request DTO → entidade e entidade → response DTO, inclusive listas, datas, horários, criação inline e relações por ID.
- [x] **T09 — Testar contratos HTTP:** verificar rotas, status e JSON, incluindo respostas `404`, `204`, `400`, `401` e `403`, conforme os critérios de `requirements.md`.
- [x] **T10 — Verificar escopo:** confirmar que nenhum arquivo em `frontend/` foi alterado e que as alterações em `model/` correspondem à autorização.

## Pronto quando

- [x] Todos os endpoints cobertos recebem e retornam apenas DTOs nos corpos HTTP, exceto as respostas sem corpo especificadas.
- [x] Os controllers delegam aos services e não fazem mapeamento de entidades.
- [x] Os critérios de aceitação de `requirements.md` foram verificados e não há exposição de dados sensíveis.

## Aditivo — Integração frontend/backend (02/11/2026)

### Decisões e implementação aprovada

- [x] Login por e-mail/senha, JWT Bearer de uma hora e validação stateless.
- [x] Matriz de permissões DTO e papel `GESTOR` equivalente a `NUTRICIONISTA`; erros JSON `401`/`403`.
- [x] Seed somente no perfil `local`, com credenciais de ambiente.
- [x] Datas semanais na segunda-feira, slots de refeição posicionais de 0 a 4 e valores `null` preservados.
- [x] Persistência ordenada para desperdício/fichas, salada no modelo/DTO/schema e migração de associações antigas por ID crescente.
- [x] Endpoint público do cardápio sem métricas administrativas.
- [x] Mensagem pública anônima sem nome/contato, exclusão de notícia/mensagem e CRUD necessário de estoque com status derivado.
- [x] Remover a senha PostgreSQL versionada de `application.properties` e usar variáveis de ambiente, conforme aprovação explícita.

### Verificação

- [x] Executar `JwtSecurityIntegrationTests` para login, tokens ausente/malformado/expirado e matriz de acesso (3 testes passaram em 02/11/2026 com JDK 25).
- [ ] Executar a migração contra PostgreSQL de desenvolvimento após confirmar os pré-requisitos documentados; esta etapa não foi executada.
- [ ] Outros testes DTO/API não foram executados nesta tarefa; testes frontend e validação no navegador permanecem fora da verificação autorizada.

Os dois itens anteriores registram o limite da execução focada de 02/11/2026. A migração PostgreSQL foi concluída posteriormente em T12 da integração; as verificações de perfil abaixo são o aditivo de 03/11/2026.

## Aditivo — Meu Perfil (03/11/2026)

- [x] **P01 — Registrar decisões de segurança:** identidade pelo JWT, papel somente leitura, senha atual para e-mail/senha, e-mail único conservando a comparação existente, seis caracteres Unicode e 72 bytes UTF-8 para nova senha, revogação de todos os tokens anteriores.
- [x] **P02 — Implementar contratos próprios:** DTOs de atualização de perfil/senha, consulta e atualizações da própria conta, respostas `200`/`204`, validações `400`, conflito `409` e autenticação `401`.
- [x] **P03 — Persistir versão e validar tokens:** `versao_token`, claim `tokenVersion`, comparação com a credencial atual e atualizações serializadas. Nome apenas conserva a versão; e-mail/senha invalidam todas as versões anteriores.
- [x] **P04 — Aplicar e conferir migração:** `V20261103__perfil_usuario.sql` aplicada localmente, com unicidade de e-mail, versão inicial zero e preservação dos usuários/credenciais existentes; startup PostgreSQL com `ddl-auto=validate` aprovado.
- [x] **P05 — Executar testes focados:** 12 testes H2 de perfil/JWT passaram; os testes confirmam identidade própria, validações, preservação do papel e revogação. Não representam a execução de toda a suíte histórica de DTOs.
- [x] **P06 — Validar integração:** lint/build frontend e verificações PostgreSQL de consulta/guards passaram; navegador com Next/Spring/H2 verificou Caixa em `360×844` e Nutricionista em `1440×900`, persistência do nome, erros inline e novo login com e-mail/senha alterados. Registro detalhado em T17 da integração.
