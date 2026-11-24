# Spec Delta

## Purpose

Oferece aos visitantes do portal controles integrados de acessibilidade visual e auditiva e acesso ao apoio de tradução em Libras, com operação por teclado e adaptação a telas pequenas.

## ADDED Requirements

### Requirement: Controles visuais de fonte
O frontend SHALL oferecer controles acessíveis para reduzir, restaurar e ampliar o tamanho do texto, aplicados ao conteúdo do portal sem impedir o uso das páginas.

#### Scenario: Ajustar tamanho do texto
- **WHEN** a pessoa seleciona A-, A ou A+
- **THEN** o tamanho do texto diminui, retorna ao padrão ou aumenta, respectivamente, e a interface indica o controle selecionado

#### Scenario: Limites do ajuste
- **WHEN** a pessoa tenta reduzir ou ampliar além dos limites suportados
- **THEN** o tamanho permanece no menor ou maior nível disponível e o controle correspondente fica indisponível ou claramente inativo

### Requirement: Alto contraste persistente
O frontend SHALL disponibilizar um controle de alto contraste cuja preferência permaneça ativa entre páginas e visitas subsequentes no mesmo navegador.

#### Scenario: Ativar e restaurar alto contraste
- **WHEN** a pessoa ativa o alto contraste e navega ou retorna ao portal
- **THEN** as cores de alto contraste são aplicadas e a preferência é restaurada até que seja desativada

#### Scenario: Persistência indisponível
- **WHEN** o navegador não permite armazenar a preferência
- **THEN** o controle continua funcionando durante a sessão atual sem impedir o uso do portal

### Requirement: Leitura em voz alta
O frontend SHALL permitir iniciar e interromper a leitura em voz alta do conteúdo principal usando a síntese de fala disponível no navegador e solicitar português do Brasil quando houver uma voz compatível.

#### Scenario: Iniciar leitura
- **WHEN** a pessoa inicia a leitura em uma página com conteúdo legível e a API está disponível
- **THEN** o conteúdo principal é lido em voz alta, priorizando uma voz pt-BR, e o controle comunica que a leitura está ativa

#### Scenario: Interromper leitura
- **WHEN** a pessoa interrompe a leitura ou inicia outra página
- **THEN** a fala em andamento é cancelada e o controle retorna ao estado inativo

#### Scenario: API indisponível
- **WHEN** o navegador não oferece a API de síntese de fala
- **THEN** a leitura fica indisponível e a interface informa isso de forma compreensível

### Requirement: Tradução de apoio em Libras
O frontend SHALL disponibilizar o widget gratuito VLibras nas páginas do portal e preservar a navegação quando o serviço externo não puder ser carregado.

#### Scenario: Widget disponível
- **WHEN** o widget VLibras termina de carregar
- **THEN** seu controle fica disponível para a pessoa abrir a tradução em Libras

#### Scenario: Serviço externo indisponível
- **WHEN** o script ou widget VLibras falha ao carregar
- **THEN** as demais páginas e controles de acessibilidade continuam utilizáveis

### Requirement: Barras agrupadas, recolhíveis e acessíveis
A barra de baixa visão SHALL ficar fixa à esquerda, imediatamente ao lado do botão do widget VLibras, e permitir ocultar e reexibir os controles por uma seta, mantendo-se dentro da largura da tela.

#### Scenario: Operar controles por teclado
- **WHEN** a pessoa percorre as barras usando teclado
- **THEN** cada controle pode receber foco, tem nome acessível, apresenta foco visível e a seta comunica seu estado expandido

#### Scenario: Recolher e reexibir controles
- **WHEN** a pessoa aciona a seta para ocultar ou mostrar a barra
- **THEN** os controles de baixa visão são ocultados ou reexibidos, permanecendo disponível uma seta acessível para reabri-los

#### Scenario: Exibição em tela estreita
- **WHEN** a página é exibida em viewport estreito
- **THEN** as barras ficam no lado esquerdo, sem causar rolagem horizontal; recolhida, a barra libera espaço para o conteúdo



