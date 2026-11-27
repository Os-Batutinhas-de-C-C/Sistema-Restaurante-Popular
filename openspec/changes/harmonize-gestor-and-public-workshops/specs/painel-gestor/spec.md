# Spec Delta

## MODIFIED Requirements

### Requirement: Visão operacional do Gestor

O Painel Gestor SHALL manter seus indicadores diários e a programação de Oficinas ou Cursos em um layout responsivo. O dia de referência SHALL usar `America/Fortaleza`.

#### Scenario: Informações do dia
- **WHEN** os dados do dia são carregados
- **THEN** o painel exibe a data, fichas entregues no formato entregue/capacidade com percentual e barra de progresso, e o desperdício registrado em quilogramas
- **AND** a contagem vem da mesma fonte exibida no Caixa e é atualizada pelo mecanismo de consulta vigente

#### Scenario: Ações operacionais existentes
- **WHEN** o Gestor abre o painel
- **THEN** a área de conteúdo apresenta os dois indicadores, um controle de atualização de leitura e a seção “Oficinas ou Cursos”
- **AND** o cardápio, as ações rápidas da Nutricionista e os controles de gravação de fichas ou desperdício ficam indisponíveis nessa página

#### Scenario: Carregamento, ausência de dados e erro
- **WHEN** as consultas estão em andamento, não há desperdício registrado ou uma consulta falha
- **THEN** cada indicador informa seu estado, exibe zero como valor válido e permite nova consulta em caso de falha

#### Scenario: Mudança de data
- **WHEN** a data do servidor avança em Fortaleza
- **THEN** o painel consulta a data atual e evita exibir valores do dia anterior como dados de hoje

#### Scenario: Uso em telas pequenas
- **WHEN** o Gestor usa o painel com largura de 360 px ou mais
- **THEN** seções e controles cabem na largura disponível e a navegação tem rótulos acessíveis e funciona por teclado

#### Scenario: Consultar a programação no painel
- **WHEN** o Gestor abre o painel
- **THEN** a seção mostra os eventos que ainda não terminaram com os mesmos campos, totais de vagas e ordenação da listagem pública
- **AND** um botão abre a tela de gerenciamento de “Oficinas ou Cursos”

#### Scenario: Painel em desktop
- **WHEN** o Gestor abre o painel em uma tela desktop
- **THEN** os indicadores e a programação usam a largura de conteúdo disponível sem ficarem comprimidos em uma coluna estreita
- **AND** o título, a data e a ação de atualização aparecem organizados no cabeçalho

#### Scenario: Painel em tela estreita
- **WHEN** o Gestor abre o painel em uma tela móvel
- **THEN** título, data, botão e indicadores são empilhados sem sobreposição ou rolagem horizontal

#### Scenario: Atualizar indicadores
- **WHEN** o Gestor solicita uma atualização manual
- **THEN** a ação é apresentada como botão MUI pequeno e contornado, com ícone e horário da última atualização no formato usado pelos outros painéis
- **AND** o botão solicita nova consulta dos indicadores existentes
