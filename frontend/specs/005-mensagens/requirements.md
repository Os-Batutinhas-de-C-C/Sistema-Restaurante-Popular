# Requisitos — Painel Administrativo: Mensagens (Fale Conosco)

## Objetivo

Permitir que a nutricionista ou gestor consulte as mensagens enviadas pelos clientes pelo formulário "Fale Conosco" em um período e leia o conteúdo completo de cada uma, para fechar o ciclo de atendimento e ter controle do feedback gerado.

## Histórias de usuário

### RF010 — Gestão de mensagens do "Fale Conosco"
Como nutricionista,
quero acessar o painel "Mensagens" para ler e acompanhar os relatos enviados pelos clientes,
para fechar o ciclo de atendimento e ter controle do feedback gerado no formulário (RF006).

### HU011 (parte administrativa) — Canal de contato com a gestão
Como administrador,
quero receber no painel de mensagens o que os clientes enviam pelo formulário,
para acompanhar problemas, dúvidas e sugestões sobre o restaurante.

> O SRS não tem uma HU exclusiva para a tela administrativa de mensagens. Esta spec usa o RF010 e a parte administrativa da HU011. Se a equipe criar uma HU própria, trocar as referências.

## Regras de negócio

- **RN01:** O acesso a esta tela é restrito a usuários autenticados com o perfil de Nutricionista ou Gestor. Caso não esteja logado, deve ser redirecionado para a tela de login (ref HU006).
- **RN02:** A lista exibe as mensagens do período selecionado, da mais recente para a mais antiga. [SUPOSIÇÃO]
- **RN03:** Cada mensagem exibe data, hora, título e descrição (texto truncado). A mensagem do cliente tem texto obrigatório e nome opcional (ref HU011).
- **RN04:** O botão Visualizar (ícone de olho) abre um modal na mesma tela com o conteúdo completo da mensagem, sem navegar para outra página.
- **RN05:** As mensagens são somente leitura nesta tela: não há edição nem exclusão. [SUPOSIÇÃO: o RF010 só prevê "ler e acompanhar"]
- **RN06:** [A CONFIRMAR] O botão de envelope (responder) depende de o cliente ter informado um contato, o que o formulário da HU011 não coleta hoje. Enquanto não houver decisão, o botão fica desabilitado com Tooltip "Cliente não informou contato". [SUPOSIÇÃO]

## Critérios de aceitação

### Cenário 1 — Visualização da lista
**Dado que** a nutricionista acessa "Mensagens"
**Quando** a página é carregada
**Então** a interface exibe o período padrão no filtro e a lista de mensagens com data, hora, título e descrição truncada.

### Cenário 2 — Filtro por período
**Dado que** a nutricionista altera o período no filtro
**Quando** o novo intervalo é aplicado
**Então** a lista exibe apenas as mensagens recebidas no intervalo, da mais recente para a mais antiga.

### Cenário 3 — Visualização da mensagem
**Dado que** a nutricionista clica no ícone de olho de uma mensagem
**Quando** a ação é disparada
**Então** um modal abre com data/hora de envio, título e texto completo, sem navegar para outra página, e fecha ao clicar em "Fechar", em Esc ou fora da caixa.

### Cenário 4 — Mensagem sem nome do remetente
**Dado que** o cliente não informou o nome ao enviar a mensagem
**Quando** a nutricionista abre a mensagem
**Então** o remetente aparece como "Não informado". [SUPOSIÇÃO]

### Cenário 5 — Período sem mensagens
**Dado que** o período selecionado não possui mensagens
**Quando** a lista é exibida
**Então** aparece a mensagem "Nenhuma mensagem no período selecionado."

### Cenário 6 — Acesso sem autenticação
**Dado que** o usuário não está logado
**Quando** tenta acessar a tela de mensagens
**Então** é redirecionado para a tela de login.

## Restrições
- Como não há integração com backend no momento, os dados devem ser consumidos de um mock no diretório `services` (`src/services/mensagensService.js`), com a função de listar por período.
- Deve utilizar exclusivamente componentes da biblioteca Material UI (MUI).
- Deve atender à RNF001 e à HU001: mobile-first, a partir de 360px, sem rolagem horizontal.

## Pendências com o cliente
- O envelope da tela deve responder ao cliente? Se sim, o formulário da HU011 precisa de um campo de contato (e-mail), hoje inexistente.
- O RF010 diz "acompanhar" as mensagens: isso inclui marcar como lida/respondida? Hoje a spec não prevê status.
- O RF010 cita o formulário como "RF005", mas o formulário é o RF006 (provável erro de numeração no SRS).
- O formulário da HU011 só coleta mensagem e nome, mas a tabela tem coluna "Título": o título é um campo novo do formulário ou derivado do texto?