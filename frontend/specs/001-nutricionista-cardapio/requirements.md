# Requisitos — Painel Nutricionista: Visão Geral e Gráficos

## Objetivo

Exibir o painel principal da nutricionista, contendo o resumo semanal do cardápio para acompanhamento rápido e gráficos gerenciais de fichas vendidas e níveis de desperdício diário.

## Histórias de usuário

### HU03 — Visualização do cardápio semanal (parte 1)
Como nutricionista/gestão,
quero poder visualizar o cardápio da semana em um formato de lista diária,
para ter agilidade no acompanhamento do que está planejado para os próximos dias.

### HU13 — Relatório de desperdício e satisfação (parte visualização)
Como uma nutricionista,
quero acessar gráficos comparativos na minha tela inicial,
para visualizar a relação de fichas vendidas e o nível de desperdício ao longo da semana.

## Regras de negócio

- **RN01:** O acesso a esta tela é restrito a usuários autenticados com o perfil de Nutricionista ou Gestor. Caso não esteja logado, deve ser redirecionado (ref HU006).
- **RN02:** A tela deve exibir os 5 dias úteis da semana (Segunda a Sexta-feira), listando um resumo dos itens do cardápio.
- **RN03:** Dias que ainda não possuem cardápio cadastrado devem exibir a situação como "Pendente".
- **RN04:** O botão de Editar (ícone de lápis) deve redirecionar a nutricionista para a rota de edição de cardápio daquele dia específico. (O gerenciamento será tratado em outra spec).
- **RN05:** O botão de Visualizar (ícone de olho) abre um modal na mesma tela, contendo todos os detalhes dos pratos e o valor calórico estimado da refeição.

## Critérios de aceitação

### Cenário 1 — Visualização da semana atual
**Dado que** a nutricionista acessa o painel inicial  
**Quando** a página é carregada  
**Então** a interface exibe o intervalo da semana atual no seletor, os dois gráficos populados e a lista de cardápios de segunda a sexta.

### Cenário 2 — Visualização de dia sem cardápio
**Dado que** a semana atual não possui cardápio definido para quinta e sexta-feira  
**Quando** a lista semanal é exibida  
**Então** os respectivos dias apresentam o texto "Pendente" no lugar do resumo da refeição, mantendo as ações de visualizar/editar ativas.

### Cenário 3 — Detalhamento da refeição
**Dado que** a nutricionista clica no botão com o ícone de olho de um dia cadastrado  
**Quando** a ação é disparada  
**Então** um modal flutuante é aberto com os detalhes completos da refeição, sem navegar para outra página.

## Restrições
- Como não há integração com backend no momento, os dados dos gráficos (Fichas e Desperdício) e a lista da semana devem ser consumidos de um mock no diretório de `services`.
- Deve utilizar exclusivamente componentes da biblioteca Material UI (MUI).