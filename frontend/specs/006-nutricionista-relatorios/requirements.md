# Requisitos — Painel Administrativo: Relatórios

## Objetivo

Permitir que a nutricionista ou gestor acompanhe as fichas vendidas e o desperdício de uma semana (gráficos e tabela), registre o desperdício diário e exporte o relatório da semana em PDF ou CSV, para ter controle da quantidade de alimento descartada e facilitar a prestação de contas.

## Histórias de usuário

### HU013 — Relatório de desperdício e satisfação (parte desperdício)
Como nutricionista,
quero acessar uma página com relatórios do grau de desperdício por dia da semana,
para ter maior controle da quantidade de alimento descartada.

### HU014 — Cadastro de informações de desperdício
Como nutricionista,
quero cadastrar o nível de desperdício diário,
para que essas informações sejam utilizadas de forma útil no futuro.

### HU019 — Exportação de relatórios
Como nutricionista,
quero exportar relatórios em PDF ou CSV do período selecionado,
para usá-los em prestações de contas e relatórios.

### RF008 — Gestão de métricas e relatórios
Como nutricionista,
quero registrar o desperdício diário e visualizar gráficos comparativos de fichas vendidas, com a opção de exportar os dados (PDF/CSV),
para facilitar minha prestação de contas institucional e governamental.

## Regras de negócio

- **RN02:** O período é sempre uma semana, de segunda a sexta, escolhida no seletor de datas já existente no projeto. O padrão é a semana atual. A tela exibe sempre 5 dias úteis.
- **RN03:** Os gráficos exibem, por dia, o percentual de Fichas e o de Desperdício, de 0 a 100. Dia sem registro mostra barra zero. [A CONFIRMAR: a base do cálculo dos percentuais]
- **RN04:** A tabela exibe, por dia: dia da semana, data, resumo do cardápio (ou "Pendente"), Fichas e Desperdício (kg). Dia sem dado mostra "-".
- **RN05:** A nutricionista pode corrigir a quantidade de fichas no relatório. O valor é inteiro e maior ou igual a 0; sem backend, a alteração fica no mock desta tela.
- **RN06:** O desperdício (kg) é cadastrado pela nutricionista (HU014). O valor é numérico e maior ou igual a 0. [SUPOSIÇÃO: aceita até 1 casa decimal]
- **RN07:** O botão Editar (lápis) aparece nos cinco dias da semana. A nutricionista pode editar o desperdício (kg) de qualquer dia exibido.
- **RN08:** O modal "Editar relatório do dia" exibe dia e descrição do cardápio somente leitura; Fichas e Desperdício (kg) são editáveis.
- **RN09:** O botão Exportar oferece PDF e CSV e exporta a semana selecionada (ref HU019).
- **RN10:** Satisfação e avaliações (citadas no RF008, na HU013 e na HU019) estão fora desta tela, pois o Figma não as inclui.
- **RN11:** Sem backend, os dados vêm de um mock e a exportação é gerada no navegador. A biblioteca de PDF e o `@mui/x-charts` ficam isolados para fácil remoção.

## Critérios de aceitação

### Cenário 1 — Visualização da semana atual
**Dado que** a nutricionista acessa "Relatórios"
**Quando** a página é carregada
**Então** a interface exibe a semana atual no seletor, os dois gráficos populados e a tabela com os cinco dias úteis.

### Cenário 2 — Troca de semana
**Dado que** a nutricionista escolhe outra semana no seletor
**Quando** a seleção é confirmada
**Então** o período passa a ser a semana de segunda a sexta correspondente, e gráficos e tabela são recarregados.

### Cenário 3 — Dia sem cardápio
**Dado que** quinta e sexta não têm cardápio definido
**Quando** a tabela é exibida
**Então** esses dias mostram "Pendente" no cardápio e "-" em Fichas e Desperdício, com barras zeradas nos gráficos.

### Cenário 4 — Edição do desperdício
**Dado que** a nutricionista clica no lápis de um dia
**Quando** o modal abre, ela informa o desperdício e clica em "SALVAR ALTERAÇÕES"
**Então** o modal fecha, a tabela e o gráfico de desperdício mostram o novo valor e um Snackbar confirma a atualização.

### Cenário 5 — Edição de fichas
**Dado que** o modal "Editar relatório do dia" está aberto
**Quando** a nutricionista altera "Fichas" para um inteiro não negativo e salva
**Então** a tabela, o gráfico e as exportações refletem a nova quantidade.

### Cenário 6 — Validação do desperdício
**Dado que** "Fichas" ou "Desperdício (kg)" está vazio ou inválido
**Quando** a nutricionista observa o botão "SALVAR ALTERAÇÕES"
**Então** o botão está desabilitado.

### Cenário 7 — Cancelar a edição
**Dado que** o modal está aberto com um valor alterado
**Quando** a nutricionista clica em "CANCELAR", pressiona Esc ou clica fora da caixa
**Então** o modal fecha sem salvar e o valor anterior é mantido.

### Cenário 8 — Exportar CSV
**Dado que** a nutricionista clica em "Exportar" e escolhe "CSV"
**Quando** a ação é disparada
**Então** um arquivo CSV da semana selecionada é baixado, com Dia, Data, Cardápio, Fichas e Desperdício (kg).

### Cenário 9 — Exportar PDF
**Dado que** a nutricionista clica em "Exportar" e escolhe "PDF"
**Quando** a ação é disparada
**Então** um PDF com o relatório da semana selecionada é baixado.

## Restrições
- Como não há integração com backend no momento, os dados dos gráficos e da tabela devem ser consumidos de um mock em `src/services/relatoriosService.js`, que também deve alimentar os gráficos do painel principal, para os números não divergirem entre as telas. O mock deve permitir configurar a "data atual" (23/09/2026 para reproduzir o Figma).
- Deve utilizar componentes da biblioteca Material UI (MUI). Exceções: `@mui/x-charts` (família MUI, para os gráficos) e uma biblioteca de PDF, esta temporária, isoladas conforme o Design.
- O seletor de período deve reaproveitar o seletor de datas já existente no projeto.
- Deve atender à RNF001 e à HU001: mobile-first, a partir de 360px, sem rolagem horizontal.

## Pendências com o cliente
- Base do cálculo dos percentuais: Fichas (vendidas sobre o total do dia, como as 300 do RNF005?) e Desperdício (kg sobre o total preparado?). Os percentuais e a coluna em kg mostram unidades diferentes.
- Satisfação e avaliações (RF008, HU013, HU019) ainda não têm tela.
- O seletor de datas existente permite escolher uma semana inteira, ou precisa ser adaptado?
- Layout do PDF: só a tabela ou também os gráficos? E o que deve ir no cabeçalho (nome do restaurante, período)?
