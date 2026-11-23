# Backend: configuração e execução

## Estado atual e API

O backend usa Java 25, Spring Boot 4.1.1, Spring Web, Spring Security, Spring Data JPA e PostgreSQL. A autenticação é stateless por JWT HS256. Os perfis do sistema são `NUTRICIONISTA`, `GESTOR` e `CAIXA`; H2 é usado nos testes.

A API usa o perfil Caixa para registrar fichas e o perfil Nutricionista para operar semanas, refeições e estoque. O Gestor consulta fichas pelo endpoint público, lê `GET /api/desperdicio/hoje` e gerencia a própria conta. As rotas públicas incluem login, cardápio, notícias, leitura de fichas e envio anônimo de mensagens. A matriz de acesso está na [especificação DTO](./backend/specs/DTOs/requirements.md). O frontend consome a API pelo proxy Next.js em `/api`.

## Pré-requisitos

- JDK 25 instalado. O Maven Wrapper 3.10.0 permite executar o projeto sem instalar Maven separadamente; o helper `run-with-java25.cmd` usa o Maven instalado e disponível no `PATH`.
- PostgreSQL instalado e em execução, com um usuário que possa criar/conectar ao banco `restaurante_popular`.
- Acesso à internet na primeira execução para o Maven Wrapper baixar o Maven e as dependências.

Confira as ferramentas. No Windows use `mvnw.cmd`; no Linux/macOS use `./mvnw`:

```powershell
java -version
.\mvnw.cmd -version
```

```bash
java -version
./mvnw -version
```

## Preparar o banco

Crie um banco vazio no PostgreSQL:

```sql
CREATE DATABASE restaurante_popular;
```

O arquivo local `backend/src/main/resources/application.properties` é ignorado pelo Git e não vem em um clone novo. Ele pode referenciar variáveis de ambiente sem versionar credenciais. Configure as variáveis no terminal em que iniciará o servidor. Em Linux/macOS:

```bash
export SPRING_DATASOURCE_URL='jdbc:postgresql://localhost:5432/restaurante_popular'
export SPRING_DATASOURCE_USERNAME='seu_usuario_postgres'
export SPRING_DATASOURCE_PASSWORD='sua_senha_postgres'
export SPRING_JPA_HIBERNATE_DDL_AUTO='validate'
export JWT_SECRET_BASE64='chave-base64-com-pelo-menos-32-bytes'
```

No PowerShell, defina as mesmas variáveis com `$env:NOME = "valor"`. Leia usuário e senha do banco de forma interativa, em vez de deixar valores reais em comandos salvos ou arquivos versionados. `JWT_SECRET_BASE64` deve ser gerada com pelo menos 32 bytes aleatórios; não use o exemplo acima literalmente.

`validate` verifica o schema existente sem recriá-lo. Para inicializar tabelas JPA ausentes em desenvolvimento, use `update` somente nessa inicialização, sem ativar o perfil `local` de bootstrap; depois pare o servidor, aplique a migração indicada abaixo e retorne a `validate` antes de reiniciar. Não use `create`/`create-drop` neste banco populado nem `update` como estratégia de migração em produção. Não coloque senhas no repositório.

O JWT usa HS256. `JWT_SECRET_BASE64` deve decodificar para pelo menos 32 bytes e permanecer fora do repositório. Não há contas padrão. Para criar contas locais de desenvolvimento, ative `SPRING_PROFILES_ACTIVE=local` e configure em pares `BOOTSTRAP_NUTRICIONISTA_EMAIL`/`BOOTSTRAP_NUTRICIONISTA_PASSWORD`, `BOOTSTRAP_CAIXA_EMAIL`/`BOOTSTRAP_CAIXA_PASSWORD` e, opcionalmente, `BOOTSTRAP_GESTOR_EMAIL`/`BOOTSTRAP_GESTOR_PASSWORD`. Sem esses valores, o seed não cria contas. Não ative esse perfil em produção.

Para migrar um banco existente, aplique uma única vez `backend/database/migrations/V20261102__integracao_frontend_backend.sql` usando um cliente PostgreSQL. O script adiciona salada, permite mensagens anônimas, amplia o texto de mensagem para 1000 caracteres, acrescenta posições aos registros semanais de desperdício/fichas na ordem física atual das linhas e normaliza as datas semanais para segunda-feira. Copia as associações antigas de refeição para os slots `0` a `4` pela ordem crescente de `refeicao_id`; a tabela antiga `semana_refeicoes` é mantida como legado. O solicitante aceitou que dias históricos de métricas e refeições possam ficar incorretos porque o schema antigo não registrava posições. A migração interrompe a execução se encontrar datas semanais ausentes, semanas antigas com mais de cinco refeições ou semanas que colidiriam ao normalizar para segunda-feira; resolva esses dados antes de executá-la.

Essa migração é incremental: exige as tabelas JPA existentes `refeicoes`, `mensagens`, `semanas`, `semana_desperdicios` e `semana_fichas`; `semana_refeicoes` é opcional. Não inicializa nem importa o modelo legado com tabelas singulares `refeicao`, `semana`, `usuario` e `mensagem_usuario`. Para o ambiente atual, o solicitante escolheu manter essas tabelas e inicializar o conjunto JPA vazio ao lado delas, sem importação de registros ou contas. A inicialização e a migração já foram executadas e validadas; não é necessário repeti-las nesse banco. A posição dos slots usa PostgreSQL `INTEGER`, correspondente ao campo Java `int`, e um check limita os valores a `0–4`.

Os scripts em `database/` usam nomes de tabelas e colunas diferentes dos mapeamentos JPA atuais. Não os execute como esquema inicial deste backend sem antes alinhá-los às entidades.

**Disponibilidade das migrações:** os arquivos referenciados em `backend/database/migrations/` existem nesta cópia de trabalho, mas o padrão `database/` em `backend/.gitignore` os exclui do Git. Um clone novo não contém esses scripts. O banco local deste ambiente já recebeu as migrações e não precisa reaplicá-las; para preparar outro banco, obtenha as versões autorizadas das migrações antes de seguir as etapas acima. Não trate essa cópia de trabalho como distribuição versionada dos scripts.

Para o código de Meu Perfil, aplique também `backend/database/migrations/V20261103__perfil_usuario.sql` nas tabelas JPA antes de iniciar com `ddl-auto=validate`. A migração acrescenta `credenciais_autenticacao.versao_token BIGINT NOT NULL DEFAULT 0` e a unicidade de `usuarios.email_recuperacao`, sensível a maiúsculas/minúsculas; interrompe se houver e-mails exatamente duplicados. Ela já foi aplicada e validada neste banco local, com os valores dos usuários/credenciais existentes preservados. Não é necessário repeti-la aqui.

Após atualizar esse código, reinicie o backend na sessão configurada e faça novo login. JWTs antigos sem `tokenVersion` são rejeitados, mesmo quando a chave de assinatura é mantida. Alterar e-mail/senha pelo próprio perfil incrementa a versão das credenciais e invalida todos os tokens anteriores; nome apenas mantém a sessão. A nova senha exige senha atual, confirmação, pelo menos seis caracteres Unicode e no máximo 72 bytes UTF-8. Tokens, senhas e hashes não devem ser registrados.

Antes de iniciar a versão com Oficinas ou Cursos usando `ddl-auto=validate`, aplique a migração versionada [V20261123__oficinas_ou_cursos.sql](./backend/migrations/V20261123__oficinas_ou_cursos.sql) ao banco PostgreSQL configurado. Ela cria as tabelas de eventos e inscrições, a restrição de CPF único por evento e a chave estrangeira com exclusão em cascata. Execute da raiz do repositório, usando a conexão do ambiente autorizado.

```text
psql -d restaurante_popular -v ON_ERROR_STOP=1 -f backend/migrations/V20261123__oficinas_ou_cursos.sql
```

## Compilar e executar

No Windows, a partir da raiz do repositório, o helper seleciona o JDK 25 em `%USERPROFILE%\jdks\temurin-25.0.5.8` e chama o Maven instalado:

```powershell
Set-Location .\backend
$env:SPRING_JPA_HIBERNATE_DDL_AUTO = "validate"
.\run-with-java25.cmd
```

Se o JDK estiver em outro caminho ou o Maven não estiver no `PATH`, configure `JAVA_HOME` para o JDK 25 e use o Maven Wrapper:

```powershell
$env:JAVA_HOME = Read-Host "Caminho da instalação do JDK 25"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
Set-Location .\backend
.\mvnw.cmd spring-boot:run
```

No Linux ou macOS, a partir da pasta `backend/`:

```bash
./mvnw spring-boot:run
```

Para executar os testes unitários e de integração, use `./mvnw test` no Linux/macOS ou `.\mvnw.cmd test` no Windows. Esses testes usam H2 em memória e não precisam de PostgreSQL.

O servidor Spring Boot inicia, por padrão, em `http://localhost:8080`. As variáveis de banco precisam permanecer definidas na sessão do terminal durante a execução. Para parar o servidor, pressione `Ctrl+C`.

## Configuração da IDE

Importe a pasta `backend/` como projeto Maven e selecione o JDK 25. A classe principal é `com.batutinhas.restaurante_pop.RestaurantePopApplication`. Antes de iniciar pela IDE, configure nela as quatro variáveis de banco/JPA e `JWT_SECRET_BASE64`; configure as variáveis de bootstrap apenas para desenvolvimento local.
