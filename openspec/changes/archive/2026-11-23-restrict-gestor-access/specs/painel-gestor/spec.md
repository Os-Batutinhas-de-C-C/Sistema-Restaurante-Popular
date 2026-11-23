# Especificação — Acesso do Gestor

## ADDED Requirements

### Requirement: Consulta autenticada do desperdício diário

O sistema SHALL disponibilizar `GET /api/desperdicio/hoje` para o papel Gestor. A consulta SHALL usar a data do servidor em `America/Fortaleza` e retornar somente `data` (ISO `YYYY-MM-DD`) e `desperdicioKg` (número ou `null`), com base no valor registrado para o dia.

#### Scenario: Dia com registro

- **WHEN** um Gestor autenticado consulta o desperdício de um dia útil que tem registro
- **THEN** a API retorna `200`, a data de hoje em Fortaleza e o valor registrado em quilogramas, incluindo zero como valor válido

#### Scenario: Dia sem registro

- **WHEN** um Gestor autenticado consulta o desperdício e hoje é fim de semana ou a semana ou o registro do dia está ausente
- **THEN** a API retorna `200` com a data de hoje e `desperdicioKg: null`, sem criar ou alterar registros

#### Scenario: Consulta sem autorização

- **WHEN** a consulta é feita sem JWT válido ou com sessão válida de outro papel
- **THEN** a API responde `401` ou `403`, respectivamente

### Requirement: Limites de autorização do Gestor

O sistema SHALL limitar o acesso autenticado do Gestor às consultas do seu painel e à própria conta. O sistema SHALL aplicar o bloqueio nas páginas administrativas e na API. O conteúdo e os serviços públicos SHALL estar disponíveis ao Gestor nas mesmas condições aplicadas a visitantes.

#### Scenario: Abrir uma rota administrativa por URL direta

- **WHEN** o Gestor autenticado abre o Painel Nutricionista, a lista ou edição de cardápios, o estoque, as notícias administrativas ou as mensagens administrativas
- **THEN** o sistema redireciona para `/mainPage` sem renderizar o conteúdo protegido

#### Scenario: Chamar uma operação administrativa pela API

- **WHEN** um Gestor com JWT válido chama uma operação administrativa de semanas (incluindo registro de desperdício), refeições, estoque, notícias, mensagens ou usuários, ou tenta registrar fichas
- **THEN** a API responde `403` antes de retornar dados administrativos ou gravar a operação
- **AND** a regra se aplica também a JWTs válidos de Gestor emitidos antes da mudança

#### Scenario: Consultar indicadores e editar a própria conta

- **WHEN** o Gestor autenticado consulta os indicadores ou usa `GET /api/usuarios/me`, `PUT /api/usuarios/me` ou `PUT /api/usuarios/me/senha`
- **THEN** a API aplica as regras de leitura dos indicadores e as validações existentes de perfil próprio com a identidade do JWT

#### Scenario: Usar serviços públicos

- **WHEN** uma pessoa, inclusive um Gestor, usa o Portal do Cidadão
- **THEN** o portal oferece o cardápio, as notícias, a leitura pública de fichas e o envio anônimo pelo formulário Fale Conosco

## MODIFIED Requirements

### Requirement: Visão operacional do Gestor

O Painel Gestor SHALL usar o padrão visual responsivo dos painéis administrativos e apresentar somente os indicadores diários de fichas entregues e desperdício, ambos para consulta. O painel SHALL usar dados reais referentes ao dia em `America/Fortaleza`.

#### Scenario: Informações do dia

- **WHEN** os dados do dia são carregados
- **THEN** o painel exibe a data, fichas entregues no formato entregue/capacidade com percentual e barra de progresso, e o desperdício registrado em quilogramas
- **AND** a contagem vem da mesma fonte exibida no Caixa e é atualizada pelo mecanismo de consulta vigente

#### Scenario: Ações operacionais existentes

- **WHEN** o Gestor abre o painel
- **THEN** a área de conteúdo apresenta os dois indicadores e um controle de atualização de leitura
- **AND** o cardápio, as ações rápidas e os controles de gravação de fichas ou desperdício ficam indisponíveis nessa página

#### Scenario: Carregamento, ausência de dados e erro

- **WHEN** as consultas estão em andamento, não há desperdício registrado ou uma consulta falha
- **THEN** cada indicador informa seu estado, exibe zero como valor válido e permite nova consulta em caso de falha

#### Scenario: Mudança de data

- **WHEN** a data do servidor avança em Fortaleza
- **THEN** o painel consulta a data atual e evita exibir valores do dia anterior como dados de hoje

#### Scenario: Uso em telas pequenas

- **WHEN** o Gestor usa o painel com largura de 360 px ou mais
- **THEN** seções e controles cabem na largura disponível e a navegação tem rótulos acessíveis e funciona por teclado

### Requirement: Navegação do Gestor e Meu Perfil

O sistema SHALL disponibilizar “Meu Perfil” no cabeçalho do Painel Gestor. No painel e em Meu Perfil, o menu do Gestor SHALL oferecer somente “Início” e “Sair”.

#### Scenario: Abrir a própria conta e voltar ao painel

- **WHEN** o Gestor aciona “Meu Perfil” no painel
- **THEN** o sistema abre `/meuPerfil` na mesma sessão, exibe os dados da própria conta e mostra o nível Gestor como somente leitura
- **AND** o item “Início” volta a `/painel-gestor`

#### Scenario: Retorno a partir de uma tela operacional

- **WHEN** o Gestor, em uma sessão válida, segue um link interno antigo para Cardápios, Estoque, Mensagens ou Notícias administrativas
- **THEN** a rota redireciona para `/mainPage` e a mesma sessão permite voltar a `/painel-gestor`

#### Scenario: Atualizar as credenciais

- **WHEN** o Gestor atualiza o e-mail ou a senha da própria conta conforme as validações existentes e faz novo login
- **THEN** as credenciais atualizadas dão acesso a `/painel-gestor` com o papel Gestor

#### Scenario: Sair

- **WHEN** o Gestor aciona “Sair” na navegação
- **THEN** o sistema encerra a sessão no navegador, abre `/mainPage` e exige autenticação para um novo acesso ao painel
