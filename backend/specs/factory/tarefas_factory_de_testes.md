# Tarefas — Padrão Factory para Testes Automatizados

## Planejamento e Arquitetura

- [ ] **T01 — Criação do Pacote Base:** Criar o diretório `factory` dentro do pacote base de testes (`src/test/java/com/batutinhas/restaurante_pop/factory`).
- [ ] **T02 — Revisão de Dependências:** Garantir que o ambiente de teste não utiliza bibliotecas não aprovadas (focar apenas na estruturação de POJOs).

## Implementação das Factories (Domínio a Domínio)

- [ ] **T03 — Implementar `CredencialFactory`:** 
  - Criar métodos estáticos para gerar a entidade `CredencialAutenticacao` com senha em formato de hash BCrypt e booleanos de acesso padrão.
- [ ] **T04 — Implementar `UsuarioFactory`:**
  - Adicionar construtor privado.
  - Criar `criarUsuarioCreateRequestDTO()` (com `senhaPura`).
  - Criar `criarUsuarioEntidadeValido()` (delegando a credencial para a `CredencialFactory`).
  - Criar métodos para requests inválidos (ex: DTO sem nome ou e-mail inválido).
- [ ] **T05 — Implementar `RefeicaoFactory`:**
  - Criar geradores de DTOs (`RefeicaoCreateRequestDTO` e `RefeicaoRequestDTO`) e da Entidade `Refeicao`.
- [ ] **T06 — Implementar `SemanaFactory`:**
  - Criar geradores da Entidade `Semana` utilizando a `RefeicaoFactory` para popular o cardápio.
  - Criar `SemanaCreateRequestDTO` para os fluxos HTTP.
- [ ] **T07 — Implementar `NoticiaFactory`:**
  - Adicionar métodos de geração cobrindo o campo `duracao` com valores entre 1 e 72.
- [ ] **T08 — Implementar `MensagemFactory`:**
  - Criar instâncias que respeitem a regra de autor associado, providenciando o `usuarioId` em cenários de Request.
- [ ] **T09 — Implementar `EstoqueFactory`:**
  - Construir métodos que forneçam DTOs e Entidades válidas para gestão de inventário.

## Refatoração e Adoção

- [ ] **T10 — Refatorar Testes Existentes:** Localizar classes Spec existentes (ex: `UsuarioControllerSpec`, `DtoApiIntegrationTests`) e substituir as instanciações manuais e blocos `set...()` por chamadas diretas às novas Factories.

## Verificação

- [ ] **T11 — Execução da Suite de Testes:** Rodar todos os testes com `mvn test` para garantir que o comportamento da aplicação se mantém inalterado após a troca para as Factories.
- [ ] **T12 — Auditoria de Instâncias:** Assegurar que nenhuma Factory guarda estado global (ausência de variáveis `static` mutáveis) e que cada chamada retorna um novo objeto (isolamento validado).

## Pronto quando

- [ ] O pacote `factory` contém as fábricas para todos os domínios listados em escopo.
- [ ] Todas as fábricas possuem construtores privados e fornecem métodos isolados.
- [ ] Os testes executam com sucesso utilizando objetos providenciados exclusivamente pelas Factories.