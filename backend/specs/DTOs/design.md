# Design — Contratos DTO e integração da API

## Escopo aprovado

O aditivo de integração aprovado estende a especificação DTO original para incluir os ajustes necessários no backend, no PostgreSQL e no frontend consumidor. As decisões e razões ficam registradas em `frontend/specs/008-integracao-frontend-backend/change-log.md`. As regras abaixo descrevem o contrato vigente e substituem as restrições históricas incompatíveis.

## Fluxo da API

Controllers recebem DTOs e parâmetros simples de rota, delegam aos services e devolvem DTOs/status HTTP. Services validam os dados necessários, convertem DTOs em entidades e persistem por repositories. Respostas não expõem entidades JPA, credenciais, hashes ou relações internas.

## Autenticação e autorização

- `POST /api/auth/login` recebe e-mail/senha e responde com JWT Bearer, duração de 3600 segundos e o perfil do usuário.
- Spring Resource Server valida tokens HS256 assinados com uma chave configurada por `JWT_SECRET_BASE64`, mantendo a validade de uma hora e sem criar sessão HTTP. Além de issuer/tempo/assinatura, `JwtTokenVersionValidator` compara `userId`, `tokenVersion` e subject com a conta/credencial atual no banco.
- `SecurityConfig` aplica a matriz de `requirements.md`, com respostas JSON para `401` e `403`. `GESTOR` tem as mesmas permissões de `NUTRICIONISTA`; `CAIXA` acessa mensagens.
- Contas iniciais são criadas somente no perfil `local`, quando e-mail e senha vêm de variáveis de ambiente.
- O proxy de mesma origem Next encaminha requisições. CORS não é alterado.

## Perfil próprio

`PerfilController` expõe `GET`/`PUT /api/usuarios/me` e `PUT /api/usuarios/me/senha`, sempre com a identidade do JWT. `PerfilService` faz validação e persistência transacional, bloqueia a conta durante atualizações e não recebe papel ou ID no DTO. A resposta reutiliza `UsuarioResponseDTO`; alterações de informação retornam também `requerNovoLogin`, e troca de senha retorna `204`.

Nome e e-mail aceitam até 255 caracteres Unicode e são normalizados apenas por trim. E-mail continua sendo o login, com unicidade sensível a maiúsculas/minúsculas. A troca de e-mail exige a senha atual; duplicatas retornam `409`, inclusive no cadastro administrativo. A nova senha exige senha atual/confirmação, pelo menos seis pontos de código Unicode e no máximo 72 bytes UTF-8; o hash continua BCrypt.

`CredencialAutenticacao.versaoToken` é persistido em `versao_token`, iniciado em zero. E-mail/senha alterados incrementam essa versão, invalidando imediatamente todos os JWTs anteriores. O decoder rejeita claims ausentes, não numéricos/inválidos, conta removida, credencial inexistente, versão antiga e e-mail do subject divergente. Nome apenas não muda a versão. Nenhum hash, salt ou credencial é colocado nos claims ou DTOs de perfil.

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

`backend/database/migrations/V20261103__perfil_usuario.sql` acrescenta `credenciais_autenticacao.versao_token BIGINT NOT NULL DEFAULT 0` e `uk_usuarios_email_recuperacao`. Interrompe a execução se encontrar e-mails exatamente duplicados; não importa nem reescreve contas legadas. No ambiente local, a migração já foi aplicada e a preservação dos usuários/credenciais existentes foi verificada. Antes de iniciar esse código em outro banco com `ddl-auto=validate`, aplique a migração; depois reinicie o backend e faça novo login, pois tokens emitidos sem `tokenVersion` são rejeitados.

## Verificação

O teste focado `JwtSecurityIntegrationTests` cobre login, JWT ausente/malformado/expirado e regras públicas/papel. Outros testes backend e frontend e a aplicação da migração num banco PostgreSQL não fazem parte dessa execução focada; seus estados são mantidos em `frontend/specs/008-integracao-frontend-backend/tasks.md`.

Na integração de perfil de 03/11/2026, os testes focados de perfil/JWT passaram (12 testes em H2), e lint/build frontend passaram. PostgreSQL iniciou com `ddl-auto=validate`; consultas próprias, gravação sem mudança de nome, senha atual incorreta e conflitos de e-mail foram verificados com Gestor/Caixa sem alterar os registros existentes. O navegador foi verificado por Next.js → Spring/H2 isolado: perfis de Caixa/Nutricionista, menus correspondentes, salvamento do nome, validação de e-mail/senha e novo login após alterações sensíveis. Os detalhes estão em T17 e no change log da integração.
