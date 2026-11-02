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
