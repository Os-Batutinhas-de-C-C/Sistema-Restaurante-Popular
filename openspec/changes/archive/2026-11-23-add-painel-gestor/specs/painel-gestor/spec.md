# Especificação — Painel Gestor

## Purpose

Dar ao Gestor uma página inicial própria para acompanhar a operação do restaurante e gerenciar as credenciais da sua conta.

## ADDED Requirements

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

O Painel Gestor SHALL usar o padrão visual responsivo dos painéis administrativos e apresentar o cardápio, o desperdício e as fichas entregues do dia com dados reais. As ações operacionais SHALL usar as permissões vigentes do Gestor.

#### Scenario: Informações do dia

- **WHEN** os dados do dia em `America/Fortaleza` são carregados
- **THEN** o painel exibe a data, o cardápio e o desperdício disponíveis, além das fichas entregues no formato entregue/capacidade, com percentual e barra de progresso
- **AND** o Gestor consulta a contagem de fichas, cujo registro é exclusivo do Caixa

#### Scenario: Ações operacionais existentes

- **WHEN** o Gestor escolhe publicar notícia, atualizar estoque ou registrar o desperdício do dia
- **THEN** a ação abre a tela ou o diálogo existente, sujeito às regras em vigor

#### Scenario: Carregamento, ausência de dados e erro

- **WHEN** as consultas estão em andamento, retornam sem cardápio ou falham
- **THEN** o painel informa o estado correspondente, trata zero fichas como um resultado válido e oferece nova consulta em caso de falha

#### Scenario: Uso em telas pequenas

- **WHEN** o Gestor usa o painel com largura de 360 px ou mais
- **THEN** seções e controles cabem na largura disponível e a navegação tem rótulos acessíveis e funciona por teclado

### Requirement: Navegação do Gestor e Meu Perfil

O sistema SHALL disponibilizar “Meu Perfil” no cabeçalho do Painel Gestor. Ao navegar por Meu Perfil e pelas telas operacionais compartilhadas, o Gestor SHALL contar com um item “Início” que retorna a `/painel-gestor` e com “Sair” para encerrar a sessão.

#### Scenario: Abrir a própria conta e voltar ao painel

- **WHEN** o Gestor aciona “Meu Perfil” no painel
- **THEN** o sistema abre `/meuPerfil` na mesma sessão, exibe os dados da própria conta e mostra o nível Gestor como somente leitura
- **AND** o item “Início” volta a `/painel-gestor`

#### Scenario: Retorno a partir de uma tela operacional

- **WHEN** o Gestor aciona “Início” em Cardápios, Estoque, Mensagens ou Notícias
- **THEN** o sistema volta ao Painel Gestor na mesma sessão

#### Scenario: Sair

- **WHEN** o Gestor aciona “Sair” na navegação
- **THEN** o sistema encerra a sessão no navegador, abre `/mainPage` e exige autenticação para um novo acesso ao painel

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
