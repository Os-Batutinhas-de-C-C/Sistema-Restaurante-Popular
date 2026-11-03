# Requisitos — DTOs nos contratos HTTP da API

## Aditivo de integração aprovado — 02/11/2026

Este aditivo atualiza as restrições anteriores de escopo, incluindo RN05/RN06: o solicitante autorizou alterações necessárias no frontend, backend e PostgreSQL para concluir a integração. Login usa e-mail/senha com JWT Bearer de uma hora, mantido em memória no frontend. As permissões originais desta spec são aplicadas; `GESTOR` recebe as mesmas permissões que `NUTRICIONISTA`. O menu público terá rota somente leitura separada que não retorna métricas administrativas. Mensagens públicas não coletam nome nem contato. Estoque deriva validade: “Vence em breve” nos sete dias anteriores e “Vencido” a partir do dia seguinte. O change log de `frontend/specs/008-integracao-frontend-backend` registra as decisões e razões.

## Objetivo

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

`CredencialAutenticacao` é um detalhe interno de autenticação e não deve ser exposto por nenhum DTO de resposta. O aditivo inclui `POST /api/auth/login`; rotas sem controller correspondente, como vendas, permanecem fora do escopo.

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
- **RN03 — Proteção de dados:** DTOs de resposta seguem lista explícita de campos permitidos. Nunca incluir senha em texto puro, hash, salt, token, tentativas de autenticação ou a entidade `CredencialAutenticacao`. O DTO de cadastro pode receber `senhaPura` para a operação de registro, mas nenhum DTO de resposta pode devolvê-la. `emailRecuperacao` permanece na resposta de usuário para preservar o contrato atual, conforme decisão do solicitante.
- **RN04 — Compatibilidade da API:** preservar caminhos, verbos, nomes JSON já consumidos, efeitos da operação, códigos de status e tratamento de recurso inexistente, exceto pelas mudanças explicitamente aprovadas no aditivo de integração. Aplicar as permissões definidas na tabela abaixo.
- **RN05 — Integração frontend:** mudanças frontend necessárias para consumir os contratos desta spec são permitidas pelo aditivo aprovado; preservar os fluxos e o visual existentes sempre que possível.
- **RN06 — Models e schema autorizados:** alterações necessárias nos models e no schema PostgreSQL para cumprir os contratos confirmados estão autorizadas. Registrar cada alteração e sua razão no change log da integração.
- **RN07 — Escopo de persistência:** DTOs não devem permitir que o cliente escolha ou altere identificadores gerados ou propriedades internas. `idRefeicao` pode ser enviado apenas como referência para associar uma refeição já existente a uma semana; não pode ser usado para criar ou alterar essa refeição.

## Contrato por endpoint

Os nomes abaixo identificam os tipos lógicos esperados; a implementação pode ajustar o nome Java mantendo a distinção entre request e response. Os acessos refletem o contrato aprovado no aditivo, não o comportamento histórico do `SecurityConfig`.

| Método e caminho | Request | Response de sucesso | Acesso contratado |
|---|---|---|---|
| `POST /api/auth/login` | `LoginDTO` (`email`, `senha`) | `200`, token Bearer/profile; `401` para credenciais inválidas | Público |
| `GET /api/usuarios` | Sem corpo | `200`, lista de `UsuarioResponseDTO` | Usuário autenticado |
| `POST /api/usuarios` | `UsuarioCreateRequestDTO` | `200`, `UsuarioResponseDTO` | Usuário autenticado |
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
| `SemanaCreateRequestDTO` | `data` (segunda-feira), `desperdicio`, `fichasVendidas`, `cardapio` com exatamente cinco posições; `null` indica dia vazio |
| `SemanaUpdateRequestDTO` | `desperdicio`, `fichasVendidas`, `cardapio` com cinco posições; a data da rota deve ser segunda-feira. |
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

Os campos de `UsuarioCreateRequestDTO` (`nome`, `emailRecuperacao`, `tipo`, `senhaPura`) são obrigatórios. Em `MensagemCreateRequestDTO`, `texto` é obrigatório e não vazio; `assunto`, `horario` e `data` podem ser nulos conforme o model atual. `MensagemPublicaCreateRequestDTO` exige `assunto` (até 100 caracteres) e `texto` (até 1000 caracteres); o servidor define data e horário. Os demais campos mantêm a nulabilidade dos models atuais, salvo as validações descritas aqui. Listas de cardápio ausentes ou nulas são convertidas em cinco posições nulas; desperdício e fichas ausentes ou nulos são tratados como vazios. Os valores das listas de desperdício e fichas mantêm sua posição. A unidade de `Noticia.duracao` é hora, com valor inteiro de 1 a 72.

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

**Dado que** qualquer endpoint de resposta retorna um DTO  
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

## Restrições de implementação

- As alterações de frontend, backend, schema e segurança explicitamente listadas no aditivo estão autorizadas; qualquer mudança fora desse escopo exige nova definição.
- Aplicar a matriz de acesso da tabela, JWT stateless com validade de uma hora, respostas JSON `401`/`403`, e seed de contas somente no perfil local com credenciais de ambiente.
- Não alterar CORS.
- Aplicar somente as validações explicitamente definidas nesta especificação ou existentes no domínio; não impor limites de 120/500 caracteres que aparecem como suposições na spec visual de notícias.
- Criar `design.md` e `tasks.md` da funcionalidade antes da implementação, seguindo o fluxo Spec-Driven Development do backend.

## Verificação

- Testar cada rota da tabela com os acessos autorizados e não autorizados, verificando método, status e formato JSON.
- Testar conversões request DTO → entidade e entidade → response DTO, incluindo listas vazias e associações por ID.
- Confirmar que os campos internos e sensíveis não aparecem nas respostas e que falhas não persistem alterações parciais.
- Revisar migração PostgreSQL e confirmar que os campos internos não aparecem em respostas.
