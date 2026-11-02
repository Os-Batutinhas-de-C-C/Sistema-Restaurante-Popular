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

O backend não contém arquivo `application.properties` ou `application.yml` com os dados de conexão. Configure as variáveis reconhecidas pelo Spring Boot no terminal em que iniciará o servidor:

```bash
export SPRING_DATASOURCE_URL='jdbc:postgresql://localhost:5432/restaurante_popular'
export SPRING_DATASOURCE_USERNAME='seu_usuario_postgres'
export SPRING_DATASOURCE_PASSWORD='sua_senha_postgres'
export SPRING_JPA_HIBERNATE_DDL_AUTO='update'
```

`update` permite que o Hibernate ajuste o esquema local conforme as entidades JPA. Não use essa opção como estratégia de migração em produção. Não coloque senhas no repositório.

Os scripts em `database/` usam nomes de tabelas e colunas diferentes dos mapeamentos JPA atuais. Não os execute como esquema inicial deste backend sem antes alinhá-los às entidades.

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

Importe a pasta `backend/` como projeto Maven e selecione o JDK 25. A classe principal é `com.batutinhas.restaurante_pop.RestaurantePopApplication`. Antes de iniciar pela IDE, configure nela as mesmas quatro variáveis `SPRING_DATASOURCE_*` e `SPRING_JPA_HIBERNATE_DDL_AUTO` definidas acima.
