# Especificação — Oficinas ou Cursos

## Purpose

Permitir que Gestores publiquem e administrem Oficinas ou Cursos e que visitantes consultem a programação, façam inscrições e gerenciem suas vagas no Portal do Cidadão.

## ADDED Requirements

### Requirement: Campos obrigatórios do evento

Cada evento SHALL exigir título (`title`), tipo, vagas, descrição, data, horário, local, instrutor e custo. O horário SHALL conter início e fim. O tipo SHALL ser Oficina ou Curso e o custo SHALL ser a classificação Pago ou Gratuito.

#### Scenario: Título e descrição

- **WHEN** o Gestor cadastra ou edita um evento
- **THEN** o título aceita até 60 caracteres e pode coincidir com o de outro evento
- **AND** a descrição é obrigatória e aceita texto sem limite de negócio de caracteres

#### Scenario: Local e instrutor

- **WHEN** o Gestor digita local e instrutor
- **THEN** ambos são convertidos para maiúsculas com acentos e aceitam até 150 caracteres cada
- **AND** local aceita texto livre com números e pontuação
- **AND** instrutor aceita apenas letras, incluindo acentuadas, e espaços, com rejeição de números, hífens, apóstrofos e demais pontuações

#### Scenario: Campos ausentes ou inválidos

- **WHEN** algum campo obrigatório está ausente, excede o limite ou contém um valor inválido
- **THEN** a gravação é recusada, o formulário indica os erros e mantém os valores preenchidos

### Requirement: Horário e ciclo do evento

O sistema SHALL interpretar data, horário de início e horário de fim em `America/Fortaleza`, como um intervalo único no mesmo dia. O fim SHALL ser posterior ao início. O Gestor SHALL poder cadastrar e editar eventos até o encerramento, quando a remoção passa a ser a única operação de alteração do evento.

#### Scenario: Cadastrar evento com intervalo válido

- **WHEN** um Gestor cadastra um evento cujo horário de fim ainda está no futuro e o intervalo é válido
- **THEN** o sistema aceita o cadastro em qualquer dia da semana, inclusive fins de semana
- **AND** eventos distintos podem ocupar o mesmo período

#### Scenario: Rejeitar intervalo inválido ou encerrado

- **WHEN** o Gestor informa fim igual ou anterior ao início, ou tenta gravar uma programação que já terminou
- **THEN** o sistema rejeita a gravação

#### Scenario: Editar um evento existente

- **WHEN** o Gestor tenta editar um evento que já terminou
- **THEN** o evento bloqueia a edição e continua disponível para consulta e remoção na lista de gerenciamento

### Requirement: Gerenciamento de Oficinas ou Cursos

Qualquer Gestor autenticado SHALL poder cadastrar, editar, remover e consultar qualquer evento conforme seu estado. O sistema SHALL disponibilizar uma lista de gerenciamento e páginas de cadastro e edição. As rotas e operações administrativas SHALL exigir o papel Gestor.

#### Scenario: Filtrar e ordenar a lista

- **WHEN** o Gestor abre a lista
- **THEN** a lista inclui eventos encerrados por padrão e ordena por data e horário de início em ordem crescente
- **AND** permite filtrar por data, horário de início e horário de fim

#### Scenario: Abrir a lista de inscritos

- **WHEN** o Gestor solicita as inscrições de um evento salvo
- **THEN** um diálogo mostra a lista com CPF, data de nascimento e e-mail completos de cada inscrito
- **AND** o formulário permanece dedicado aos dados do evento

#### Scenario: Remover um evento

- **WHEN** o Gestor solicita a remoção de um evento
- **THEN** o sistema pede confirmação
- **AND** ao confirmar, remove definitivamente o evento e suas inscrições

#### Scenario: Abrir o gerenciamento com outro papel

- **WHEN** um visitante ou uma pessoa autenticada com outro papel acessa o gerenciamento ou suas operações administrativas
- **THEN** o sistema exige autenticação de Gestor e protege os dados de inscritos e as operações de alteração

### Requirement: Capacidade e vagas restantes

A capacidade SHALL ser um inteiro positivo sem teto de negócio. As vagas restantes SHALL resultar da capacidade menos as inscrições ativas. O Gestor SHALL poder aumentar a capacidade e somente poderá diminuí-la enquanto o evento estiver editável e estiver sem inscrições ativas.

#### Scenario: Alterar a capacidade

- **WHEN** o Gestor tenta reduzir a capacidade de um evento com pelo menos uma inscrição ativa
- **THEN** a gravação é rejeitada e as vagas e inscrições permanecem disponíveis com os valores anteriores

#### Scenario: Disponibilizar vagas após alteração

- **WHEN** o Gestor aumenta a capacidade de um evento editável ou uma inscrição é cancelada antes do início
- **THEN** a contagem de vagas restantes reflete os novos dados confirmados

#### Scenario: Concorrência pela última vaga

- **WHEN** múltiplas pessoas solicitam a última vaga simultaneamente
- **THEN** a capacidade limita a confirmação a uma inscrição e as demais solicitações recebem indicação de lotação

### Requirement: Programação pública de Oficinas ou Cursos

O Portal do Cidadão SHALL mostrar a seção “Oficinas ou Cursos” no fim da página inicial. A listagem SHALL apresentar eventos que ainda não terminaram, em ordem crescente de data e início, com todos os campos públicos, capacidade total e vagas restantes. Salvar um evento SHALL publicar a programação imediatamente.

#### Scenario: Consultar a programação sem login

- **WHEN** um visitante abre o Portal do Cidadão
- **THEN** a seção mostra os eventos programados e em andamento, com os nove campos e os dois totais de vagas
- **AND** os dados dos inscritos ficam disponíveis somente pelo gerenciamento do Gestor

#### Scenario: Acompanhar início e fim

- **WHEN** um evento atinge o início
- **THEN** a listagem mantém o evento com indicação de inscrições encerradas
- **AND** quando o evento atinge o fim, ele sai da listagem pública

### Requirement: Inscrição de visitante

Antes do início, o visitante SHALL poder solicitar inscrição sem login em um diálogo pelo botão “Inscrever-se”. O formulário SHALL exigir CPF, data de nascimento e e-mail. Uma inscrição aceita SHALL ser confirmada imediatamente na tela.

#### Scenario: Validar os dados do visitante

- **WHEN** o visitante preenche os dados
- **THEN** o formulário formata o CPF automaticamente e a API verifica seus dígitos verificadores
- **AND** a data de nascimento é válida e o sistema aceita qualquer idade, com e-mail válido que pode ser usado também por outros CPFs

#### Scenario: Aplicar as regras de disponibilidade

- **WHEN** o visitante tenta se inscrever após o início, com o evento lotado, ou com uma inscrição ativa do mesmo CPF no evento ou em outro que se sobreponha
- **THEN** o sistema informa o motivo e protege as inscrições existentes

#### Scenario: Aceitar horários consecutivos

- **WHEN** um evento começa no mesmo instante em que outro termina
- **THEN** a regra de sobreposição permite ao mesmo CPF se inscrever em ambos se houver vaga e os prazos estiverem abertos

#### Scenario: Validar sobreposição em inscrições simultâneas

- **WHEN** duas solicitações com o mesmo CPF tentam obter vagas em eventos sobrepostos
- **THEN** somente uma inscrição é confirmada

### Requirement: Consulta e cancelamento de inscrições

O Portal do Cidadão SHALL oferecer “Minhas inscrições” em linha no fim da página inicial. O visitante SHALL consultar as próprias inscrições ativas mediante CPF e data de nascimento. O visitante e o Gestor SHALL poder cancelar uma inscrição somente antes do início do evento.

#### Scenario: Consultar inscrições próprias

- **WHEN** a pessoa informa CPF e data de nascimento na seção
- **THEN** a lista mostra inscrições correspondentes em eventos que ainda não terminaram
- **AND** eventos em andamento ficam visíveis com o cancelamento desabilitado

#### Scenario: Cancelar e se inscrever novamente

- **WHEN** o visitante cancela uma inscrição própria pela lista ou o Gestor cancela uma inscrição em seu diálogo antes do início
- **THEN** o sistema remove a inscrição ativa e libera a vaga
- **AND** o mesmo CPF pode se inscrever novamente se houver vaga, prazo e compatibilidade de horários

#### Scenario: Bloquear cancelamento fora do prazo

- **WHEN** uma tentativa de cancelamento manual chega no início ou depois dele
- **THEN** o sistema rejeita a operação para visitante e Gestor

### Requirement: Reagendamento com inscrições

O sistema SHALL manter as inscrições ao editar a data ou o horário de um evento, salvo as inscrições que entram em conflito com outro evento do mesmo CPF. Se houver conflito, o sistema SHALL informar o Gestor e pedir confirmação antes de gravar a alteração e remover as inscrições conflitantes do evento reagendado.

#### Scenario: Reagendar sem conflito

- **WHEN** um Gestor salva um novo horário válido para um evento editável e nenhum inscrito passa a ter sobreposição
- **THEN** o evento é atualizado e todas as inscrições acompanham o novo horário

#### Scenario: Reagendar com conflito

- **WHEN** um novo horário causa sobreposição para um ou mais CPFs
- **THEN** o Gestor recebe a quantidade de inscrições a remover e pode confirmar ou desistir
- **AND** só a confirmação válida aplica o novo horário, remove as inscrições conflitantes do evento reagendado e atualiza suas vagas restantes

#### Scenario: Alterar a lista de conflitos antes da confirmação

- **WHEN** as inscrições conflitantes mudam entre o aviso e a confirmação
- **THEN** o sistema solicita uma nova confirmação para a lista atual antes de gravar
