# Design — Padrão Factory para Testes Automatizados

## Visão geral

Implementar o padrão estrutural *Factory Method* estático para centralizar e padronizar a criação de dados de teste no projeto. O objetivo é remover a lógica de instanciação (`new Objeto()`, setters em massa) de dentro das classes de Spec (testes de integração/unitários), promovendo testes mais limpos, focados no comportamento (Given-When-Then) e facilitando a manutenção futura caso a estrutura das Entidades ou DTOs mude.

## Organização

Criar o pacote `src/test/java/com/batutinhas/restaurante_pop/factory/`.  
As classes de fábrica não devem pertencer ao pacote de produção (`src/main/java`).

Cada domínio principal do sistema deve ter a sua própria Factory:
- `UsuarioFactory`
- `CredencialFactory`
- `SemanaFactory`
- `RefeicaoFactory`
- `NoticiaFactory`
- `MensagemFactory`
- `EstoqueFactory`

## Estrutura das Classes (POJOs)

1. **Sem Instanciação:** As classes Factory servem apenas como agrupadores lógicos de métodos utilitários. Devem possuir um construtor privado e vazio para impedir a instanciação acidental (`private UsuarioFactory() {}`).
2. **Métodos Estáticos:** Todos os métodos geradores devem ser `public static`, permitindo que os testes os invoquem diretamente (ex: `UsuarioFactory.criarUsuarioValido()`).
3. **Ausência de Contexto Spring:** As Factories são classes Java puras. Não devem ser anotadas com `@Component` ou `@Service`, nem injetar dependências (sem `@Autowired` ou construtores de injeção). Elas não acedem a repositórios ou bancos de dados.
4. **Previsibilidade:** Utilizar valores fixos (*hardcoded*) e sensatos para os dados (ex: e-mail `"teste@restaurante.com"`, quantidade `10`). Evitar lógica aleatória (`Math.random()`) para garantir que falhas nos testes sejam determinísticas e reproduzíveis.

## Tipos de Retorno

Cada Factory de um domínio com contrato HTTP estabelecido deve possuir no mínimo dois tipos de métodos base:
*   **Geradores de DTO de Request:** Retornam instâncias, por exemplo, de `UsuarioCreateRequestDTO` ou `RefeicaoCreateRequestDTO`. Utilizados pelo `MockMvc` para simular o corpo HTTP (payload) enviado pelo cliente.
*   **Geradores de Entidades:** Retornam instâncias de JPA Entities (ex: `Usuario`, `Semana`). Utilizados para injetar (*seed*) dados no banco H2 antes da execução de um teste (usando Repositories dentro do setup do teste).

## Composição e Relacionamentos

Quando uma Entidade possuir relacionamentos obrigatórios, a sua Factory deve delegar a criação do objeto aninhado para a Factory correspondente.
*   **Exemplo:** O método `UsuarioFactory.criarUsuarioEntidadeValido()` deve chamar internamente `CredencialFactory.criarCredencialValida()` para preencher o atributo `credencialAutenticacao` do utilizador instanciado, configurando automaticamente a relação bidirecional (setando o utilizador na credencial e a credencial no utilizador).
*   **Contenção de Loops:** Relacionamentos `ManyToMany` e `OneToMany` pesados (como `Semana` e `Refeicao`) devem ser tratados com cautela. A `RefeicaoFactory` não gera uma `Semana` por omissão, para evitar *StackOverflowError*. A associação deve ser feita na `SemanaFactory` ao popular a lista `cardapio`.

## Cenários de Exceção (Falhas)

As Factories também devem fornecer métodos auxiliares que retornam estados deliberadamente inválidos para testar a validação da API (HTTP 400 Bad Request).
*   **Exemplo:** `UsuarioFactory.criarRequestSemEmail()` ou `RefeicaoFactory.criarRequestComCaloriasNegativas()`.
*   O estado inválido deve ser rigorosamente isolado ao campo alvo do teste; todos os outros campos do objeto gerado devem ser válidos.

## Estratégia de Integração com os Testes

Os testes (Specs) devem importar os métodos estáticos das Factories. O fluxo de um teste de integração no Spring Boot será:
1. Invocação da Factory para obter a Entidade.
2. Salvamento da Entidade no banco H2 via Repository.
3. Invocação da Factory para obter o DTO de Request válido/inválido.
4. Envio do DTO via `MockMvc.perform()`.
5. Validação das asserções (`andExpect()`).