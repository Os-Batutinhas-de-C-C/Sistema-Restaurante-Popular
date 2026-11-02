# Design — DTOs nos contratos HTTP da API

## Visão geral

Separar os corpos HTTP das entidades JPA para os endpoints listados em `requirements.md`. Cada controller recebe request DTOs e retorna response DTOs; os services fazem o mapeamento entre DTOs e entidades e chamam os repositories. Não alterar arquivos de `frontend/`. As alterações de model enumeradas neste design foram autorizadas pelo solicitante.

## Organização

Criar `src/main/java/com/batutinhas/restaurante_pop/dto/` para tipos de request e response. Usar tipos distintos por operação quando a entrada e a saída diferirem, por exemplo `UsuarioCreateRequestDTO`, `UsuarioResponseDTO` e `MensagemUpdateRequestDTO`. DTOs não devem ficar aninhados nos controllers nem dentro de `model/`.

As classes/records DTO devem expor somente os campos permitidos pela tabela de `requirements.md`. Os campos JSON permanecem em camelCase. Datas e horários usam os formatos definidos nos requisitos. IDs gerados são somente de saída, exceto `idRefeicao` quando usado como referência para associar uma refeição existente a uma semana. Não serializar entidades JPA relacionadas.

## Fluxo de dados

1. O controller recebe DTO de request e parâmetros escalares de rota/consulta.
2. O controller encaminha a operação ao service correspondente.
3. O service valida as entradas conforme os requisitos definidos, converte request DTO em entidade, aplica a operação e persiste pelo repository.
4. O service converte a entidade persistida em response DTO.
5. O controller mantém o status HTTP atual da rota e retorna o DTO; endpoints sem corpo, como a exclusão de mensagem, continuam sem corpo.

Não mudar os caminhos, permissões ou filtros de `SecurityConfig`. Preservar as respostas `404` já existentes e o status atual de sucesso de cada endpoint.

## Serviços e controllers

Reutilizar `UsuarioService` e `SemanaService` onde cobrirem as operações necessárias. Criar services para `Refeicao`, `Noticia`, `Mensagem` e `Estoque` para manter persistência e mapeamento fora dos controllers. Injetar services e repositories pelo construtor; remover dependências diretas de repositories dos controllers quando o service assumir a operação.

Cobrir as rotas e DTOs da tabela de `requirements.md`. A entidade `Noticia` herda os campos de `Mensagem`; seus DTOs de request/response incluem os campos da notícia e `duracao`, sem retornar a entidade base. `POST /api/noticias` associa o usuário autenticado à notícia, resolvendo `Authentication.getName()` pelo repositório de usuários. `SemanaResponseDTO` contém lista de `RefeicaoResponseDTO`, sem referência circular à semana.

## Relacionamento entre semanas e refeições

Uma semana possui uma coleção de refeições e a mesma refeição pode ser associada a várias semanas ou a nenhuma. Modelar a coleção de `Semana` como muitos-para-muitos com tabela de junção `semana_refeicoes`; não manter `semanaId` como propriedade de `Refeicao`. A associação de uma semana recebe itens de cardápio: item com `idRefeicao` existente reutiliza a entidade; item sem ID cria refeição inline. Rejeitar item que combine ID e campos de criação.

## Segurança e erros

- Manter os acessos atuais definidos em `SecurityConfig`.
- Não retornar `CredencialAutenticacao`, hashes, salts, senhas, tokens ou tentativas de autenticação.
- Para erros, manter os status atuais; respostas de erro não podem conter entidades, dados sensíveis, stack traces ou detalhes internos.
- Corpos inválidos devem falhar com `400` sem persistência. Aplicar somente validações com obrigatoriedade e limites documentados.

## Estratégia de verificação

Usar testes de service para mapeamentos e persistência, além de testes de controller/integração para status, JSON, autorização e não exposição de campos sensíveis. Utilizar H2 conforme o setup de teste existente. Não alterar frontend para validar os contratos.

## Alterações autorizadas em models

As seguintes mudanças em `model/` foram autorizadas para habilitar o mapeamento e o relacionamento definido:

- `Usuario`: implementar `setNome`, `setEmailRecuperacao` e `setTipo` para atribuir os respectivos campos em vez de lançar `UnsupportedOperationException`.
- `Estoque`: adicionar setters para `nome`, `quantidade`, `unidade`, `lote`, `dataDeRecebimento`, `dataDeValidade` e `observacoes`. O ID continua gerado pelo banco.
- `Noticia`: adicionar `setDuracao(int)`.
- `Semana`: trocar `@OneToMany(mappedBy = "semana", cascade = CascadeType.ALL, orphanRemoval = true)` por `@ManyToMany` com join table `semana_refeicoes`, usando `PERSIST` e `MERGE` sem cascata de remoção nem `orphanRemoval`.

Preservar a ausência do campo `semana` em `Refeicao`; associação é mantida do lado de `Semana`. Não alterar outros models nem apagar mudanças locais fora desta lista.
