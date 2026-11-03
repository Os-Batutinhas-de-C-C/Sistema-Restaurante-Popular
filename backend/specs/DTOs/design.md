# Design — Contratos DTO e integração da API

## Escopo aprovado

O aditivo de integração aprovado estende a especificação DTO original para incluir os ajustes necessários no backend, no PostgreSQL e no frontend consumidor. As decisões e razões ficam registradas em `frontend/specs/008-integracao-frontend-backend/change-log.md`. As regras abaixo descrevem o contrato vigente e substituem as restrições históricas incompatíveis.

## Fluxo da API

Controllers recebem DTOs e parâmetros simples de rota, delegam aos services e devolvem DTOs/status HTTP. Services validam os dados necessários, convertem DTOs em entidades e persistem por repositories. Respostas não expõem entidades JPA, credenciais, hashes ou relações internas.

## Autenticação e autorização

- `POST /api/auth/login` recebe e-mail/senha e responde com JWT Bearer, duração de 3600 segundos e o perfil do usuário.
- Spring Resource Server valida tokens HS256 assinados com uma chave configurada por `JWT_SECRET_BASE64`; tokens e sessões são stateless.
- `SecurityConfig` aplica a matriz de `requirements.md`, com respostas JSON para `401` e `403`. `GESTOR` tem as mesmas permissões de `NUTRICIONISTA`; `CAIXA` acessa mensagens.
- Contas iniciais são criadas somente no perfil `local`, quando e-mail e senha vêm de variáveis de ambiente.
- O proxy de mesma origem Next encaminha requisições. CORS não é alterado.

## Semana, refeições e métricas

- `Semana.data` é uma segunda-feira e é única. A API devolve cinco slots de refeição na ordem segunda a sexta; slot vazio é `null`.
- `semana_cardapio_slots` persiste `posicao` de 0 a 4 e aceita uma refeição compartilhada por múltiplas semanas. Refeições também podem existir sem semana.
- `saladaDoDia` integra model, DTO, conversores e schema.
- As listas de desperdício e fichas têm coluna de posição persistente (`@OrderColumn`) para que operações diárias preservem os índices já armazenados.
- Linhas legadas de desperdício/fichas recebem índices na ordem física atual das linhas PostgreSQL. O solicitante aceitou que os dias históricos possam ficar incorretos porque as tabelas antigas não registravam dia/posição.
- A migração converte semanas antigas para segunda-feira e associa refeições legadas por `refeicao_id` crescente. Dados com datas ausentes, associações acima de cinco ou semanas que colidem na normalização bloqueiam a migração para tratamento explícito.
- `GET /api/cardapios/publicos` devolve datas e refeições sem métricas de vendas/desperdício.

## Notícias, mensagens e estoque

- Notícias podem ser criadas por qualquer usuário autenticado e removidas por `NUTRICIONISTA`/`GESTOR`.
- Mensagens administrativas mantêm as permissões DTO e podem ser removidas; `/api/mensagens/publicas` aceita assunto e texto anônimos, sem nome/contato, com data e hora atribuídas pelo servidor.
- Estoque recebe PUT/DELETE autenticados por `NUTRICIONISTA`/`GESTOR`. O status é calculado em `America/Fortaleza`: “Vencido” a partir do dia seguinte à validade, “Vence em breve” da data da validade até sete dias antes, e “No prazo” nos demais casos.

## Persistência e migração

`backend/database/migrations/V20261102__integracao_frontend_backend.sql` atualiza o schema PostgreSQL preservando a tabela legada de associações. A aplicação não executa a migração automaticamente; aplique-a explicitamente antes de usar o schema persistente existente. `backend.md` documenta os requisitos de ambiente e a migração.

## Verificação

O teste focado `JwtSecurityIntegrationTests` cobre login, JWT ausente/malformado/expirado e regras públicas/papel. Outros testes backend e frontend e a aplicação da migração num banco PostgreSQL não fazem parte dessa execução focada; seus estados são mantidos em `frontend/specs/008-integracao-frontend-backend/tasks.md`.
