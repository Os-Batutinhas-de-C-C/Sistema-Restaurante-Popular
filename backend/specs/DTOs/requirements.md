# Requisitos — DTOs nos contratos HTTP da API

## Objetivo

Definir DTOs de requisição e resposta para os endpoints existentes do backend, separando os contratos HTTP das entidades JPA. A implementação deve tornar os payloads explícitos, impedir a exposição de dados internos e preservar as regras de negócio, os caminhos, os códigos de status e as permissões existentes.

Esta especificação trata do contrato do backend. A integração real com o frontend será feita posteriormente.

## Escopo

Aplicar DTOs aos endpoints atualmente definidos em `controller/`:

- usuários (`Usuario`);
- semanas/cardápios (`Semana` e `Refeicao`);
- refeições (`Refeicao`);
- notícias (`Noticia`);
- mensagens (`Mensagem`);
- estoque (`Estoque`).

`CredencialAutenticacao` é um detalhe interno de autenticação e não deve ser exposto por nenhum DTO de resposta. Rotas sem controller correspondente no código atual, como vendas e autenticação, não fazem parte deste escopo até serem explicitamente incluídas.

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
- **RN04 — Compatibilidade da API:** preservar caminhos, verbos, nomes JSON já consumidos, efeitos da operação, códigos de status, tratamento de recurso inexistente e regras de autenticação/autorização existentes. Não remover campos do contrato atual como efeito implícito da criação de DTOs; alterações a esse comportamento precisam de requisito explícito próprio.
- **RN05 — Sem alterações no frontend:** não alterar nenhum arquivo ou pasta dentro de `frontend/`. Esta restrição permanece válida mesmo que a integração frontend/backend ainda não exista.
- **RN06 — Sem alterações nos models sem autorização:** evitar mudanças em `model/`. Se o mapeamento de DTO exigir alteração em um model, interromper essa parte e pedir autorização antes de editar qualquer model.
- **RN07 — Escopo de persistência:** DTOs não devem permitir que o cliente escolha ou altere identificadores gerados ou propriedades internas. `idRefeicao` pode ser enviado apenas como referência para associar uma refeição já existente a uma semana; não pode ser usado para criar ou alterar essa refeição.

## Contrato por endpoint

Os nomes abaixo identificam os tipos lógicos esperados; a implementação pode ajustar o nome Java mantendo a distinção entre request e response. Os códigos e permissões indicados refletem o comportamento atualmente implementado e devem ser preservados nesta alteração.

| Método e caminho | Request | Response de sucesso | Acesso atual |
|---|---|---|---|
| `GET /api/usuarios` | Sem corpo | `200`, lista de `UsuarioResponseDTO` | Usuário autenticado |
| `POST /api/usuarios` | `UsuarioCreateRequestDTO` | `200`, `UsuarioResponseDTO` | Usuário autenticado |
| `GET /api/semanas` | Sem corpo | `200`, lista de `SemanaResponseDTO` | Papel `NUTRICIONISTA` |
| `POST /api/semanas` | `SemanaCreateRequestDTO` | `200`, `SemanaResponseDTO` | Papel `NUTRICIONISTA` |
| `PUT /api/semanas/{data}` | `data` como `LocalDate`; corpo `SemanaUpdateRequestDTO` | `200`, `SemanaResponseDTO`; `404` se a semana não existir | Papel `NUTRICIONISTA` |
| `GET /api/refeicoes` | Sem corpo | `200`, lista de `RefeicaoResponseDTO` | Papel `NUTRICIONISTA` |
| `POST /api/refeicoes` | `RefeicaoCreateRequestDTO` | `200`, `RefeicaoResponseDTO` | Papel `NUTRICIONISTA` |
| `GET /api/noticias` | Sem corpo | `200`, lista de `NoticiaResponseDTO` | Público |
| `POST /api/noticias` | `NoticiaCreateRequestDTO` | `200`, `NoticiaResponseDTO` | Usuário autenticado |
| `GET /api/mensagens` | Sem corpo | `200`, lista de `MensagemResponseDTO` | Papel `NUTRICIONISTA` ou `CAIXA` |
| `GET /api/mensagens/{id}` | `id` como parâmetro de rota | `200`, `MensagemResponseDTO`; `404` se não existir | Papel `NUTRICIONISTA` ou `CAIXA` |
| `POST /api/mensagens/usuario/{usuarioId}` | `usuarioId` como parâmetro de rota; corpo `MensagemCreateRequestDTO` | `200`, `MensagemResponseDTO`; `404` se o usuário não existir | Papel `NUTRICIONISTA` ou `CAIXA` |
| `PUT /api/mensagens/{id}` | `id` como parâmetro de rota; corpo `MensagemUpdateRequestDTO` | `200`, `MensagemResponseDTO`; `404` se não existir | Papel `NUTRICIONISTA` ou `CAIXA` |
| `DELETE /api/mensagens/{id}` | `id` como parâmetro de rota; sem corpo | `204`, sem corpo; `404` se não existir | Papel `NUTRICIONISTA` ou `CAIXA` |
| `GET /api/estoque` | Sem corpo | `200`, lista de `EstoqueResponseDTO` | Papel `NUTRICIONISTA` |
| `POST /api/estoque` | `EstoqueCreateRequestDTO` | `200`, `EstoqueResponseDTO` | Papel `NUTRICIONISTA` |

O relacionamento de cardápios é muitos-para-muitos: uma semana contém zero ou mais refeições, uma refeição pode estar em zero ou mais semanas e uma refeição pode ser criada sem pertencer a uma semana. O DTO de refeição não contém `semanaId`. Para compartilhar uma refeição existente, o item correspondente de `cardapio` em uma requisição de semana usa somente `idRefeicao` como referência; para criar uma refeição inline, o item contém seus dados e não contém `idRefeicao`. `POST /api/noticias` associa a notícia ao usuário autenticado; o cliente não escolhe o autor no corpo.

Uma requisição sem autenticação deve continuar recebendo `401`; usuário autenticado sem o papel exigido deve continuar recebendo `403`. Não tornar endpoints públicos como parte da conversão para DTO.

## Campos dos DTOs

Os campos abaixo definem o contrato base a partir dos modelos e operações atuais. A coluna de obrigatoriedade deve ser completada conforme os requisitos de domínio antes de implementar validações semânticas.

| DTO lógico | Campos permitidos |
|---|---|
| `UsuarioCreateRequestDTO` | `nome`, `emailRecuperacao`, `tipo`, `senhaPura` |
| `UsuarioResponseDTO` | `idUsuario`, `nome`, `emailRecuperacao`, `tipo`. Nunca incluir credenciais ou mensagens aninhadas. |
| `SemanaCreateRequestDTO` | `data`, `desperdicio`, `fichasVendidas`, `cardapio` como lista de DTOs de refeição |
| `SemanaUpdateRequestDTO` | `desperdicio`, `fichasVendidas`, `cardapio`; a data vem do parâmetro de rota. Preservar os campos que a operação atual atualiza. |
| `SemanaResponseDTO` | `idSemana`, `data`, `desperdicio`, `fichasVendidas`, `cardapio` como lista de `RefeicaoResponseDTO` |
| `RefeicaoCreateRequestDTO` | `proteina`, `guarnicao`, `acompanhamento1`, `acompanhamento2`, `suco`, `sobremesa`, `opcaoProteica`, `calorias`. Não recebe `semanaId`; a refeição pode permanecer sem associação. |
| `RefeicaoRequestDTO` | Para um item de `cardapio` em request de semana: `idRefeicao` para referenciar uma refeição existente, ou os campos de refeição acima para criar uma refeição inline. Não aceitar ambos no mesmo item. |
| `RefeicaoResponseDTO` | `idRefeicao`, `proteina`, `guarnicao`, `acompanhamento1`, `acompanhamento2`, `suco`, `sobremesa`, `opcaoProteica`, `calorias`. Não incluir `Semana` nem `semanaId`. |
| `MensagemCreateRequestDTO` | `assunto`, `texto`, `horario`, `data`. O autor é informado por `usuarioId` na rota, não por uma entidade `Usuario` no corpo. |
| `MensagemUpdateRequestDTO` | `texto`, `horario`, `data`, correspondentes aos campos atualizados atualmente pelo endpoint. |
| `MensagemResponseDTO` | `idMensagem`, `assunto`, `texto`, `horario`, `data`, `usuarioId` quando houver autor. Não incluir o objeto `Usuario`. |
| `NoticiaCreateRequestDTO` | `assunto`, `texto`, `horario`, `data`, `duracao` em horas. `assunto` e `texto` são obrigatórios, não vazios e limitados a 255 caracteres conforme as colunas JPA atuais. `duracao` é inteiro obrigatório entre 1 e 72. `horario` e `data` permanecem opcionais; o usuário autenticado é associado pelo backend. |
| `NoticiaResponseDTO` | `idMensagem`, `assunto`, `texto`, `horario`, `data`, `duracao` |
| `EstoqueCreateRequestDTO` | `nome`, `quantidade`, `unidade`, `lote`, `dataDeRecebimento`, `dataDeValidade`, `observacoes` |
| `EstoqueResponseDTO` | `idMaterial`, `nome`, `quantidade`, `unidade`, `lote`, `dataDeRecebimento`, `dataDeValidade`, `observacoes` |

Campos de ID gerados (`idUsuario`, `idSemana`, `idRefeicao`, `idMensagem` e `idMaterial`) são somente de resposta, exceto `idRefeicao` usado como referência de associação em `RefeicaoRequestDTO`. O DTO de atualização de mensagem não deve passar a atualizar `assunto` implicitamente; isso exigiria mudança explícita do comportamento contratado.

Os campos de `UsuarioCreateRequestDTO` (`nome`, `emailRecuperacao`, `tipo`, `senhaPura`) são obrigatórios. Em `MensagemCreateRequestDTO`, `texto` é obrigatório e não vazio; `assunto`, `horario` e `data` podem ser nulos conforme o model atual. Os demais campos mantêm a nulabilidade dos models atuais; não adicionar validações de domínio além das especificadas aqui. Valores textuais não nulos devem respeitar o limite de 255 caracteres das colunas JPA atuais. Listas de cardápio, desperdício e fichas ausentes ou nulas são tratadas como vazias. A unidade de `Noticia.duracao` é hora, com valor inteiro de 1 a 72; não aplicar os limites de 120/500 caracteres que aparecem como suposições na spec visual de notícias.

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

### Cenário 8 — Restrição de escopo

**Dado que** esta especificação está sendo implementada  
**Quando** forem feitas alterações para atender aos critérios  
**Então** nenhum arquivo sob `frontend/` deve ser alterado  
**E** alterações em `model/` devem aguardar autorização explícita, caso se tornem necessárias.

## Restrições e decisões pendentes

- Não alterar arquivos ou pastas de `frontend/`.
- Não remover nem ignorar verificações, regras de negócio, códigos de status ou restrições de acesso já existentes nos controllers e em `SecurityConfig`.
- Não alterar models sem autorização explícita. Se um model atual não permitir o mapeamento necessário, registrar a limitação e pedir autorização antes de continuar com essa alteração.
- Aplicar somente as validações explicitamente definidas nesta especificação ou existentes no domínio; não impor limites de 120/500 caracteres que aparecem como suposições na spec visual de notícias.
- Criar `design.md` e `tasks.md` da funcionalidade antes da implementação, seguindo o fluxo Spec-Driven Development do backend.

## Verificação

- Testar cada rota da tabela com os acessos autorizados e não autorizados, verificando método, status e formato JSON.
- Testar conversões request DTO → entidade e entidade → response DTO, incluindo listas vazias e associações por ID.
- Confirmar que os campos internos e sensíveis não aparecem nas respostas e que falhas não persistem alterações parciais.
- Confirmar que `frontend/` e `model/` não foram alterados sem autorização explícita.
