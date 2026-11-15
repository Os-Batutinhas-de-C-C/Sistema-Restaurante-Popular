# Instruções do backend — Restaurante Popular de Quixadá

## Objetivo

Manter a API e as regras de negócio do Sistema Restaurante Popular de Quixadá. O backend recebe requisições do frontend, aplica as regras definidas para o sistema e persiste dados em PostgreSQL.

## Stack obrigatória

- **Linguagem:** Java 25, conforme `backend/pom.xml` e `backend.md`.
- **Framework:** Spring Boot 4.1.1.
- **Build:** Maven pelo Wrapper incluído no projeto (`mvnw` no Linux/macOS e `mvnw.cmd` no Windows).
- **API:** Spring Web.
- **Persistência:** Spring Data JPA e PostgreSQL. H2 está disponível para testes.
- **Segurança:** Spring Security; preserve os filtros e as regras configurados em `src/main/java/com/batutinhas/restaurante_pop/config/SecurityConfig.java`.
- Use as dependências declaradas em `pom.xml`. Não adicione bibliotecas, frameworks ou outro banco de dados sem necessidade definida e autorização do usuário.
- O servidor Spring Boot usa a porta padrão 8080, salvo configuração diferente.

## Configuração do ambiente

- Leia `backend.md` antes de alterar instruções de execução ou configuração local. Ele documenta as variáveis Spring `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` e `SPRING_JPA_HIBERNATE_DDL_AUTO`, além do banco local `restaurante_popular`.
- Confira também `src/main/resources/application.properties` antes de alterar configuração: esse arquivo existe no projeto, embora `backend.md` diga que ele não existe. Não presuma que a documentação e a configuração atual estejam sincronizadas.
- Nunca copie valores de credenciais, tokens ou dados pessoais para código, documentação, logs ou exemplos versionados. Use valores fictícios nos exemplos e mantenha segredos fora do repositório.
- `backend.md` informa que os scripts de `database/` não correspondem aos mapeamentos JPA atuais. Não use esses scripts como esquema inicial sem antes comparar e alinhar o esquema com as entidades.
- Não altere configurações de conexão, estratégia de criação do esquema ou dados persistidos sem que isso faça parte do escopo solicitado.

## Spec-Driven Development (SDD)

Antes de propor ou implementar uma funcionalidade:

1. Leia `requirements.md`, `design.md` e `tasks.md` da especificação correspondente em `backend/specs/<id-nome>/`, quando existirem.
2. Leia a especificação correspondente em `frontend/specs/` quando ela definir o comportamento ou o contrato que a API deve atender.
3. Entenda os papéis envolvidos, as regras de negócio, os critérios de aceite e os consumidores dos endpoints existentes.
4. Inspecione controllers, services, repositories, models e configurações relacionados antes de escolher onde mudar o código.
5. Apresente um plano curto baseado na especificação e aguarde confirmação antes de iniciar a implementação de funcionalidades.
6. Implemente estritamente o escopo definido e preserve a rastreabilidade de identificadores como RF, RNF, HU, RN e CA.

Se não houver especificação correspondente ou se uma regra de negócio estiver ambígua, não invente permissões, preços, políticas ou comportamentos. Explique a lacuna e peça orientação antes de implementar a parte que depende dela. Correções pontuais e explicações solicitadas diretamente pelo usuário seguem o escopo explícito do pedido.

## Organização do código

O código Java fica em `src/main/java/com/batutinhas/restaurante_pop/`:

- `controller/`: endpoints HTTP e tradução entre requisições, respostas e serviços.
- `service/`: regras de negócio e coordenação de operações.
- `repository/`: persistência e consultas com Spring Data JPA.
- `model/`: entidades e conceitos do domínio, como usuário, mensagem, notícia, estoque, semana e refeição.
- `config/`: configuração transversal, incluindo segurança.

Mantenha responsabilidades claras. Controllers devem ser enxutos e delegar regras de negócio aos services; services devem coordenar o domínio e usar repositories para persistência. Não acrescente regras ou consultas diretamente em controllers. Ao corrigir código legado que ainda mistura essas responsabilidades, limite a refatoração ao escopo necessário.

## API, domínio e integração

- Preserve rotas, verbos HTTP, payloads e comportamentos já consumidos pelo frontend. Consulte os services e as telas correspondentes antes de alterar contratos.
- Os recursos atuais incluem usuários, semanas/cardápios, refeições, notícias, mensagens e estoque. Não presuma que funcionalidades citadas apenas em documentação já estejam implementadas.
- Use códigos HTTP coerentes com o resultado e com o padrão já adotado pela API: sucesso, entrada inválida, recurso inexistente ou falha de autenticação/autorização.
- Valide dados recebidos na borda da API e aplique regras de negócio no service. Use mensagens úteis sem revelar detalhes internos.
- Prefira DTOs para contratos HTTP quando isso evitar expor campos internos de entidades ou permitir validar entradas com clareza. Não faça uma migração ampla de payloads sem solicitação ou especificação.
- Não exponha hashes, credenciais, dados pessoais ou relações internas das entidades em respostas. Evite problemas de serialização em relacionamentos JPA; use DTOs quando necessário.
- Injete dependências gerenciadas pelo Spring por construtor. Não crie services com `new` nem deixe dependências Spring sem injeção.
- Use transações no service quando uma operação de negócio exigir atomicidade entre múltiplas alterações.

## Banco de dados e segurança

- Preserve os mapeamentos e relacionamentos JPA existentes. Ao alterar entidades, considere chaves, integridade referencial, cascata, carregamento e efeitos no esquema PostgreSQL.
- Não enfraqueça autenticação, autorização, CORS ou proteção de endpoints para facilitar desenvolvimento. Mudanças de acesso devem estar respaldadas pela especificação e refletidas em `SecurityConfig`.
- Senhas devem continuar sendo tratadas por mecanismos de hash seguros, usando o `PasswordEncoder` configurado. Nunca armazene ou registre senhas em texto puro.
- Não exponha stack traces, credenciais ou detalhes internos em respostas HTTP ou logs.

## Qualidade e verificação

- Use nomes e mensagens voltados ao domínio do projeto; mensagens destinadas à interface devem estar em Português do Brasil, salvo contrato existente em outro idioma.
- Quando o usuário solicitar testes ou validação, escolha testes focados para services e testes de integração da API/persistência conforme o escopo. Os testes existentes usam H2; executar a aplicação localmente requer PostgreSQL configurado.
- Não adicione nem execute testes, builds ou outras verificações automaticamente. Faça isso quando solicitado pelo usuário ou quando a tarefa pedir validação explicitamente.
- Atualize as tarefas em `tasks.md` quando houver especificação correspondente e a implementação tiver sido concluída e validada.
- Ao concluir, informe arquivos alterados, requisitos atendidos e limitações. Não afirme que uma verificação foi feita se ela não foi executada.

## Como trabalhar neste repositório

1. Confirme o escopo na especificação e no contrato do frontend relacionado.
2. Inspecione a implementação existente e identifique as camadas afetadas.
3. Apresente um plano curto e aguarde confirmação antes de implementar funcionalidades.
4. Faça mudanças focadas; não reestruture código ou configuração fora do pedido.
5. Preserve compatibilidade com o frontend e com o PostgreSQL, salvo mudança explícita na especificação.
6. Relate o que mudou, as verificações solicitadas que foram feitas e quaisquer pendências.
