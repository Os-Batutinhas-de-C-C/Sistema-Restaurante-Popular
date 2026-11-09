# Tarefas — Testes unitários do backend

## Correções de produção — 08/11/2026

O solicitante autorizou corrigir os quatro comportamentos diagnosticados e verificar novamente o backend, mantendo o frontend intacto.

- [x] Impedir atualização de notícias pelas rotas de mensagens antes de validar ou modificar a entidade (`MensagemService`).
- [x] Capturar uma única data/hora de Fortaleza para mensagens públicas (`MensagemService`).
- [x] Usar somente ingredientes em `equals/hashCode`, alinhando a detecção de duplicidade da semana (`Refeicao`).
- [x] Aplicar trim ao e-mail antes da consulta de bootstrap e reutilizá-lo na criação (`DataInitializer`).
- [x] Manter as seis regressões ativas; acrescentar o caso de notícia com texto nulo para comprovar a rejeição antes da validação.
- [x] Acrescentar três regressões HTTP: proteção da notícia e criação/atualização de semana com ingredientes duplicados, incluindo rollback e preservação de dados.
- [x] Executar a suíte completa e verificar o backend iniciado fora de JUnit.
- [x] Encerrar a instância temporária e confirmar que a porta foi liberada.

### Resultado atual

| Grupo | Classes | Casos executados | Passaram | Falharam | Erros | Ignorados |
|---|---:|---:|---:|---:|---:|---:|
| Testes unitários | 24 | 440 | 440 | 0 | 0 | 0 |
| Testes de API/contexto | 5 | 32 | 32 | 0 | 0 | 0 |
| Total | 29 | 472 | 472 | 0 | 0 | 0 |

Maven 3.9.16 / Java 25.0.5: `BUILD SUCCESS`, aproximadamente 56 segundos. Os seis testes antes falhos passaram. Os testes HTTP confirmaram `404` sem alteração da notícia e `400` sem persistência parcial ou modificação do cardápio anterior. A suíte completa preservou verificações de permissões, revogação, capacidade, concorrência e histórico.

### Backend em execução

A aplicação foi iniciada por `spring-boot:run` em `127.0.0.1:18081`, com as classes/configurações de produção, perfil `local`, chave JWT temporária e três contas fictícias. Somente o JAR H2 de teste foi acrescentado ao classpath, sem mudar o `pom.xml`. O banco `jdbc:h2:mem:backend_fixes_smoke` foi explicitamente isolado do PostgreSQL existente.

**51 requisições HTTP passaram**, com asserções de estado sobre:

- Leituras públicas de notícias, cardápios e fichas; `401` sem token, login inválido, logins de Nutricionista/Caixa/Gestor e `403` por papel.
- Bootstrap com e-mail de Nutricionista contendo espaços e login posterior pelo e-mail normalizado; rejeição de cadastro duplicado.
- Criação anônima de mensagem, timestamp coerente em Fortaleza, consulta, atualização e exclusão; notícia protegida nas rotas de mensagem e conteúdo preservado.
- Criação de refeição e semana, rejeição de duplicidade com calorias diferentes, preservação após rejeição, atualização válida e cardápio público sem métricas administrativas.
- Cadastro, atualização, validade vencida e exclusão de estoque; `404` após excluir.
- Fichas com autorização exclusiva do Caixa; em 08/11/2026, domingo, o incremento retornou `409 FICHAS_CLOSED_DAY` e preservou a contagem. Dias úteis/limites/concorrência passaram nos testes com relógio controlado.
- Perfil próprio, alteração de nome sem revogação, alteração de e-mail/senha com revogação, rejeição da senha anterior e novo login válido.

A instância temporária e seu launcher foram encerrados; a porta 18081 foi liberada. O frontend não foi alterado nem executado. Nenhuma configuração persistida, dependência ou schema foi alterado; não houve acesso de teste ao PostgreSQL real. A validação em H2 não comprova todos os comportamentos específicos do PostgreSQL.

## Implementação inicial dos testes

- [x] RF001 — Perfil e troca de senha.
- [x] RF002 — Login, emissão e validação de JWT.
- [x] RF003 — Coordenação diária de fichas.
- [x] RF004 — Contagem e capacidade de fichas.
- [x] RF005 — Semanas e cardápios, incluindo regressão ativa de duplicidade.
- [x] RF006 — Refeições, slots e igualdade, incluindo regressões ativas de duplicidade.
- [x] RF007 — Cadastro e papéis.
- [x] RF008 — Notícias.
- [x] RF009 — Mensagens, incluindo regressões ativas de notícias e meia-noite.
- [x] RF010 — Estoque e validade.
- [x] RF011 — Validações, erros e chave JWT.
- [x] RF012 — Auxiliares e controllers, incluindo regressão ativa de normalização no bootstrap.

O checklist registra os testes implementados. O resultado atual está acima; o diagnóstico anterior às correções permanece no histórico abaixo.

## Rastreabilidade

As classes ficam em `src/test/java/com/batutinhas/restaurante_pop/`. Cada classe descreve seu RF e sua finalidade; cada método tem nome e `@DisplayName` com a condição e o resultado esperado. A preparação usa dados reais de factories e colaboradores simulados; as asserções verificam o retorno, a mudança de estado ou a ausência de gravação.

| Requisito | Classes de teste |
|---|---|
| RF001 | `service/PerfilServiceTest` |
| RF002 | `controller/AuthControllerTest`, `service/JwtTokenServiceTest`, `config/JwtTokenVersionValidatorTest` |
| RF003 | `service/FichasServiceTest` |
| RF004 | `service/FichasTransacaoServiceTest` |
| RF005 | `service/SemanaServiceTest` |
| RF006 | `service/RefeicaoServiceTest`, `model/SemanaTest`, `model/RefeicaoTest`, `dto/RefeicaoRequestDTOTest` |
| RF007 | `service/UsuarioServiceTest`, `service/UsuarioPapelTest` |
| RF008 | `service/NoticiaServiceTest` |
| RF009 | `service/MensagemServiceTest` |
| RF010 | `service/EstoqueServiceTest` |
| RF011 | `service/RequestValidationTest`, `config/ApiExceptionHandlerTest`, `config/JwtConfigTest` |
| RF012 | `service/AutenticacaoServiceTest`, `config/DataInitializerTest`, `model/UsuarioTest`, `model/CredencialAutenticacaoTest`, `controller/PerfilControllerTest` |

## Decisões confirmadas

- [x] Política de atualização: rejeitar notícias pela rota de mensagens com `404`.
- [x] Duplicidade de refeições: ingredientes definem igualdade, independentemente das calorias.
- [x] Exigir timestamp público consistente e trim antes da consulta de bootstrap; corrigir a produção conforme a solicitação posterior.

## Verificação

- [x] Executar os testes unitários.
- [x] Executar a suíte de integração existente.
- [x] Registrar resultados, falhas e limitações.
- [x] Confirmar que os arquivos de teste estão em `backend/src/test` e que o frontend permanece inalterado.

## Histórico: execução anterior às correções — 08/11/2026

Execução inicial com Maven 3.9.16, Java 25.0.5 e dependências em cache:

| Grupo | Classes | Casos executados | Passaram | Falharam | Erros | Ignorados |
|---|---:|---:|---:|---:|---:|---:|
| Novos testes unitários | 24 | 439 | 433 | 6 | 0 | 0 |
| Testes existentes de API/contexto | 5 | 29 | 29 | 0 | 0 | 0 |
| Total | 29 | 468 | 462 | 6 | 0 | 0 |

Os casos parametrizados contam individualmente. A execução anterior às correções durou aproximadamente 32 segundos e retornou `BUILD FAILURE` devido às seis falhas de comportamento listadas a seguir, posteriormente corrigidas.

### Falhas que reproduzem as regras confirmadas

| Teste | Expectativa confirmada | Resultado observado |
|---|---|---|
| [DataInitializerTest](../../src/test/java/com/batutinhas/restaurante_pop/config/DataInitializerTest.java) — `emailComEspacosConsultaContaNormalizadaAntesDeCriar` | Consultar o e-mail após trim e evitar recriar conta existente. | Consulta com espaços e tenta salvar uma nova conta. |
| [RefeicaoTest](../../src/test/java/com/batutinhas/restaurante_pop/model/RefeicaoTest.java) — `ignoraCaloriasNaDuplicidade` | Mesmos ingredientes implicam igualdade e hash igual, mesmo com calorias diferentes. | Calorias ainda participam de `equals/hashCode`. |
| [SemanaTest](../../src/test/java/com/batutinhas/restaurante_pop/model/SemanaTest.java) — `rejeitaMesmosIngredientesComCaloriasDiferentes` | Impedir duplicar ingredientes ao adicionar refeição à semana. | A segunda refeição é aceita quando as calorias diferem. |
| [SemanaServiceTest](../../src/test/java/com/batutinhas/restaurante_pop/service/SemanaServiceTest.java) — `rejeitaMesmosIngredientesComCaloriasDiferentes` | Rejeitar cardápio com refeições duplicadas por ingredientes. | Criação prossegue sem a rejeição esperada. |
| [MensagemServiceTest](../../src/test/java/com/batutinhas/restaurante_pop/service/MensagemServiceTest.java) — `mantemDataEHorarioConsistentesNaMeiaNoite` | Data/hora devem formar um dos instantes completos antes ou depois da virada em Fortaleza. | Combina a data anterior com o horário de meia-noite seguinte. |
| [MensagemServiceTest](../../src/test/java/com/batutinhas/restaurante_pop/service/MensagemServiceTest.java) — `naoAtualizaNoticiaPelaRotaDeMensagem` | ID de notícia deve retornar vazio no service, permitindo `404` no controller, sem mutação/gravação. | Atualiza texto/data/hora da notícia e chama `save`. |

Eram quatro divergências de comportamento, cobertas por seis testes. Na etapa inicial, o solicitante orientou reportar as falhas sem alterar produção; a solicitação posterior autorizou as correções e todos esses testes passaram.

### Reprodução

Na pasta `backend/`, com JDK 25 e dependências disponíveis no cache, os novos testes são selecionados pelo sufixo singular:

```powershell
mvn test -o '-Dtest=*Test'
```

A execução final também incluiu os testes existentes, com propriedades explícitas para garantir H2 em memória, perfil de teste e criação/remoção do esquema somente nesse banco temporário:

```powershell
mvn test -o '-Dspring.profiles.active=test' '-Dspring.datasource.url=jdbc:h2:mem:backend_fixes_tests;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE' '-Dspring.datasource.driver-class-name=org.h2.Driver' '-Dspring.datasource.username=sa' '-Dspring.datasource.password=' '-Dspring.jpa.hibernate.ddl-auto=create-drop' '-Dspring.jpa.show-sql=false' '-Dlogging.level.root=WARN' '-Dlogging.level.org.springframework=WARN' '-Dlogging.level.org.hibernate=WARN' '-Ddebug=false'
```

Os relatórios detalhados da execução ficam em `backend/target/surefire-reports/` como artefatos gerados pelo Maven.

## Limitações

- O Maven Wrapper foi tentado com `.\mvnw.cmd -version`, mas falhou antes de iniciar Maven com erro PowerShell de indexação de matriz nula. Foi usado o Maven instalado, sem modificar o Wrapper.
- A primeira compilação no sandbox falhou ao fechar um JAR do cache externo `.m2`; a execução com acesso autorizado ao cache prosseguiu.
- Os testes unitários não carregam Spring nem acessam banco/rede; a etapa de integração existente inicia servidores locais e usa apenas H2 em memória. Não foram realizadas gravações ou verificações em PostgreSQL.
- Locks, rollback, migrações, proxies JPA e unicidade PostgreSQL continuam exigindo evidência de integração específica; a suíte não é apresentada como medição percentual de cobertura.
- Os arquivos de requisitos e alterações já presentes no workspace foram preservados. Os 24 arquivos Java novos estão em `backend/src/test`; os registros de design/tarefas estão em `backend/specs/unit-tests`.
