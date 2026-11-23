# painel-gestor Specification

## Purpose

Dar ao Gestor uma página inicial própria para acompanhar a operação do restaurante e gerenciar as credenciais da sua conta.

## Requirements

### Requirement: Login por papel e acesso ao Painel Gestor

O sistema SHALL direcionar o Gestor para `/painel-gestor` após a autenticação por e-mail e senha. A rota SHALL exigir uma sessão válida com o papel Gestor.

#### Scenario: Login de Gestor

- **WHEN** uma pessoa entra em `/login` com as credenciais válidas de uma conta Gestor
- **THEN** o sistema abre `/painel-gestor` com o título “Painel Gestor”

#### Scenario: Acesso sem sessão válida

- **WHEN** uma pessoa abre `/painel-gestor` sem sessão ou a sessão expira nessa rota
- **THEN** o sistema redireciona para `/login` e protege o conteúdo do painel

#### Scenario: Acesso por outro papel

- **WHEN** uma pessoa autenticada como Nutricionista ou Caixa tenta abrir `/painel-gestor`
- **THEN** o sistema redireciona para `/mainPage` e protege o conteúdo do painel

#### Scenario: Login de Nutricionista ou Caixa

- **WHEN** uma pessoa entra com as credenciais de Nutricionista ou de Caixa
- **THEN** o sistema abre `/painel-nutricionista` ou `/painel-caixa`, respectivamente

### Requirement: Visão operacional do Gestor

O Painel Gestor SHALL usar o padrão visual responsivo dos painéis administrativos. O painel SHALL apresentar os indicadores diários de fichas entregues e desperdício para consulta, além da programação de Oficinas ou Cursos. O dia de referência SHALL usar `America/Fortaleza`.

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

### Requirement: Navegação do Gestor e Meu Perfil

O sistema SHALL disponibilizar “Meu Perfil” no cabeçalho do Painel Gestor. O menu do Gestor SHALL oferecer “Início”, “Oficinas ou Cursos” e “Sair”.

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

#### Scenario: Acessar o gerenciamento pelo menu

- **WHEN** o Gestor escolhe “Oficinas ou Cursos” no menu
- **THEN** o sistema abre o mesmo gerenciamento acessível pelo botão do painel e mantém a sessão

### Requirement: Atualização das próprias credenciais

Em Meu Perfil, o Gestor SHALL poder alterar o e-mail de login e a senha da própria conta conforme as validações existentes, incluindo a senha atual. Após uma alteração de credencial, o sistema SHALL revogar as sessões anteriores e exigir novo login.

#### Scenario: Troca de e-mail

- **WHEN** o Gestor salva um e-mail válido e disponível com a senha atual correta
- **THEN** o sistema persiste o novo e-mail e solicita novo login
- **AND** o Gestor entra com o novo e-mail e a senha atual e retorna ao Painel Gestor

#### Scenario: Troca de senha

- **WHEN** o Gestor informa a senha atual correta e confirma uma nova senha válida
- **THEN** o sistema persiste a alteração e solicita novo login
- **AND** o novo login aceita a nova senha e rejeita a anterior

#### Scenario: Atualização rejeitada

- **WHEN** o Gestor informa a senha atual incorreta, um e-mail já em uso ou uma confirmação de senha divergente
- **THEN** a tela informa o erro, preserva os dados digitados para correção e mantém a credencial vigente

### Requirement: Conta demonstrativa local

O ambiente local SHALL oferecer uma conta demonstrativa Gestor criada mediante configuração explícita, com e-mail fictício e senha inicial temporária. O provisionamento SHALL preservar contas existentes e a senha inicial SHALL ser fornecida ao solicitante fora do repositório.

#### Scenario: Primeiro acesso à conta demonstrativa

- **WHEN** a conta é provisionada no ambiente local e a pessoa usa o par inicial em `/login`
- **THEN** o sistema autentica a conta como Gestor e abre o Painel Gestor

#### Scenario: Reinício depois da atualização de credenciais

- **WHEN** a pessoa altera as credenciais e reinicia a aplicação local após o provisionamento inicial
- **THEN** as credenciais atualizadas continuam válidas e o par inicial continua inválido

#### Scenario: Inicialização sem provisionamento

- **WHEN** a aplicação é iniciada fora do perfil local ou sem configuração explícita de conta demonstrativa
- **THEN** a inicialização ocorre sem criar uma conta demonstrativa

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

O sistema SHALL limitar o acesso autenticado do Gestor às consultas do seu painel, à própria conta e ao gerenciamento de Oficinas ou Cursos. O sistema SHALL aplicar os bloqueios nas páginas administrativas e na API. O conteúdo e os serviços públicos SHALL estar disponíveis ao Gestor nas mesmas condições aplicadas a visitantes.

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
- **THEN** o portal oferece o cardápio, as notícias, a leitura pública de fichas, o envio anônimo pelo formulário Fale Conosco e as operações públicas de Oficinas ou Cursos

#### Scenario: Gerenciar Oficinas ou Cursos

- **WHEN** um Gestor autenticado abre as páginas ou usa a API de gerenciamento de Oficinas ou Cursos
- **THEN** o sistema permite as operações de eventos e inscrições conforme a capacidade `oficinas-ou-cursos`
