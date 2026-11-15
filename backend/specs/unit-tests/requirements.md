# Requisitos — Testes unitários do backend

## Aditivo de correções autorizado — 08/11/2026

Após a criação dos testes, o solicitante confirmou que notícias não podem ser atualizadas pelas rotas de mensagens (`404`), ingredientes definem refeições duplicadas independentemente das calorias, timestamps públicos devem ser consistentes e e-mails de bootstrap recebem trim antes da consulta. A solicitação atual autoriza corrigir esses quatro comportamentos no código de produção do backend, executar a suíte e verificar a aplicação em execução, sem alterar o frontend. Este aditivo substitui as restrições históricas de análise/documentação e de somente reportar falhas. O design e as tarefas registram a implementação e os resultados atuais; o diagnóstico original permanece abaixo como referência.

## Objetivo

Definir os testes unitários necessários para proteger as regras de negócio, validações, conversões de DTOs e decisões de segurança do backend do Sistema Restaurante Popular de Quixadá.

## Referências e fonte do contrato

- [Requisitos dos contratos DTO](../DTOs/requirements.md) e [design da integração](../DTOs/design.md): contratos vigentes, incluindo os aditivos de perfil e fichas de 03/11/2026.
- [Requisitos de integração frontend/backend](../../../frontend/specs/008-integracao-frontend-backend/requirements.md): comportamento das telas consumidoras e decisões que substituem suposições antigas de login, estoque e mensagens.
- [Requisitos das factories de teste](../factory/requisitos_factory_de_testes.md) e [design das factories](../factory/design_factory_de_testes.md): organização e isolamento dos dados de teste.
- [Código de produção](../../src/main/java/com/batutinhas/restaurante_pop/) e [testes existentes](../../src/test/java/com/batutinhas/restaurante_pop/): evidência da implementação e da cobertura descrita nesta avaliação.
- [pom.xml](../../pom.xml): Java 25, Spring Boot 4.1.1, Maven, `spring-boot-starter-test` e H2 para testes.

Os contratos aprovados prevalecem sobre exemplos de factories e suposições antigas das especificações visuais. Comportamentos observados sem regra explícita são identificados como tal; divergências não autorizam criar regras novas.

## Escopo

- Testar services isoladamente, com repositories e colaboradores externos simulados.
- Testar lógica própria de autenticação nos controllers, validação de claims JWT, emissão de tokens e validação da chave configurada.
- Testar métodos de domínio com comportamento: posições do cardápio, igualdade de refeições, associações de mensagens e versão das credenciais.
- Testar validações compartilhadas, mapeamento de respostas e tradução explícita de exceções.
- Priorizar caminhos de falha, limites e preservação de dados que os testes HTTP existentes não isolam.

Persistência JPA, SQL, migrações, concorrência real, transações, filtros Spring Security, contratos JSON e navegação frontend permanecem responsabilidades de testes de integração ou de interface. A presente entrega contém somente este arquivo de requisitos.

## Diagnóstico da cobertura atual

Foram identificadas cinco classes com 29 métodos anotados com `@Test`. Todas usam `@SpringBootTest`; quatro iniciam o servidor em porta aleatória. Não foram encontrados testes unitários isolados. A contagem é estática e não informa se os testes passam.

| Classe existente | Métodos `@Test` | Cobertura observada na leitura | Lacuna para testes unitários |
|---|---|---|---|
| `RestaurantePopApplicationTests` | 1 | Carregamento do contexto Spring. | Não verifica regras de negócio. |
| `DtoApiIntegrationTests` | 6 | DTOs, criação/listagem de usuários, semanas com cinco posições, refeições compartilhadas, notícias, operações básicas de mensagens/estoque e alguns erros/permissões. | Não percorre sistematicamente limites de campos, alternativas de mapeamento e falhas dos colaboradores. |
| `JwtSecurityIntegrationTests` | 3 | Login, duração do token, credenciais inválidas, tokens ausentes/malformados/expirados e acessos públicos/por papel. | Claims numéricos inválidos, falha de consulta da conta, conteúdo enviado ao encoder e saídas antecipadas do login. |
| `PerfilApiIntegrationTests` | 9 | Identidade própria, preservação de papel, mudanças de nome/e-mail/senha, conflitos, revogação, Unicode e limite de 72 bytes. | Revalidação de versão no service, combinações de entradas inválidas e falhas de persistência simuladas. |
| `FichasApiIntegrationTests` | 10 | Leitura pública, permissões, primeira semana, preservação de dados, fins de semana, capacidade, concorrência e virada de dia/semana em Fortaleza. | Todas as alternativas de repetição após criação, dados legados incompletos/inválidos e erros dos colaboradores. |

Já existem `UsuarioFactory`, `CredencialFactory`, `SemanaFactory`, `RefeicaoFactory`, `NoticiaFactory`, `MensagemFactory` e `EstoqueFactory` em `src/test/java/com/batutinhas/restaurante_pop/factory/`. Elas devem ser reaproveitadas conforme o cenário; sua existência não comprova cobertura das regras.

## Convenções dos testes

- Organizar futuras classes em `src/test/java/com/batutinhas/restaurante_pop/`, espelhando os pacotes `service`, `config`, `controller`, `model` e `dto`; usar nomes como `PerfilServiceTest` e métodos que descrevam comportamento e condição.
- Usar JUnit Jupiter, asserções e Mockito disponibilizados pela infraestrutura de teste existente. Não adicionar dependências sem necessidade definida.
- Instanciar a unidade sob teste diretamente e simular somente colaboradores. Testes unitários não iniciam Spring, servidor HTTP, H2 ou PostgreSQL, nem acessam rede ou arquivos externos.
- Usar entidades e DTOs reais como dados de entrada/saída. Reaproveitar factories com novas instâncias e valores fictícios previsíveis; variar um campo por cenário inválido.
- Separar preparação, execução e asserções; parametrizar limites e tabelas de papéis sem ocultar o motivo de cada caso.
- Verificar resultado, campos relevantes e ausência de gravação nos caminhos rejeitados. Conferir ordem/quantidade de chamadas quando isso protege segurança ou repetição de incrementos, sem reproduzir cada detalhe interno.
- Exercitar métodos privados pela API pública da classe. `RequestValidation` e auxiliares com visibilidade de pacote podem ser testados no mesmo pacote.
- Não usar pausas, ordem de execução, data real fixa como pressuposto ou estado global mutável. O controle de tempo deve ter escopo restrito ao teste e ser restaurado ao final.

## Regras de negócio dos testes

- **RN01 — Rastreabilidade:** cada grupo de testes deve indicar o requisito RF deste documento e o contrato de origem quando houver. Estes identificadores RF são locais à especificação de testes.
- **RN02 — Isolamento:** simular repositories comprova decisões e interações, não SQL, bloqueio, cascata, dirty checking, commit ou rollback.
- **RN03 — Segurança:** nenhuma falha de autenticação pode emitir token; nenhuma resposta de domínio/perfil pode expor senha, hash, salt ou credencial. O token é permitido somente no contrato de login.
- **RN04 — Limites:** testar os valores válidos nos limites e os imediatamente externos, além de `null`, vazio e branco quando pertinentes. Distinguir pontos de código Unicode, unidades UTF-16 e bytes UTF-8.
- **RN05 — Falhas:** entrada inválida ou recurso ausente não deve provocar gravação indevida. Uma exceção simulada ao salvar não comprova restauração de uma entidade já alterada em memória nem rollback no banco.
- **RN06 — Datas e histórico:** fichas e validade usam `America/Fortaleza`; posições de segunda a sexta não podem ser deslocadas, e operações diárias preservam os demais dias.
- **RN07 — Contrato vigente:** não acrescentar exigência de proteína, quantidade positiva, cronologia do estoque, política de cadastro igual à troca de senha, bloqueio por tentativas ou expiração de notícias sem regra aprovada.
- **RN08 — Complementaridade:** manter a cobertura de integração existente; um teste unitário de retorno/status ou de claims não substitui autorização HTTP, serialização ou validação criptográfica pelo decoder.

## Requisitos funcionais

Prioridades: **P0** para autenticação, revogação e integridade do contador diário; **P1** para regras e validações dos demais fluxos; **P2** para comportamentos auxiliares de menor risco. Implementar P0 antes dos demais grupos.

Os caminhos das unidades abaixo são relativos a `backend/src/main/java/com/batutinhas/restaurante_pop/`.

### RF001 — Perfil próprio e troca de senha (P0)

Unidade: `service/PerfilService.java`, métodos `consultar`, `atualizar` e `alterarSenha`.

- Consulta existente retorna somente os campos de `UsuarioResponseDTO`; conta ausente gera `404 PROFILE_NOT_FOUND`.
- Perfil rejeita request nulo, nome/e-mail nulos ou brancos e e-mail sem parte local/domínio, com espaços ou múltiplos `@`. Faz trim; aceita 255 pontos de código Unicode e rejeita 256 em nome/e-mail, incluindo caracteres suplementares.
- Alteração apenas do nome, ou e-mail igual após trim, mantém ID, papel, hash e versão; retorna `requerNovoLogin=false` e não exige senha atual nem consulta de conflito de e-mail.
- Alteração de e-mail mantém comparação sensível a maiúsculas/minúsculas, exige senha atual e rejeita senha nula/branca, incorreta ou acima de 72 bytes UTF-8 com `400 CURRENT_PASSWORD_INVALID`.
- E-mail de outra conta produz `409 EMAIL_IN_USE`; referência à própria conta não é tratada como conflito. Mudança válida incrementa a versão uma vez, retorna `requerNovoLogin=true` e preserva o papel e o hash.
- Após `findForProfileUpdate`, credencial ausente ou versão diferente da sessão produz `401 UNAUTHORIZED`, sem codificação de senha nem gravação. Conta ausente produz `404`.
- Troca de senha rejeita request nulo, senha nova nula/branca, cinco pontos de código, mais de 72 bytes UTF-8 e confirmação nula/diferente. Aceita seis pontos de código e exatamente 72 bytes, incluindo entradas multibyte e suplementares.
- Troca válida confere a senha atual, codifica exatamente a nova senha, persiste somente o hash retornado pelo encoder, incrementa a versão uma vez e preserva nome/e-mail/papel.
- Falhas anteriores à gravação preservam os campos da conta/credencial. `DataIntegrityViolationException` em `atualizar` é traduzida para `EMAIL_IN_USE`; a atomicidade persistida continua exigindo teste de integração.

Origem: RN08–RN10 e cenários 9–11 dos requisitos DTO.

### RF002 — Login, emissão e validação de JWT (P0)

Unidades: `controller/AuthController.java`, `service/JwtTokenService.java` e `config/JwtTokenVersionValidator.java`.

- `AuthController.realizarLogin`: sucesso consulta o e-mail com trim, confere o hash com `PasswordEncoder` e emite um token. Request/e-mail/senha nulos, conta ausente, credencial ausente ou senha incorreta retornam `401 AUTHENTICATION_FAILED`, com a mesma mensagem genérica e sem emissão de token. Entradas nulas não consultam o repository; conta/credencial ausentes não chamam `matches`.
- `JwtTokenService.issue`: capturar os parâmetros enviados ao `JwtEncoder`; verificar HS256, issuer configurado, subject com e-mail, `userId`/`tokenVersion` numéricos, nome e papel. `exp - iat` deve ser exatamente 3.600 segundos, sem comparar com um instante real exato.
- A resposta de emissão usa o token devolvido pelo encoder, tipo `Bearer`, `expiresIn=3600` e perfil público correto. Claims e perfil não incluem senha, hash, salt ou entidade de credencial.
- `JwtTokenVersionValidator.validate`: aceitar números com valor inteiro exato, `userId >= 1` e `tokenVersion >= 0`, correspondentes à conta atual e ao subject exato.
- Parametrizar claims ausentes/nulos, strings numéricas, booleanos, números fracionários, negativos, ID zero, valores fora de `long` e números não finitos; subject ausente, branco ou de outro tipo. Claims estruturalmente inválidos retornam `invalid_token` antes de consultar o repository.
- Conta/credencial ausente, versão divergente, subject diferente do e-mail atual ou `DataAccessException` retornam `invalid_token`, sem revelar detalhes do banco.

A lógica do login atual está em `AuthController`; testar apenas `AutenticacaoService` não cobre esse fluxo. Origem: contrato de login e RN03/RN10 dos requisitos DTO.

### RF003 — Coordenação diária de fichas (P0)

Unidade: `service/FichasService.java`, métodos `consultarHoje` e `incrementarHoje`, com `Clock` controlado.

- Segunda a sexta usam a data local correta, independentemente da zona do relógio fornecido. Cobrir os instantes imediatamente antes e a partir de `03:00:00Z`, equivalentes à meia-noite em Fortaleza, incluindo sexta/sábado e domingo/segunda.
- Sábado/domingo: consulta retorna zero, capacidade/restantes 300 e `permiteAdicionar=false`; incremento lança `FICHAS_CLOSED_DAY`. Nenhum colaborador transacional é chamado.
- Semana existente retorna o primeiro incremento sem tentar criar semana.
- Semana ausente segue `incrementar → criarSemanaVazia(segunda-feira) → incrementar`, sem incremento adicional depois do sucesso.
- Colisão na criação por `DataIntegrityViolationException` repete o incremento. Se ainda não encontrar a semana, relança a exceção original.
- Criação sem colisão seguida de semana ainda ausente lança a `IllegalStateException` implementada. Outros erros dos colaboradores não provocam criação/repetição indevida.

Origem: RN11 e cenários 12–15 dos requisitos DTO; estratégia de criação descrita no design DTO.

### RF004 — Contagem, capacidade e preservação das fichas (P0)

Unidade: `service/FichasTransacaoService.java`, métodos `consultar`, `incrementar` e `criarSemanaVazia`.

- Simular `SemanaRepository` e `EntityManager`; injetar o campo `@PersistenceContext` somente no teste, com recurso como `ReflectionTestUtils`, sem alterar a classe de produção.
- Consulta sem semana, lista nula/curta ou elemento diário nulo retorna zero sem gravar. Parametrizar posições 0 a 4 com contagens distintas para detectar troca de dia.
- Incremento sem semana retorna `Optional.empty`. Lista nula/curta é completada com zeros até o dia; elemento diário nulo parte de zero.
- Cobrir contagens 0, 298 e 299: incremento soma exatamente um. A passagem 299→300 retorna zero restantes e desabilita novas entregas. Valor igual ou superior a 300 gera `FICHAS_LIMIT_REACHED` sem mudar a contagem.
- Contagem negativa gera `FICHAS_INVALID_DATA` na leitura e no incremento. Leitura de valor legado acima de 300 preserva o total e retorna restantes zero, conforme o comportamento defensivo atual.
- Preservar contagens dos outros dias, desperdício e refeições. Verificar limpeza do contexto antes da consulta e uso de `findByDataForUpdate` no incremento, sem alegar comprovação de bloqueio real.
- Criação inicial salva com flush a segunda-feira calculada, cinco posições de refeição vazias e nenhuma entrega pré-carregada.
- Respostas contêm data, entregues, capacidade, restantes não negativos e disponibilidade operacional; não contêm métricas semanais nem dados pessoais. Disponibilidade não representa autorização do papel.

Origem: RN11 dos requisitos DTO e tratamento de dados legados do design DTO.

### RF005 — Semanas e cardápios (P1)

Unidade: `service/SemanaService.java`, métodos `create`, `update`, `findAll` e `findAllPublic`.

- Data nula ou diferente de segunda-feira é rejeitada antes de persistir. Criação em data existente é rejeitada; atualização de segunda-feira ausente retorna `Optional.empty` sem salvar.
- Cardápio nulo vira cinco posições nulas; lista não nula deve ter exatamente cinco posições, preservando lacunas e ordem. Desperdício nulo vira lista vazia.
- Criação ignora `fichasVendidas` recebido; atualização preserva integralmente as contagens existentes mesmo com entrada ausente/nula, vazia, antiga ou forjada. Usa a consulta de atualização com bloqueio.
- Referência de refeição por ID existente reutiliza a entidade; ID inexistente gera `EntityNotFoundException`. ID combinado com qualquer campo de criação é rejeitado, incluindo string vazia, calorias zero e `saladaDoDia`.
- Criação inline mapeia todos os campos; texto opcional nulo é aceito, limites 255/256 são exercitados e calorias nulas viram zero. Nenhuma refeição existente é editada pelo payload de associação.
- Refeições consideradas iguais pela implementação não podem ocupar duas posições da mesma semana. Compartilhamento entre semanas não deve ser rejeitado pelo service; a persistência desse vínculo é verificada por integração.
- Listagem usa `findAllByOrderByDataAsc`, preserva a sequência retornada e mapeia todas as posições. Listas vazias permanecem vazias; cópias de desperdício/fichas não expõem as listas mutáveis da entidade.
- Listagem pública retorna apenas data/refeições, sem desperdício e fichas. Casos inválidos não chamam `save`; rollback de entidade gerenciada não pode ser inferido do mock.

Origem: contrato semanal, RN07/RN11 e campos dos DTOs. A definição de igualdade/duplicidade requer a ressalva registrada em pendências.

### RF006 — Refeições e métodos de domínio (P1)

Unidades: `service/RefeicaoService.java`, `model/Semana.java`, `model/Refeicao.java` e `dto/RefeicaoRequestDTO.java`.

- `RefeicaoService`: listagem vazia/preenchida; criação e resposta com todos os campos, inclusive salada; calorias nulas viram zero e valor explícito é preservado; textos opcionais nulos e limite 255 aceitos, 256 rejeitado sem salvar. A resposta não contém semana ou `semanaId`.
- `Semana.getCardapio/setCardapio`: cinco posições, lacunas preservadas, entrada nula, tamanho inválido, substituição de slots existentes sem crescimento indevido, vínculo slot/semana e remoção/ignorância de posições fora de 0–4.
- `Semana.addRefeicao`: ocupar primeira posição livre; rejeitar refeição nula, duplicada e semana cheia. `removeRefeicao` limpa a posição encontrada sem deslocar os demais dias; refeição ausente não altera o cardápio.
- `Refeicao.equals/hashCode`: objetos com os mesmos ingredientes são iguais e têm hash igual, mesmo com calorias ou IDs diferentes. Variar cada ingrediente, incluindo salada, altera a igualdade; cobrir comparação com a própria instância, `null` e outro tipo. Não exigir hashes diferentes para objetos diferentes.
- `RefeicaoRequestDTO.hasMealFields`: todos os campos de criação nulos resultam em `false`; cada campo isoladamente não nulo resulta em `true`, inclusive vazio e zero.

Esses testes protegem comportamento usado pela montagem do cardápio; getters, setters e records sem lógica não exigem testes próprios.

### RF007 — Cadastro de usuários e papéis (P1)

Unidades: `service/UsuarioService.java` e `service/UsuarioPapel.java`.

- `registrarUsuario`: request/tipo nulos e nome/e-mail/senha nulos ou brancos são rejeitados. Exercitar 255/256 unidades UTF-16 em nome/e-mail e trim do e-mail antes da busca e gravação.
- Cadastro válido codifica a senha, associa os dois lados usuário/credencial, inicializa tentativas/versão em zero e mapeia o usuário salvo para DTO. Somente o hash é persistido.
- Duplicata encontrada antes de salvar produz `409 EMAIL_IN_USE`, sem codificar senha; `DataIntegrityViolationException` no flush também produz esse erro, sem pressupor rollback pelo mock.
- `listarUsuarios`: lista vazia/preenchida e mapeamento sem credenciais ou mensagens aninhadas.
- `UsuarioPapel.role/label`: parametrizar `N`, `C`, `G`, equivalentes minúsculos e valor desconhecido, conferindo nomes/labels e o fallback `USUARIO_COMUM`/`Usuário`.

Cadastro e troca de senha têm políticas implementadas diferentes: não aplicar automaticamente o mínimo de seis pontos de código da troca ao cadastro. Origem: campos de usuário, RN03/RN08 e permissões dos requisitos DTO.

### RF008 — Notícias (P1)

Unidade: `service/NoticiaService.java`.

- Assunto/texto obrigatórios: rejeitar nulo/vazio/branco e 256 unidades UTF-16; aceitar 255. Duração obrigatória: rejeitar nulo, negativo, zero e 73; aceitar 1 e 72 horas.
- Entrada inválida não consulta o autor nem salva notícia. Autor é resolvido pelo e-mail autenticado recebido do controller; autor inexistente gera `EntityNotFoundException`, sem salvar.
- Criação preserva data/horário opcionais, associa o autor correto e mapeia todos os campos de resposta. Listagem cobre coleção vazia/preenchida.
- Exclusão existente chama `deleteById` e retorna `true`; inexistente retorna `false` sem excluir.

Origem: contrato de notícias e limites aprovados dos requisitos DTO. Filtragem por expiração e limites visuais antigos de 120/500 caracteres não integram estes requisitos.

### RF009 — Mensagens administrativas e públicas (P1)

Unidade: `service/MensagemService.java`.

- Listagem/consulta distinguem `Mensagem` de `Noticia`; coleção mista exclui notícias, coleção vazia retorna vazia e ID de notícia/ausente retorna `Optional.empty`.
- Criação administrativa associa o usuário indicado e os dois lados da relação; usuário inexistente retorna vazio sem salvar. Assunto opcional aceita nulo/255 e rejeita 256; texto obrigatório aceita 1000 e rejeita nulo/branco/1001. Data/horário opcionais são preservados.
- Criação pública exige assunto não branco de até 100 e texto não branco de até 1000; cobrir limites 100/101 e 1000/1001. Define data/hora do servidor em Fortaleza, sem nanos, mantém usuário nulo e não consulta usuários.
- Atualização de mensagem comum muda somente texto/data/horário; mantém assunto e autor. Texto segue validação obrigatória; ID ausente não salva.
- Exclusão remove exatamente a mensagem comum; ID ausente ou de notícia retorna `false` sem excluir. Resposta de mensagem identifica autor somente por ID, ou `null` para mensagem anônima.
- Atualização de notícia pela rota de mensagens deve retornar vazio no service e `404` no controller, antes da validação do texto e sem modificar ou salvar a notícia, conforme decisão do solicitante.

Origem: contratos de mensagens, RN03 e cenário 5 dos requisitos DTO. A filtragem por classe exata e os horários exigem as ressalvas registradas abaixo.

### RF010 — Estoque e status de validade (P1)

Unidade: `service/EstoqueService.java`, exercitando o cálculo pelos métodos públicos de criação, atualização ou listagem do service.

| Validade em relação ao dia de Fortaleza | Status esperado |
|---|---|
| Nula | `No prazo`, conforme implementação atual |
| Ontem | `Vencido` |
| Hoje | `Vence em breve` |
| Hoje + 7 dias | `Vence em breve` |
| Hoje + 8 dias | `No prazo` |

- Mapear todos os campos em criação/atualização/resposta; quantidade nula vira zero, quantidade fracionária é preservada e campos opcionais mantêm nulabilidade.
- Nome, unidade, lote e observações aceitam 255 unidades UTF-16 e rejeitam 256 sem salvar. Não pressupor que nome vazio seja inválido.
- Atualização existente salva os novos valores e recalcula status; ID ausente retorna `Optional.empty` sem salvar. Exclusão existente/inexistente retorna `true/false`, excluindo somente quando existe. Listagem vazia retorna vazia.
- Fronteiras de data e virada em Fortaleza precisam de tempo controlado; não depender do dia real de execução.

Origem: aditivo de integração e contratos de estoque dos requisitos DTO.

### RF011 — Validações, erros e chave JWT (P1)

Unidades: `service/RequestValidation.java`, `config/ApiExceptionHandler.java` e `config/JwtConfig.java`.

- `requiredText`: rejeita nulo/vazio/branco; aceita conteúdo não branco no limite. `text`: aceita nulo, vazio e comprimento máximo, rejeita máximo + 1. Ambos preservam o conteúdo aceito, sem trim implícito; o comprimento genérico usa `String.length()`.
- `handleFichas`: `409` com código/mensagem da exceção de domínio. `handlePerfil`: status/código/mensagem definidos por `PerfilException`.
- `handleInvalidRequest`: tanto `IllegalArgumentException` quanto `IllegalStateException` resultam em `400 BAD_REQUEST` com mensagem genérica; `handleNotFound` resulta em `404 NOT_FOUND` genérico. Detalhes internos da exceção não aparecem nessas respostas.
- `jwtSecretKey`: Base64 inválido e chaves decodificadas de 0/31 bytes são rejeitados; 32 bytes e tamanhos maiores são aceitos com algoritmo `HmacSHA256`. Usar somente chaves fictícias de teste.

Invocar handlers/configuração diretamente comprova esses retornos, não a seleção automática pelo Spring, o JSON ou a rejeição de tokens pela cadeia HTTP.

### RF012 — Comportamentos auxiliares e controllers (P2)

- `AutenticacaoService.loadUserByUsername`: conta existente retorna e-mail/hash e exatamente a autoridade `ROLE_*` correspondente; conta ausente lança `UsernameNotFoundException`. Esse service não executa o login JWT atual.
- `DataInitializer.run`: e-mail/senha ambos ausentes/brancos ignoram a conta; apenas um configurado gera erro; conta existente não é salva nem codificada; contas novas N/C/G usam os papéis, nomes, hash e associação de credenciais esperados. A ativação exclusiva no perfil `local` depende de integração.
- `Usuario.addMensagem/removeMensagem`: coleção e referência inversa são estabelecidas/removidas para os casos válidos.
- `CredencialAutenticacao.incrementarVersaoToken`: versão inicial zero, incremento normal e estouro em `Long.MAX_VALUE` sem retorno a valor negativo, conforme `Math.incrementExact`.
- `PerfilController`: extrair identidade/versão do JWT e delegar somente esses valores; claims exigidos pela operação, quando ausentes/inválidos/nulos, não chamam o service e geram `401`; troca de senha bem-sucedida retorna `204`. Esses casos podem ser invocados diretamente com JWTs de teste; a consulta lê `userId`, enquanto as atualizações também leem `tokenVersion`.
- Nos controllers que traduzem `Optional`/booleano, considerar testes diretos de `200/404` e `204/404` quando houver risco de regressão. Evitar repetir toda a integração para métodos que apenas encaminham chamadas.

## Critérios de aceitação

### Cenário 1 — Teste unitário isolado

**Dado que** um caso RF001–RF012 está implementado como teste unitário  
**Quando** ele é executado  
**Então** valida uma decisão observável da unidade sem iniciar Spring, banco ou servidor  
**E** usa dados novos e colaboradores controlados.

### Cenário 2 — Login ou token inválido

**Dado que** as credenciais falham ou os claims não identificam uma conta/versão válidas  
**Quando** o login ou o validador é chamado  
**Então** o login não emite token e o validador rejeita a autenticação, conforme RF002  
**E** claims estruturalmente inválidos não consultam o banco simulado.

### Cenário 3 — Perfil e sessão revogada

**Dado que** a versão da sessão diverge da credencial obtida para atualização  
**Quando** uma alteração de perfil/senha é solicitada  
**Então** RF001 rejeita com `401`, sem codificar senha ou salvar  
**E** os testes de sucesso distinguem nome apenas de mudança de e-mail/senha.

### Cenário 4 — Limites de texto e senha

**Dado que** os casos incluem o limite permitido e o imediatamente externo  
**Quando** as validações são exercitadas  
**Então** aceitam/rejeitam conforme RF001, RF007–RF011  
**E** distinguem seis pontos de código, 72 bytes UTF-8 e limites medidos em UTF-16.

### Cenário 5 — Criação concorrente simulada da semana

**Dado que** a primeira tentativa de incremento não encontra a semana e a criação sofre colisão  
**Quando** `incrementarHoje` executa a repetição prevista em RF003  
**Então** retorna o novo incremento ou relança a colisão se a semana continuar ausente  
**E** não soma uma ficha adicional após obter sucesso.

### Cenário 6 — Capacidade e histórico

**Dado que** o contador do dia é 299 e há valores em outros dias  
**Quando** RF004 incrementa a contagem  
**Então** retorna 300, restantes zero e disponibilidade falsa, preservando os demais dados  
**E** uma nova tentativa no limite é rejeitada sem mutação do contador.

### Cenário 7 — Cardápio e contagem protegida

**Dado que** uma atualização semanal contém cinco posições e fichas antigas ou forjadas  
**Quando** RF005 aplica a atualização  
**Então** preserva lacunas/refeições e as fichas já existentes  
**E** referência com campos inline, referência inexistente ou tamanho inválido não é salva.

### Cenário 8 — Estoque e mensagem anônima

**Dado que** o tempo está controlado em Fortaleza  
**Quando** RF009/RF010 criam uma mensagem pública ou calculam a validade  
**Então** a mensagem não recebe autor e o estoque respeita a fronteira inclusiva de sete dias  
**E** os resultados independem da data real da execução.

### Cenário 9 — Respostas e erros seguros

**Dado que** a unidade retorna um DTO ou traduz uma exceção  
**Quando** RF001–RF011 verificam os campos permitidos  
**Então** dados de domínio/perfil não incluem credenciais e os erros genéricos não expõem detalhes internos  
**E** a verificação de JSON efetivamente transmitido permanece na integração.

### Cenário 10 — Limites da evidência

**Dado que** os testes usam mocks de repositories/encoder  
**Quando** seus resultados são registrados  
**Então** não são apresentados como prova de rollback, bloqueio, assinatura JWT, unicidade no PostgreSQL ou permissões HTTP  
**E** os cenários pendentes de contrato permanecem identificados, sem novas regras implícitas.

## Pendências e limitações encontradas

- **PEND01 — Resolvida: atualização de notícia como mensagem.** O solicitante definiu `404`. `MensagemService.update` passou a filtrar notícias antes de validar ou modificar dados; testes unitários e HTTP confirmaram a rejeição e a preservação da notícia.
- **PEND02 — Resolvida: igualdade de refeição.** O solicitante definiu duplicidade pelos ingredientes. `Refeicao.equals/hashCode` passaram a excluir calorias, mantendo os mesmos campos de composição da constraint existente. Testes de domínio/service e HTTP confirmaram a rejeição na semana, incluindo rollback.
- **PEND03 — Tempo sem injeção:** as chamadas de tempo atuais são controladas por mocks estáticos com escopo fechado nos testes de estoque/mensagens; a emissão JWT verifica `exp - iat`. Não foi necessário introduzir dependências ou refatorar a injeção de relógios. Não usar pausas ou testes dependentes de meia-noite real.
- **PEND04 — Resolvida: timestamp público.** `createPublic` passou a capturar um único `LocalDateTime` em Fortaleza. A regressão com relógio atravessando a meia-noite passou sem combinar data e horário de instantes diferentes.
- **PEND05 — Validações e exemplos não equivalentes:** `EstoqueFactory.criarRequestSemNome` fornece nome vazio atualmente aceito; campos de refeição também são opcionais. `RequestValidation` conta UTF-16, perfil conta pontos de código e senha tem limite em bytes. A política de cadastro não é a mesma da troca de senha. Não deduzir novas rejeições de nomes de fixtures ou de exemplos das specs de factory.
- **PEND06 — Resolvida: seed e normalização.** `DataInitializer` passou a aplicar trim antes da consulta e reutilizar o valor na gravação. A regressão de conta existente e o login no backend iniciado com e-mail de bootstrap contendo espaços passaram.
- **PEND07 — Herança e proxies:** o filtro `getClass() == Mensagem.class` pode excluir subclasses/proxies JPA. O comportamento com entidades gerenciadas exige integração; um teste com POJOs não resolve essa questão.

## Restrições de implementação

- O aditivo autoriza os testes e as quatro correções de produção descritas no design, limitadas ao backend. Preservar o frontend, configurações/dependências e schema; usar apenas banco isolado e dados fictícios nas verificações com gravação.
- Em futura implementação, preservar rotas, DTOs, permissões, limite de 300 fichas e regras aprovadas de perfil. Não enfraquecer segurança para facilitar testes.
- Usar fixtures fictícias e chaves exclusivas de teste; não copiar credenciais de arquivos locais para novos testes ou documentação.
- Não criar testes mecânicos de getters/setters, records sem lógica, métodos herdados de Spring Data ou funcionamento interno de BCrypt/Spring/JUnit.
- Não impor porcentagem arbitrária de cobertura nem quantidade mínima de métodos. A evidência necessária é a cobertura dos comportamentos/limites priorizados e a rastreabilidade dos casos pendentes.

## Verificação

**Situação atual:** RF001–RF012 implementados; quatro correções de produção concluídas. Passaram 440 casos unitários e 32 casos de API/contexto, sem falhas/erros/ignorados. O backend iniciado fora de JUnit passou em 51 requisições HTTP com asserções de estado em H2 isolado. [tasks.md](./tasks.md) registra resultados, comandos e limitações.

Para reproduzir a verificação:

- Usar Java 25 e executar `mvn test -o '-Dtest=*Test'` a partir de `backend/` para selecionar os testes unitários. O Maven instalado foi usado devido à falha preexistente do Wrapper descrita em `tasks.md`.
- Executar a suíte completa com as propriedades explícitas de H2 registradas em `tasks.md`, mantendo o ambiente isolado de PostgreSQL real e contas/dados locais.
- Confirmar que os testes unitários executados não carregam contexto Spring nem dependem de rede, ordem de execução ou data real. Registrar classes/cenários executados, falhas e pendências; não inferir cobertura percentual sem medição.
- Preservar ou complementar integração para assinatura/issuer/expiração JWT e matriz completa de acessos; seleção de handlers/JSON e campos desconhecidos; unicidade, herança, cascatas, ordenação de coleções, rollback e bloqueios/concorrência. Os testes H2 existentes não comprovam sozinhos o comportamento do PostgreSQL.
- Manter design/tarefas e as decisões de contrato atualizados conforme o fluxo SDD do backend; nenhuma pendência deste documento deve ser convertida silenciosamente em regra de negócio.
