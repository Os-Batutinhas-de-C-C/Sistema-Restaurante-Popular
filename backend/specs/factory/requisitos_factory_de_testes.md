# Requisitos — Padrão Factory para Testes Automatizados

## Objetivo

Padronizar a criação de objetos de teste (Entidades e DTOs) utilizando o padrão de projeto *Factory Method*. A implementação deve centralizar a montagem de dados fictícios válidos e inválidos, isolando a complexidade de instigação das classes de teste (Specs) e reduzindo a duplicação de código (*boilerplate*).

Esta especificação trata exclusivamente do ambiente de testes (`src/test/java/`). Nenhuma alteração deve ser feita no código de produção (`src/main/java/`).

## Escopo

Criar classes Factory no pacote `factory` (ex: `com.batutinhas.restaurante_pop.factory`) para os seguintes domínios:

- `UsuarioFactory` e `CredencialFactory`
- `SemanaFactory` e `RefeicaoFactory`
- `NoticiaFactory`
- `MensagemFactory`
- `EstoqueFactory`

As factories devem fornecer métodos para instanciar tanto as **Entidades JPA** (simulando dados vindos do banco) quanto os **DTOs de Request** (simulando payloads enviados pelo cliente/frontend).

## Convenções das Factories

- **Nomenclatura de Classes:** O sufixo deve ser sempre `Factory` (ex: `UsuarioFactory`).
- **Nomenclatura de Métodos:** Os métodos devem ser descritivos em relação ao estado do objeto retornado. Usar prefixos como `criar...` (ex: `criarUsuarioValido()`, `criarRequisicaoRegistroInvalida()`, `criarRefeicaoComRelacionamento()`).
- **Escopo de Instância:** Todos os métodos de construção devem ser `public static`. A classe Factory não deve precisar ser instanciada (usar construtor privado para bloquear `new UsuarioFactory()`).
- **Independência:** Cada chamada a um método da Factory deve retornar uma **nova instância** (novo endereço de memória) usando a palavra-chave `new`. O estado não deve ser partilhado entre chamadas para evitar vazamento de estado entre testes (*Test State Bleeding*).
- **Sem injeção de dependências:** Factories de teste não devem usar `@Autowired`, `@Component` ou depender do Contexto do Spring. São classes Java puras (POJOs).

## Regras de negócio (Ambiente de Teste)

- **RN01 — Dados válidos por omissão:** Métodos nomeados genericamente como `criarUsuario()` ou `criarUsuarioValido()` devem retornar um objeto com todos os campos obrigatórios preenchidos e válidos segundo as regras de negócio de `requirements.md` da API.
- **RN02 — Separação Entidade vs DTO:** Cada domínio deve ter métodos explícitos para gerar Entidades (para mock de Repositories/Services) e para gerar Request DTOs (para enviar via `MockMvc`). Ex: `criarUsuarioEntidade()` vs `criarUsuarioCreateRequestDTO()`.
- **RN03 — Mascaramento de Senhas:** A Factory de `CredencialAutenticacao` deve sempre retornar um *hash* simulado válido do BCrypt (ex: `$2a$10$abcdef...`) quando gerar a entidade, mas deve usar texto puro (ex: `senha123`) quando gerar o DTO de Request, refletindo o comportamento real.
- **RN04 — Ausência de dependências cíclicas:** Evitar associar relacionamentos bidirecionais complexos dentro das factories bases, a menos que especificado (ex: a `RefeicaoFactory` não cria automaticamente uma `Semana` inteira para evitar loops infinitos, apenas se o método for `criarRefeicaoComSemana()`).

## Critérios de aceitação (Specs)

### Cenário 1 — Geração de DTO para Request HTTP

**Dado que** uma classe de teste (Spec) precisa simular uma requisição do frontend  
**Quando** o teste invoca o método estático `UsuarioFactory.criarUsuarioCreateRequestDTO()`  
**Então** o método deve retornar um DTO preenchido com dados fictícios válidos  
**E** esse DTO deve poder ser convertido para JSON pelo `ObjectMapper` sem lançar exceções para uso no `MockMvc`.

### Cenário 2 — Isolamento de Estado entre Testes

**Dado que** dois testes distintos ou o mesmo teste chamam `SemanaFactory.criarSemanaValida()` duas vezes sequenciais  
**Quando** as instâncias retornadas são comparadas  
**Então** elas devem representar objetos em diferentes espaços de memória (`instancia1 != instancia2`)  
**E** a modificação de um campo na primeira instância não deve refletir na segunda.

### Cenário 3 — Delegação de Relacionamentos

**Dado que** a `UsuarioFactory` precisa montar uma entidade `Usuario` com credenciais  
**Quando** o método `criarUsuarioEntidade()` é chamado  
**Então** a `UsuarioFactory` deve delegar a criação da credencial chamando internamente `CredencialFactory.criarCredencialValida()`  
**E** o relacionamento unidirecional/bidirecional deve ser estabelecido antes de retornar o objeto.

### Cenário 4 — Geração de Cenários Inválidos

**Dado que** um teste precisa validar uma falha de validação (ex: HTTP 400 Bad Request)  
**Quando** o teste invoca `RefeicaoFactory.criarRefeicaoSemProteinaDTO()`  
**Então** a factory deve retornar um DTO onde o campo de proteína é propositalmente `null` ou vazio  
**E** os demais campos devem permanecer válidos para garantir que a falha seja estritamente isolada no campo alvo.

## Restrições

- Não utilizar bibliotecas externas geradoras de dados aleatórios (como *Faker* ou *EasyRandom*) nesta iteração, para manter a previsibilidade dos testes e facilitar a depuração inicial. Utilizar *Hardcoded Strings* coerentes (ex: `"João Nutricionista"`, `"joao@email.com"`).
- Nenhuma dependência de banco de dados (H2, PostgreSQL) deve estar presente nas Factories. A persistência é responsabilidade do teste (Spec) após receber o objeto da Factory.

## Verificação

- Executar a suite de testes atual (`mvn test`) para garantir que a introdução das Factories não quebra os testes de contexto existentes.
- Confirmar que os testes de controller (Specs) não possuem instâncias com `new` diretamente nos métodos de teste, substituindo-os pelas chamadas às Factories.