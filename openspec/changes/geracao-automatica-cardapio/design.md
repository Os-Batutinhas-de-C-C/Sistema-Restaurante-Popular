# Design

## Context

O gerenciamento diário já carrega a semana atual e o serviço de cardápios transforma semanas salvas em registros de histórico. O formulário possui os nove campos da composição, e a persistência ocorre pelo fluxo explícito de salvar. O botão de geração existe visualmente, mas seu evento não tem comportamento. Ver `proposal.md` para a motivação e `specs/geracao-automatica-cardapio/spec.md` para o contrato observável.

## Goals / Non-Goals

**Goals:**

- Ligar o botão existente ao serviço de gerenciamento de cardápios.
- Reutilizar semanas e refeições históricas como fonte de composições completas.
- Manter a sugestão no estado do formulário até a Nutricionista salvar.
- Evitar sugerir composições que já ocupam outro dia da semana em edição, pois a API atual rejeita refeições repetidas na mesma semana.

**Non-Goals:**

- Criar endpoint, entidade, tabela ou dependência nova.
- Gerar combinações inéditas de ingredientes ou alegar otimização nutricional, de custo ou de estoque.
- Alterar papéis, permissões ou a rota do Gestor.

## Decisions

1. **Selecionar uma refeição histórica completa.** Reutilizar a listagem de semanas e o mapeamento de histórico já existentes. Cada opção corresponde à composição integral de um dia, em vez de combinar campos de refeições distintas; isso preserva combinações conhecidas e mantém o valor calórico associado à refeição. A alternativa de sintetizar combinações novas exigiria dados, regras nutricionais e validação que o sistema não possui.

2. **Filtrar opções elegíveis antes da seleção.** Descartar registros sem composição completa e refeições que já estão atribuídas a outro dia da semana atualmente carregada. Ao gerar outra opção, excluir também a última sugestão gerada enquanto ela continuar elegível. Selecionar uma opção dentre as restantes; se a consulta falhar, apresentar erro, e se não restar opção, informar indisponibilidade sem alterar o formulário. Uma composição histórica previamente salva para o próprio dia selecionado pode ser sugerida novamente.

3. **Manter geração e persistência separadas.** O serviço retorna a sugestão e a tela preenche o estado já usado pelos campos. A geração não chama o fluxo de salvar nem muda a semana persistida; a Nutricionista pode editar a sugestão e salvar com a operação existente. Isso também mantém a revisão humana antes da publicação.

4. **Preservar o contrato de acesso atual.** Reutilizar a consulta autenticada existente, sem liberar operação nova ao Gestor ou a outros papéis. A rota e as operações de cardápio continuam protegidas pelas regras já aplicadas ao gerenciamento da Nutricionista.

## Risks / Trade-offs

- [Histórico pequeno ou sem composições elegíveis] → A geração pode não oferecer opção; informar isso claramente e preservar os valores do formulário.
- [Composições históricas podem não atender às necessidades atuais] → Tratar cada resultado como sugestão editável, sem publicação automática ou afirmação de validação nutricional.
- [Histórico muito extenso aumenta o volume lido pela tela] → Reutilizar a API paginada/filtrada caso já exista no momento da implementação; não introduzir cache ou endpoint de geração sem necessidade demonstrada.

## Migration Plan

Não há migração de dados nem mudança de contrato da API. A interface passa a consultar/selecionar opções do histórico já acessível. Em caso de reversão, o botão pode voltar ao estado sem ação sem alterar registros persistidos.
