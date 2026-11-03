# Requisitos — DTOs nos contratos HTTP da API

## Aditivo de integração aprovado — 02/11/2026

Este aditivo atualiza as restrições anteriores de escopo, incluindo RN05/RN06: o solicitante autorizou alterações necessárias no frontend, backend e PostgreSQL para concluir a integração. Login usa e-mail/senha com JWT Bearer de uma hora, mantido em memória no frontend. As permissões originais desta spec são aplicadas; `GESTOR` recebe as mesmas permissões que `NUTRICIONISTA`. O menu público terá rota somente leitura separada que não retorna métricas administrativas. Mensagens públicas não coletam nome nem contato. Estoque deriva validade: “Vence em breve” nos sete dias anteriores e “Vencido” a partir do dia seguinte. O change log de `frontend/specs/008-integracao-frontend-backend` registra as decisões e razões.

## Objetivo

**Aditivo de fichas aprovado — 03/11/2026:** um contador de fichas entregues atende às três telas. Cada registro soma exatamente um, limitado a 300 por dia de segunda a sexta em `America/Fortaleza`, sem exigir refeição cadastrada. O total de hoje é público; somente Caixa pode incrementar. O solicitante autorizou testes focados de permissões e incrementos concorrentes.

**Aditivo de perfil aprovado — 03/11/2026:** conectar “Meu Perfil” à própria conta autenticada, com identidade obtida do `userId` do JWT e nível de acesso somente leitura. O solicitante aprovou os endpoints de consulta/atualização pessoal, exigência da senha atual para alterar e-mail ou senha, e-mail de login único, nova senha de pelo menos seis caracteres Unicode e no máximo 72 bytes UTF-8, e invalidação de todos os tokens anteriores após mudança de e-mail/senha por uma versão persistida nas credenciais. A comparação de e-mail permanece sensível a maiúsculas/minúsculas, conforme o contrato existente de login. Alteração somente de nome mantém token e expiração da sessão.

Definir DTOs de requisição e resposta para a API, separando os contratos HTTP das entidades JPA. O aditivo de integração aprovado amplia o escopo para incluir autenticação JWT, permissões, persistência semanal e operações consumidas pelo frontend.

Esta especificação trata do contrato do backend e do contrato necessário à integração frontend/backend.

## Escopo

Aplicar DTOs aos endpoints atualmente definidos em `controller/`:

- usuários (`Usuario`);
- semanas/cardápios (`Semana` e `Refeicao`);
- refeições (`Refeicao`);
- notícias (`Noticia`);
- mensagens (`Mensagem`);
- estoque (`Estoque`).

`CredencialAutenticacao` é um detalhe interno de autenticação e não deve ser exposto por nenhum DTO de resposta. Os aditivos incluem login e o contador de fichas; pagamentos, emissão de comprovantes e outros fluxos de vendas permanecem fora do escopo.

## Convenções dos DTOs

- Criar tipos distintos para entrada e saída, com nomes como `UsuarioCreateRequestDTO` e `UsuarioResponseDTO`. DTOs devem ficar em um pacote próprio (`dto/`), fora de `model/` e `controller/`.
- Corpos HTTP devem usar DTOs; parâmetros simples de rota e consulta, como `id`, `usuarioId` e `data`, podem continuar sendo tipos escalares.
- Nenhum método de controller deve aceitar ou retornar entidades JPA, nem converter entidades para DTOs. Controllers delegam aos services; services fazem o mapeamento nos dois sentidos e usam repositories para persistência.
- Respostas compostas devem usar outros DTOs ou IDs escalares, nunca entidades JPA aninhadas. Evitar ciclos como `Semana -> Refeicao -> Semana` e `Usuario -> Mensagem -> Usuario`.
- Manter nomes de propriedades JSON em camelCase e compatíveis com os getters atuais, salvo mudança de contrato explicitamente aprovada. Identificadores gerados pelo banco são somente de saída; não devem ser aceitos como entrada para criação.
- Serializar `LocalDate` como `yyyy-MM-dd` e `LocalTime` no formato ISO-8601 (`HH:mm:ss`). Listas sem itens devem ser representadas como arrays vazios.
- Para cada campo de entrada, a tabela de contrato deve indicar se é obrigatório, opcional ou anulável e quais validações se aplicam. Não inventar valores padrão ou regras de domínio que não estejam especificados.

## Regras de negócio

- **RN01 — Contratos separados:** os corpos de requisição e resposta de todos os endpoints neste escopo usam DTOs próprios. Parâmetros escalares de rota/consulta e respostas sem corpo, como `204 No Content`, não precisam ser DTOs.
- **RN02 — Mapeamento no service:** o service converte DTOs de entrada em entidades antes de salvar e converte entidades em DTOs de resposta antes de retornar dados ao controller. O controller não faz esse mapeamento.
- **RN03 — Proteção de dados:** DTOs de resposta seguem lista explícita de campos permitidos. DTOs de domínio/perfil nunca incluem senha em texto puro, hash, salt, token, versão de credenciais, tentativas de autenticação ou a entidade `CredencialAutenticacao`. A exceção explícita de token é o `accessToken` do contrato de login. O DTO de cadastro pode receber `senhaPura` para a operação de registro, mas nenhum DTO de resposta pode devolvê-la. `emailRecuperacao` permanece na resposta de usuário para preservar o contrato atual, conforme decisão do solicitante.
- **RN04 — Compatibilidade da API:** preservar caminhos, verbos, nomes JSON já consumidos, efeitos da operação, códigos de status e tratamento de recurso inexistente, exceto pelas mudanças explicitamente aprovadas no aditivo de integração. Aplicar as permissões definidas na tabela abaixo.
- **RN05 — Integração frontend:** mudanças frontend necessárias para consumir os contratos desta spec são permitidas pelo aditivo aprovado; preservar os fluxos e o visual existentes sempre que possível.
- **RN06 — Models e schema autorizados:** alterações necessárias nos models e no schema PostgreSQL para cumprir os contratos confirmados estão autorizadas. Registrar cada alteração e sua razão no change log da integração.
- **RN07 — Escopo de persistência:** DTOs não devem permitir que o cliente escolha ou altere identificadores gerados ou propriedades internas. `idRefeicao` pode ser enviado apenas como referência para associar uma refeição já existente a uma semana; não pode ser usado para criar ou alterar essa refeição.
- **RN08 — Perfil próprio:** as rotas `/api/usuarios/me` resolvem a identidade exclusivamente pelo JWT validado. Seus DTOs não recebem `idUsuario` nem `tipo`; o usuário não escolhe outra conta nem altera seu papel. Nome e e-mail são obrigatórios, recebem trim e aceitam até 255 caracteres Unicode; e-mail deve ter conteúdo antes/depois de `@` e não conter espaços. A alteração de e-mail exige senha atual válida e rejeita e-mail em uso com `409 EMAIL_IN_USE`. Cadastro de usuário duplicado também recebe `409`.
- **RN09 — Troca de senha:** a senha atual é conferida pelo `PasswordEncoder` existente. A nova senha deve ser não vazia, conter pelo menos seis pontos de código Unicode, ocupar no máximo 72 bytes UTF-8 e coincidir com a confirmação. Somente o novo hash BCrypt é persistido. Falhas de validação ou senha atual retornam `400` sem alterar a conta.
- **RN10 — Revogação e sessão:** `credenciais_autenticacao.versao_token` inicia em `0`. Os JWTs recebem o claim numérico `tokenVersion`; o decoder exige `userId` inteiro positivo, versão inteira não negativa, conta/credencial existentes, versão atual e subject igual ao e-mail atual. O service revalida a versão depois de bloquear a conta para atualização, evitando usar uma sessão revogada durante uma operação concorrente. Alterar e-mail/senha incrementa a versão, tornando todos os tokens anteriores inválidos (`401`), mesmo antes de completar uma hora. Tokens antigos sem versão também exigem novo login. Alteração apenas do nome não incrementa a versão.

- **RN11 — Fichas entregues:** o servidor define a data de hoje em `America/Fortaleza`; o cliente não escolhe dia, índice ou quantidade. GET sem registro retorna zero sem gravar. Fins de semana retornam zero e `permiteAdicionar=false`; POST é rejeitado com `409 FICHAS_CLOSED_DAY`. Em dia útil, a primeira entrega inicializa a semana sem refeições, se necessário; incrementos são serializados e não excedem 300 (`409 FICHAS_LIMIT_REACHED`). A virada do dia inicia outro índice/semana sem apagar o histórico. Todos os demais dias, refeições e desperdício são preservados. `fichasVendidas` continua na resposta semanal como nome legado do mesmo contador, mas o valor enviado nos DTOs semanais é ignorado, preservando compatibilidade sem permitir alterar contagens fora da operação exclusiva do Caixa.

## Contrato por endpoint

Os nomes abaixo identificam os tipos lógicos esperados; a implementação pode ajustar o nome Java mantendo a distinção entre request e response. Os acessos refletem o contrato aprovado no aditivo, não o comportamento histórico do `SecurityConfig`.

| Método e caminho | Request | Response de sucesso | Acesso contratado |
|---|---|---|---|
| `POST /api/auth/login` | `LoginDTO` (`email`, `senha`) | `200`, token Bearer/profile; `401` para credenciais inválidas | Público |
| `GET /api/fichas/hoje` | Sem corpo | `200`, `FichasDiaResponseDTO`; sem métricas semanais ou dados pessoais | Público |
| `POST /api/fichas/hoje/incrementos` | Sem corpo; data/quantidade definidas pelo servidor | `200`, `FichasDiaResponseDTO`; `409` limite/dia fechado | Papel `CAIXA` |
| `GET /api/usuarios` | Sem corpo | `200`, lista de `UsuarioResponseDTO` | Usuário autenticado |
| `POST /api/usuarios` | `UsuarioCreateRequestDTO` | `200`, `UsuarioResponseDTO`; `409` para e-mail em uso | Usuário autenticado |
| `GET /api/usuarios/me` | Sem corpo | `200`, `UsuarioResponseDTO` da própria conta | Usuário autenticado, identidade do JWT |
| `PUT /api/usuarios/me` | `PerfilUpdateRequestDTO` | `200`, `PerfilUpdateResponseDTO`; `400` inválido/senha atual; `409` e-mail em uso | Usuário autenticado, própria conta |
| `PUT /api/usuarios/me/senha` | `SenhaUpdateRequestDTO` | `204`, sem corpo; `400` inválido/senha atual | Usuário autenticado, própria conta |
| `GET /api/semanas` | Sem corpo | `200`, lista de `SemanaResponseDTO` | Papel `NUTRICIONISTA` ou `GESTOR` |
| `POST /api/semanas` | `SemanaCreateRequestDTO` | `200`, `SemanaResponseDTO` | Papel `NUTRICIONISTA` ou `GESTOR` |
| `PUT /api/semanas/{data}` | `data` como segunda-feira (`LocalDate`); corpo `SemanaUpdateRequestDTO` | `200`, `SemanaResponseDTO`; `404` se a semana não existir | Papel `NUTRICIONISTA` ou `GESTOR` |
| `GET /api/cardapios/publicos` | Sem corpo | `200`, lista de datas e refeições; sem métricas administrativas | Público |
| `GET /api/refeicoes` | Sem corpo | `200`, lista de `RefeicaoResponseDTO` | Papel `NUTRICIONISTA` ou `GESTOR` |
| `POST /api/refeicoes` | `RefeicaoCreateRequestDTO` | `200`, `RefeicaoResponseDTO` | Papel `NUTRICIONISTA` ou `GESTOR` |
| `GET /api/noticias` | Sem corpo | `200`, lista de `NoticiaResponseDTO` | Público |
| `POST /api/noticias` | `NoticiaCreateRequestDTO` | `200`, `NoticiaResponseDTO` | Usuário autenticado |
| `DELETE /api/noticias/{id}` | `id` como parâmetro de rota; sem corpo | `204`, sem corpo; `404` se não existir | Papel `NUTRICIONISTA` ou `GESTOR` |
| `GET /api/mensagens` | Sem corpo | `200`, lista de `MensagemResponseDTO` | Papel `NUTRICIONISTA`, `GESTOR` ou `CAIXA` |
| `GET /api/mensagens/{id}` | `id` como parâmetro de rota | `200`, `MensagemResponseDTO`; `404` se não existir | Papel `NUTRICIONISTA`, `GESTOR` ou `CAIXA` |
| `POST /api/mensagens/usuario/{usuarioId}` | `usuarioId` como parâmetro de rota; corpo `MensagemCreateRequestDTO` | `200`, `MensagemResponseDTO`; `404` se o usuário não existir | Papel `NUTRICIONISTA`, `GESTOR` ou `CAIXA` |
| `POST /api/mensagens/publicas` | `MensagemPublicaCreateRequestDTO` | `200`, `MensagemResponseDTO`; usuário nulo | Público |
| `PUT /api/mensagens/{id}` | `id` como parâmetro de rota; corpo `MensagemUpdateRequestDTO` | `200`, `MensagemResponseDTO`; `404` se não existir | Papel `NUTRICIONISTA`, `GESTOR` ou `CAIXA` |
| `DELETE /api/mensagens/{id}` | `id` como parâmetro de rota; sem corpo | `204`, sem corpo; `404` se não existir ou se for notícia | Papel `NUTRICIONISTA`, `GESTOR` ou `CAIXA` |
| `GET /api/estoque` | Sem corpo | `200`, lista de `EstoqueResponseDTO` com status calculado | Papel `NUTRICIONISTA` ou `GESTOR` |
| `POST /api/estoque` | `EstoqueCreateRequestDTO` | `200`, `EstoqueResponseDTO` | Papel `NUTRICIONISTA` ou `GESTOR` |
| `PUT /api/estoque/{idMaterial}` | `EstoqueUpdateRequestDTO` | `200`, `EstoqueResponseDTO`; `404` se não existir | Papel `NUTRICIONISTA` ou `GESTOR` |
| `DELETE /api/estoque/{idMaterial}` | Sem corpo | `204`, sem corpo; `404` se não existir | Papel `NUTRICIONISTA` ou `GESTOR` |

O relacionamento de cardápios é muitos-para-muitos: uma semana contém cinco posições de segunda a sexta; cada posição recebe uma refeição ou `null`, e a refeição pode estar associada a semanas diferentes ou a nenhuma. `Semana.data` deve ser a segunda-feira. O DTO de refeição não contém `semanaId`. Referências existentes usam somente `idRefeicao`; criação inline envia os campos da refeição sem ID. Dados legados sem posição são migrados em ordem crescente de `refeicao_id`, conforme decisão aprovada, mesmo que os dias resultantes possam estar incorretos. `POST /api/noticias` associa a notícia ao usuário autenticado; o cliente não escolhe o autor no corpo.

As linhas legadas de desperdício e fichas também não tinham dia/posição persistidos. A migração atribui posições pela ordem física atual das linhas PostgreSQL, decisão aprovada pelo solicitante; os dias históricos podem ficar incorretos.

`GET /api/cardapios/publicos` é uma rota somente leitura que retorna datas e refeições sem desperdício nem fichas vendidas. `/api/mensagens/publicas` aceita assunto e texto sem usuário, nome ou contato.

Uma requisição protegida sem autenticação deve receber `401`; usuário autenticado sem o papel exigido deve receber `403`. As exceções públicas são as rotas marcadas como públicas na tabela de endpoints.

## Campos dos DTOs

Os campos abaixo definem o contrato base a partir dos modelos e operações atuais. A coluna de obrigatoriedade deve ser completada conforme os requisitos de domínio antes de implementar validações semânticas.

| DTO lógico | Campos permitidos |
|---|---|
| `UsuarioCreateRequestDTO` | `nome`, `emailRecuperacao`, `tipo`, `senhaPura` |
| `UsuarioResponseDTO` | `idUsuario`, `nome`, `emailRecuperacao`, `tipo`. Nunca incluir credenciais ou mensagens aninhadas. |
| `PerfilUpdateRequestDTO` | `nome`, `emailRecuperacao`, `senhaAtual`. Nome/e-mail obrigatórios; senha atual obrigatória somente quando o e-mail mudar. Não recebe ID nem papel. |
| `PerfilUpdateResponseDTO` | `usuario` (`UsuarioResponseDTO`) e `requerNovoLogin` (`true` após alterar o e-mail; `false` quando o e-mail é mantido). |
| `SenhaUpdateRequestDTO` | `senhaAtual`, `novaSenha`, `confirmacaoSenha`, todos obrigatórios. Regras de RN09; nenhum campo é devolvido. |
| `FichasDiaResponseDTO` | `data`, `entregues`, `capacidade` (300), `restantes`, `permiteAdicionar` (dia útil e abaixo do limite). Este último indica disponibilidade operacional; a autorização para registrar continua exclusiva do Caixa. Não expõe outras métricas ou usuários. |
| `SemanaCreateRequestDTO` | `data` (segunda-feira), `desperdicio`, `cardapio` com exatamente cinco posições; `null` indica dia vazio. `fichasVendidas` legado é aceito e ignorado; novas contagens iniciam em zero. |
| `SemanaUpdateRequestDTO` | `desperdicio`, `cardapio` com cinco posições; a data da rota deve ser segunda-feira. `fichasVendidas` legado é aceito e ignorado, preservando as entregas persistidas. |
| `SemanaResponseDTO` | `idSemana`, `data`, `desperdicio`, `fichasVendidas`, `cardapio` com cinco posições de `RefeicaoResponseDTO` ou `null` |
| `RefeicaoCreateRequestDTO` | `proteina`, `guarnicao`, `acompanhamento1`, `acompanhamento2`, `suco`, `sobremesa`, `opcaoProteica`, `calorias`, `saladaDoDia`. Não recebe `semanaId`; a refeição pode permanecer sem associação. |
| `RefeicaoRequestDTO` | Para item de `cardapio`: `idRefeicao` para referência existente, ou os campos de refeição acima para criação inline. Não aceitar ambos no mesmo item. |
| `RefeicaoResponseDTO` | `idRefeicao`, `proteina`, `guarnicao`, `acompanhamento1`, `acompanhamento2`, `suco`, `sobremesa`, `opcaoProteica`, `calorias`, `saladaDoDia`. Não incluir `Semana` nem `semanaId`. |
| `MensagemPublicaCreateRequestDTO` | `assunto`, `texto`; o servidor define data/horário e não associa usuário, nome ou contato. |
| `MensagemCreateRequestDTO` | `assunto`, `texto`, `horario`, `data`. O autor é informado por `usuarioId` na rota, não por uma entidade `Usuario` no corpo. |
| `MensagemUpdateRequestDTO` | `texto`, `horario`, `data`, correspondentes aos campos atualizados atualmente pelo endpoint. |
| `MensagemResponseDTO` | `idMensagem`, `assunto`, `texto`, `horario`, `data`, `usuarioId` quando houver autor. Não incluir o objeto `Usuario`. |
| `NoticiaCreateRequestDTO` | `assunto`, `texto`, `horario`, `data`, `duracao` em horas. `assunto` e `texto` são obrigatórios, não vazios e limitados a 255 caracteres conforme as colunas JPA atuais. `duracao` é inteiro obrigatório entre 1 e 72. `horario` e `data` permanecem opcionais; o usuário autenticado é associado pelo backend. |
| `NoticiaResponseDTO` | `idMensagem`, `assunto`, `texto`, `horario`, `data`, `duracao` |
| `EstoqueCreateRequestDTO` | `nome`, `quantidade`, `unidade`, `lote`, `dataDeRecebimento`, `dataDeValidade`, `observacoes` |
| `EstoqueUpdateRequestDTO` | `nome`, `quantidade`, `unidade`, `lote`, `dataDeRecebimento`, `dataDeValidade`, `observacoes` |
| `EstoqueResponseDTO` | `idMaterial`, `nome`, `quantidade`, `unidade`, `lote`, `dataDeRecebimento`, `dataDeValidade`, `observacoes`, `status` calculado |

Campos de ID gerados (`idUsuario`, `idSemana`, `idRefeicao`, `idMensagem` e `idMaterial`) são somente de resposta, exceto `idRefeicao` usado como referência de associação em `RefeicaoRequestDTO`. O DTO de atualização de mensagem não deve passar a atualizar `assunto` implicitamente; isso exigiria mudança explícita do comportamento contratado.

Os campos de `UsuarioCreateRequestDTO` (`nome`, `emailRecuperacao`, `tipo`, `senhaPura`) são obrigatórios. Em `MensagemCreateRequestDTO`, `texto` é obrigatório e não vazio; `assunto`, `horario` e `data` podem ser nulos conforme o model atual. `MensagemPublicaCreateRequestDTO` exige `assunto` (até 100 caracteres) e `texto` (até 1000 caracteres); o servidor define data e horário. Os demais campos mantêm a nulabilidade dos models atuais, salvo as validações descritas aqui. Listas de cardápio ausentes ou nulas são convertidas em cinco posições nulas; desperdício ausente ou nulo é tratado como vazio. Fichas enviadas nos DTOs semanais são ignoradas, inclusive quando ausentes ou nulas; a atualização mantém os valores persistidos. As respostas de desperdício e fichas mantêm a posição de cada dia. A unidade de `Noticia.duracao` é hora, com valor inteiro de 1 a 72.

## Critérios de aceitação

### Cenário 1 — Resposta de coleção

**Dado que** um cliente realiza um `GET` permitido para um endpoint de coleção da tabela de contratos  
**Quando** o endpoint é chamado com a autenticação e o papel exigidos  
**Então** a resposta deve ter status `200` e corpo JSON com uma lista do DTO de resposta correspondente  
**E** uma coleção sem registros deve retornar uma lista vazia, não uma entidade JPA nem `null`.

### Cenário 2 — Criação ou atualização

**Dado que** o cliente envia o DTO de request válido para uma rota permitida  
**Quando** a operação termina com sucesso  
**Então** a resposta deve manter o status atual da rota e conter o DTO de resposta documentado  
**E** os dados devem ser convertidos no service antes da persistência  
**E** IDs gerados não devem definir identidade na criação; `idRefeicao` só pode referenciar uma refeição existente para vínculo a semana, e propriedades internas não devem ser aceitas como autoridade do cliente.

### Cenário 3 — Recurso ou usuário relacionado inexistente

**Dado que** a operação exige um recurso ou usuário que não existe  
**Quando** o endpoint de leitura, atualização, exclusão ou criação de mensagem é chamado  
**Então** deve retornar `404` nos casos documentados na tabela  
**E** não deve salvar dados parcialmente.

### Cenário 4 — Autenticação e autorização

**Dado que** o cliente não está autenticado ou não possui o papel exigido  
**Quando** chama um endpoint protegido  
**Então** deve receber `401` ou `403`, respectivamente  
**E** não deve receber uma resposta de sucesso com dados de recurso.

### Cenário 5 — Exclusão de mensagem

**Dado que** a mensagem existe e o cliente tem o papel exigido  
**Quando** chama `DELETE /api/mensagens/{id}`  
**Então** deve receber `204 No Content` sem corpo  
**E** uma mensagem inexistente deve continuar retornando `404`.

### Cenário 6 — Ausência de dados sensíveis

**Dado que** um endpoint de domínio/perfil retorna um DTO
**Quando** o JSON é serializado  
**Então** não deve conter senha em texto puro, hash, salt, token, tentativas de autenticação ou a entidade `CredencialAutenticacao`.

### Cenário 7 — Entrada inválida

**Dado que** um corpo JSON não pode ser desserializado para o DTO esperado ou viola uma validação definida para seus campos  
**Quando** o endpoint é chamado com acesso permitido  
**Então** deve retornar `400 Bad Request`  
**E** não deve persistir a operação inválida  
**E** a resposta de erro não deve expor entidade, credencial, stack trace ou detalhes internos.

### Cenário 8 — Escopo aprovado

**Dado que** esta especificação está sendo implementada  
**Quando** forem feitas alterações para atender aos critérios  
**Então** as mudanças limitam-se à integração aprovada no aditivo  
**E** cada mudança de model, schema, segurança ou frontend tem sua razão registrada no change log.

### Cenário 9 — Perfil e identidade

**Dado que** Nutricionista, Gestor ou Caixa está autenticado, **quando** consulta ou atualiza `/api/usuarios/me`, **então** apenas sua conta é consultada/alterada, independentemente de IDs ou papéis extras enviados pelo cliente. O DTO retorna somente os campos públicos de usuário e o nível de acesso permanece inalterado.

### Cenário 10 — Revogação após mudar dados de acesso

**Dado que** a senha atual foi validada e a nova entrada atende às regras, **quando** o usuário muda o e-mail de login ou a senha, **então** a alteração é persistida atomicamente e a versão das credenciais aumenta. Todos os JWTs de versões anteriores passam a receber `401`, e o novo login usa o e-mail/senha atualizados. Alterar somente o nome mantém a versão vigente.

### Cenário 11 — Perfil inválido ou conflitante

**Dado que** a senha atual está incorreta, a confirmação diverge, a nova senha viola RN09 ou o e-mail pertence a outra conta, **quando** a atualização é solicitada, **então** a API responde `400` ou `409`, conforme o contrato, sem alteração parcial da conta/credenciais.

### Cenário 12 — Fichas públicas e registro autorizado

**Dado que** um visitante consulta `/api/fichas/hoje`, **então** recebe somente os cinco campos do DTO diário, com zero quando ainda não há entrega e sem criar uma semana. **Quando** um cliente registra uma ficha, **então** apenas Caixa autenticado recebe sucesso; ausência/token inválido recebe `401` e Nutricionista/Gestor recebem `403`. As permissões de `/api/semanas` permanecem inalteradas.

### Cenário 13 — Dia, capacidade e ausência de cardápio

**Dado que** hoje é dia útil em Fortaleza e há menos de 300 fichas, **quando** Caixa registra uma entrega, **então** o total aumenta exatamente um no índice do dia, mesmo sem semana/refeição anterior. Data ou quantidade enviadas pelo cliente não controlam a operação. A ficha 300 é aceita; tentativas seguintes recebem `409 FICHAS_LIMIT_REACHED`. Sábado/domingo recebem `409 FICHAS_CLOSED_DAY`, sem gravação.

### Cenário 14 — Concorrência e edição semanal

**Dado que** vários Caixas registram simultaneamente, inclusive na primeira entrega da semana ou perto do limite, **então** existe uma única semana para a data e cada sucesso soma um, sem ultrapassar 300. **Quando** um formulário de cardápio envia `fichasVendidas` antigo ou arbitrário, **então** a contagem persistida é preservada; refeições, desperdício e os demais dias também são preservados pelo incremento.

### Cenário 15 — Virada do dia e histórico

**Dado que** há fichas registradas em um dia, **quando** passa meia-noite em `America/Fortaleza`, **então** a consulta passa ao novo dia com zero até a primeira entrega, preservando o índice anterior. A mudança de data UTC antes da meia-noite local não reinicia a contagem. Na semana seguinte, a nova contagem mantém integralmente a semana anterior.

## Restrições de implementação

- As alterações de frontend, backend, schema e segurança explicitamente listadas no aditivo estão autorizadas; qualquer mudança fora desse escopo exige nova definição.
- Aplicar a matriz de acesso da tabela, JWT de uma hora sem sessão HTTP e com versão validada contra o banco, respostas JSON `401`/`403`, e seed de contas somente no perfil local com credenciais de ambiente.
- Não alterar CORS.
- Aplicar somente as validações explicitamente definidas nesta especificação ou existentes no domínio; não impor limites de 120/500 caracteres que aparecem como suposições na spec visual de notícias.
- Criar `design.md` e `tasks.md` da funcionalidade antes da implementação, seguindo o fluxo Spec-Driven Development do backend.

## Verificação

- Testar cada rota da tabela com os acessos autorizados e não autorizados, verificando método, status e formato JSON.
- Testar conversões request DTO → entidade e entidade → response DTO, incluindo listas vazias e associações por ID.
- Confirmar que os campos internos e sensíveis não aparecem nas respostas e que falhas não persistem alterações parciais.
- Revisar migração PostgreSQL e confirmar que os campos internos não aparecem em respostas.
