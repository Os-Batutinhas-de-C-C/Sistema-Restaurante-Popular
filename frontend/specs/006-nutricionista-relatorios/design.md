# Design — Relatórios do Painel Nutricionista

## Fontes da especificação

- [Requisitos funcionais e de interface](./requirements.md)
- [Tarefas de implementação](./tasks.md)
- [Prompt de implementação](./prompt.md)
- [Prompts gerais do frontend](../../prompts.md)
- Referências visuais: [relatorio.png](../../docs/interface/relatorio.png) e
  [relatorio-painel.png](../../docs/interface/relatorio-painel.png)

## Objetivo

Permitir que a nutricionista acompanhe fichas e desperdício por dia, consulte os
dados por período, corrija os valores registrados e exporte o relatório. A tela
mantém a composição das referências: título, filtro e exportação, gráficos de
barras lado a lado e tabela diária, com um diálogo para editar o registro.

## Fluxo principal

1. A pessoa acessa Relatórios pelo menu do Painel Nutricionista.
2. O período padrão mostra os dados da semana de 21 a 25/09/2026.
3. A pessoa altera o intervalo e consulta os gráficos e linhas correspondentes.
4. Ao selecionar a ação de edição, o diálogo apresenta os dados daquele dia.
5. Ao salvar valores válidos, a tabela e os gráficos refletem a atualização.
6. A pessoa exporta os registros do período em CSV ou abre a impressão do
   relatório para salvá-lo como PDF.

## Estrutura e responsabilidades

- `src/app/painel-nutricionista-relatorio/page.js`: contêiner da rota.
- `src/components/painel-nutricionista-relatorios/`: página visual, filtros,
  tabela, integração do gráfico existente e diálogo de edição.
- `src/services/relatoriosService.js`: mocks de fichas, desperdício, sobras e
  satisfação; filtragem por período; agregações; validação e atualização;
  geração/exportação de CSV e conteúdo imprimível para PDF.
- `src/components/NavbarPainel/` e `src/components/SeletorIntervaloDatas/`:
  componentes compartilhados reutilizados.
- `src/components/painelNutricionistaCardapio/GraficosCardapio/`: gráfico
  compartilhado de fichas e desperdício.
- `src/app/painel-nutricionista/relatorios/page.js`: compatibilidade legada por
  redirecionamento para a rota principal.

Os dados de sobras e satisfação fazem parte do modelo e dos indicadores
calculados pelo serviço. A composição visual permanece alinhada às referências,
que exibem os gráficos de fichas e desperdício e o detalhamento diário.

## Apresentação e acessibilidade

- O conteúdo usa uma coluna centralizada, fundo cinza-claro e cards brancos com
  bordas suaves.
- O período usa o seletor de intervalo já disponível no projeto.
- O botão Exportar oferece CSV e PDF sem alterar a hierarquia visual principal.
- Os controles de edição possuem rótulos acessíveis; o diálogo identifica seu
  título e exibe mensagens de validação.
- Em telas estreitas, filtros e campos do diálogo empilham; a tabela mantém
  rolagem horizontal dentro do próprio cartão.

## Decisões de implementação

- Não foi adicionada biblioteca de gráficos, datas ou PDF: são reutilizados os
  componentes existentes, e a exportação PDF usa a impressão do navegador.
- A rota legada redireciona à nova para não quebrar links existentes.
- A implementação segue as APIs e dependências Material UI já instaladas no
  frontend, evitando alteração não solicitada de versões do projeto.
