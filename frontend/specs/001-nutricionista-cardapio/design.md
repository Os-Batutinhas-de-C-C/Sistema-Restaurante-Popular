# Design — Painel Nutricionista: Visão Geral e Gráficos

## Objetivo da experiência

A nutricionista deve conseguir acompanhar, em uma única visualização, o planejamento do cardápio da semana e as métricas operacionais (fichas e desperdício) através de gráficos de barras simples, em qualquer dispositivo.

## Histórias atendidas

- **HU03:** A nutricionista visualiza o resumo da semana para ter clareza sobre o que está pronto ou pendente.
- **HU13:** A nutricionista visualiza os níveis de desperdício diário comparados no gráfico da tela inicial.

## Fluxo principal

1. A pessoa acessa o painel logado da nutricionista.
2. O sistema exibe os gráficos à esquerda (ou topo no mobile) e a lista da semana à direita (ou base no mobile).
3. A pessoa clica no ícone de "Visualizar" (olho) de um cardápio específico.
4. O sistema abre um Dialog (modal) contendo os pratos detalhados e botão para fechar.

## Estrutura da interface

*(Nota: A Navbar já existe e deve envolver o conteúdo principal)*

1. **Seção de Gráficos (Métricas)**
   - Título/Legendas: "Fichas" (cor azul) e "Desperdício" (cor laranja).
   - Eixo X com dias da semana ("Seg", "Ter", "Qua", "Qui", "Sex") e Eixo Y de 0 a 100.
   - Apresentação em formato de barras verticais.

2. **Seção de Cardápios (Lista Semanal)**
   - Título: "Cardápios".
   - Controle de filtro: Input "Selecione a Semana" ladeado por botões "< Anterior" e "Próxima >".
   - Lista: 5 blocos correspondentes aos dias úteis. Cada bloco possui o dia da semana, a data (ex: 21/09/2026), um texto truncado de resumo da refeição ou texto "Pendente", e as ações (Editar e Visualizar).

3. **Modal "Visualizar Refeição" (MUI Dialog)**
   - Título: Dia da semana e data.
   - Corpo: Lista corrida de todos os itens do prato e a frase "Valor Calórico Estimado (kcal): [valor]".
   - Rodapé: Botão de ação "Fechar" (texto alinhado à direita).

## Campos e controles

### Botão de Navegação Semanal (Anterior / Próxima)
- Tipo: MUI Button (variante contida).
- Comportamento: Atualiza os dados da tela renderizando a semana anterior ou seguinte.

### Botão de Ação: Editar
- Tipo: MUI IconButton (variante preenchida arredondada, ícone de lápis - Lucide ou Material Icons).
- Comportamento: Redireciona via Next Router para a rota `/admin/cardapio/gerenciar/[data]`.

### Botão de Ação: Visualizar
- Tipo: MUI IconButton (variante preenchida arredondada, ícone de olho).
- Comportamento: Abre o estado booleano do Modal para `true`.

## Estados da interface

- **Carregando:** Exibir MUI Skeleton sobre os gráficos e as listas de dias da semana para evitar pulos de layout durante fetch.
- **Sucesso:** Interface limpa com os cards preenchidos.
- **Vazio:** O texto truncado do cardápio exibe de forma sutil a palavra "Pendente" (ref Figma).

## Responsividade

- **Desktop (telas maiores):** Layout dividido em duas colunas centrais. Coluna esquerda ocupando aprox. 40% (Gráficos empilhados) e coluna direita 60% (Lista de cardápios).
- **Mobile (a partir de 360px):** Layout em coluna única. A seção de gráficos aparece no topo e a lista de cardápios vem logo abaixo. Botões de ação da lista devem ter tamanho acessível (touch target de no mínimo 44x44px).

## Acessibilidade

- Os ícones de editar e visualizar devem possuir a propriedade `aria-label` descritiva (ex: `aria-label="Editar cardápio de quarta-feira"`).
- O Modal ao ser aberto deve aplicar foco inicial automático internamente e possuir `aria-labelledby` apontando para o título.