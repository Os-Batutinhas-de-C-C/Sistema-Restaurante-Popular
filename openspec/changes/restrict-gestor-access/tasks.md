# Tarefas — Acesso do Gestor

## 1. API e autorização

- [x] 1.1 Implementar a leitura de `GET /api/desperdicio/hoje` sobre a semana existente com relógio injetável de Fortaleza. Verificar em H2 o DTO com apenas dois campos, valores positivos e zero, semana e posição ausentes, fim de semana e virada do dia. Confirmar que a consulta não cria semana nem altera desperdício.
- [x] 1.2 Aplicar as regras por papel, rota e verbo em `SecurityConfig`. Atualizar `JwtSecurityIntegrationTests` para os novos bloqueios e verificar `403` para o Gestor em semanas, refeições, estoque, operações de notícias e mensagens administrativas, listagem/criação de usuários e incremento de fichas. Verificar `401` sem JWT e `403` de Nutricionista e Caixa no novo endpoint, a continuidade das operações públicas e de perfil próprio, e os acessos contratados de Nutricionista e Caixa. Em `FichasApiIntegrationTests`, usar Nutricionista no cenário de atualização semanal que verifica a proteção do contador.
- [x] 1.3 Atualizar a matriz e o DTO de leitura em `backend/specs/DTOs/requirements.md` e a descrição de acesso atual em `backend.md`. Conferir se os verbos, os status e os papéis documentados correspondem aos testes de autorização.

## 2. Painel, navegação e perfil

- [x] 2.1 Compor o Painel Gestor com `ResumoMetricas`, `useFichasDia` e o serviço de leitura de desperdício. Verificar pelo painel e no tráfego que as consultas operacionais se limitam a fichas e desperdício do dia, com carregamento, zero, ausência de registro, erro com nova tentativa e datas coerentes na virada do dia.
- [x] 2.2 Limitar o menu do Gestor a “Início” e “Sair” com acesso a “Meu Perfil” pelo cabeçalho. Ajustar os guards do Painel Nutricionista, da lista e edição de cardápio, Estoque, Notícias e Mensagens. Verificar URLs diretas com sessão Gestor e percorrer as mesmas rotas com os papéis autorizados.
- [x] 2.3 Atualizar a descrição vigente de permissões e de Meu Perfil em `frontend/specs/008-integracao-frontend-backend/` e as referências normativas às operações de cardápio, estoque, notícias e mensagens. Conferir a correspondência com os guards e com o menu do Gestor.

## 3. Verificação integrada

- [x] 3.1 Executar lint e build do frontend e verificar o painel em 360 px e desktop. Confirmar que ficha registrada pelo Caixa aparece na contagem do Gestor, que o desperdício registrado pela Nutricionista aparece em quilogramas e que as ferramentas administrativas respondem conforme o papel.
- [x] 3.2 Com uma conta Gestor descartável, percorrer painel, Meu Perfil e Início. Verificar nome e papel da própria conta, senha atual e validações, troca de e-mail e senha, revogação de JWTs anteriores e retorno ao painel após autenticar com as credenciais atualizadas. Usar `PerfilApiIntegrationTests` e validar o fluxo no navegador.

## Workflow follow-up

- Ao arquivar este delta, integrar primeiro a especificação de `add-painel-gestor` à spec principal `painel-gestor`.
