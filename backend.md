# Backend: configuração e execução

## Pré-requisitos

- JDK 25 instalado e `JAVA_HOME` apontando para a instalação do JDK. Maven não precisa ser instalado separadamente: o projeto inclui o Maven Wrapper 3.10.0.
- PostgreSQL instalado e em execução, com um usuário que possa criar/conectar ao banco `restaurante_popular`.
- Acesso à internet na primeira execução para o Maven Wrapper baixar o Maven e as dependências.

Confira as ferramentas no terminal:

```bash
java -version
sh ./mvnw -version
```

## Preparar o banco

Crie um banco vazio no PostgreSQL:

```sql
CREATE DATABASE restaurante_popular;
```

O arquivo `backend/src/main/resources/application.properties` referencia as variáveis de ambiente, sem armazenar os valores de credenciais no código. Configure as variáveis no terminal em que iniciará o servidor:

```bash
export SPRING_DATASOURCE_URL='jdbc:postgresql://localhost:5432/restaurante_popular'
export SPRING_DATASOURCE_USERNAME='seu_usuario_postgres'
export SPRING_DATASOURCE_PASSWORD='sua_senha_postgres'
export SPRING_JPA_HIBERNATE_DDL_AUTO='validate'
export JWT_SECRET_BASE64='chave-base64-com-pelo-menos-32-bytes'
```

`validate` verifica o schema existente sem recriá-lo. Para inicializar tabelas JPA ausentes em desenvolvimento, use `update` somente nessa inicialização, sem ativar o perfil `local` de bootstrap; depois pare o servidor, aplique a migração indicada abaixo e retorne a `validate` antes de reiniciar. Não use `create`/`create-drop` neste banco populado nem `update` como estratégia de migração em produção. Não coloque senhas no repositório.

O JWT usa HS256. `JWT_SECRET_BASE64` deve decodificar para pelo menos 32 bytes e permanecer fora do repositório. Para criar usuários de demonstração, ative `SPRING_PROFILES_ACTIVE=local` e configure os pares opcionais `BOOTSTRAP_NUTRICIONISTA_EMAIL`/`BOOTSTRAP_NUTRICIONISTA_PASSWORD`, `BOOTSTRAP_CAIXA_EMAIL`/`BOOTSTRAP_CAIXA_PASSWORD` e `BOOTSTRAP_GESTOR_EMAIL`/`BOOTSTRAP_GESTOR_PASSWORD`. O inicializador não cria contas fora do perfil `local` e não usa credenciais padrão.

`JWT_SECRET_BASE64` é obrigatório para assinar e validar JWT HS256 e deve representar pelo menos 32 bytes aleatórios. Não use a chave de exemplo literalmente nem a versione.

Para criar contas locais de desenvolvimento, ative `SPRING_PROFILES_ACTIVE=local` e configure, em pares, `BOOTSTRAP_NUTRICIONISTA_EMAIL`/`BOOTSTRAP_NUTRICIONISTA_PASSWORD`, `BOOTSTRAP_CAIXA_EMAIL`/`BOOTSTRAP_CAIXA_PASSWORD` e, opcionalmente, `BOOTSTRAP_GESTOR_EMAIL`/`BOOTSTRAP_GESTOR_PASSWORD`. Sem esses valores, o seed não cria contas. Não ative esse perfil em produção.

Para migrar um banco existente, aplique uma única vez `backend/database/migrations/V20261102__integracao_frontend_backend.sql` usando um cliente PostgreSQL. O script adiciona salada, permite mensagens anônimas, amplia o texto de mensagem para 1000 caracteres, acrescenta posições aos registros semanais de desperdício/fichas na ordem física atual das linhas e normaliza as datas semanais para segunda-feira. Copia as associações antigas de refeição para os slots `0` a `4` pela ordem crescente de `refeicao_id`; a tabela antiga `semana_refeicoes` é mantida como legado. O solicitante aceitou que dias históricos de métricas e refeições possam ficar incorretos porque o schema antigo não registrava posições. A migração interrompe a execução se encontrar datas semanais ausentes, semanas antigas com mais de cinco refeições ou semanas que colidiriam ao normalizar para segunda-feira; resolva esses dados antes de executá-la.

Essa migração é incremental: exige as tabelas JPA existentes `refeicoes`, `mensagens`, `semanas`, `semana_desperdicios` e `semana_fichas`; `semana_refeicoes` é opcional. Não inicializa nem importa o modelo legado com tabelas singulares `refeicao`, `semana`, `usuario` e `mensagem_usuario`. Para o ambiente atual, o solicitante escolheu manter essas tabelas e inicializar o conjunto JPA vazio ao lado delas, sem importação de registros ou contas. A inicialização e a migração já foram executadas e validadas; não é necessário repeti-las nesse banco. A posição dos slots usa PostgreSQL `INTEGER`, correspondente ao campo Java `int`, e um check limita os valores a `0–4`.

Os scripts em `database/` usam nomes de tabelas e colunas diferentes dos mapeamentos JPA atuais. Não os execute como esquema inicial deste backend sem antes alinhá-los às entidades.

Para o código de Meu Perfil, aplique também `backend/database/migrations/V20261103__perfil_usuario.sql` nas tabelas JPA antes de iniciar com `ddl-auto=validate`. A migração acrescenta `credenciais_autenticacao.versao_token BIGINT NOT NULL DEFAULT 0` e a unicidade de `usuarios.email_recuperacao`, sensível a maiúsculas/minúsculas; interrompe se houver e-mails exatamente duplicados. Ela já foi aplicada e validada neste banco local, com os valores dos usuários/credenciais existentes preservados. Não é necessário repeti-la aqui.

Após atualizar esse código, reinicie o backend na sessão configurada e faça novo login. JWTs antigos sem `tokenVersion` são rejeitados, mesmo quando a chave de assinatura é mantida. Alterar e-mail/senha pelo próprio perfil incrementa a versão das credenciais e invalida todos os tokens anteriores; nome apenas mantém a sessão. A nova senha exige senha atual, confirmação, pelo menos seis caracteres Unicode e no máximo 72 bytes UTF-8. Tokens, senhas e hashes não devem ser registrados.

## Compilar e executar

No Linux ou macOS, a partir da pasta `backend/`:

```bash
sh ./mvnw clean test-compile
sh ./mvnw test
sh ./mvnw spring-boot:run
```

No Windows, use `mvnw.cmd` no lugar de `sh ./mvnw`.

Os testes usam H2 em memória e não precisam de um servidor PostgreSQL. O PostgreSQL é necessário para executar a aplicação com seus dados locais.

O servidor Spring Boot inicia, por padrão, em `http://localhost:8080`. As variáveis de banco precisam permanecer definidas na sessão do terminal durante a execução. Para parar o servidor, pressione `Ctrl+C`.

## Configuração da IDE

Importe a pasta `backend/` como projeto Maven e selecione o JDK 25. A classe principal é `com.batutinhas.restaurante_pop.RestaurantePopApplication`. Antes de iniciar pela IDE, configure nela as quatro variáveis de banco/JPA e `JWT_SECRET_BASE64`; configure as variáveis de bootstrap apenas para desenvolvimento local.
