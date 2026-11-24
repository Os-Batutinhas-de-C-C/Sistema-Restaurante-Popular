# Spec Delta

## ADDED Requirements

### Requirement: Acesso e dados da lista de frequência

O Gestor SHALL abrir a lista de frequência de um evento pela tela de gerenciamento e pelo diálogo de inscritos. A lista SHALL apresentar todos os inscritos em ordem de inscrição, com CPF no formato `000.000.000-00`, data de nascimento no formato `dd/MM/yyyy` e e-mail, exibindo “Não informado” se não houver e-mail. Somente o papel Gestor SHALL acessar a frequência.

#### Scenario: Abrir a frequência pelos dois acessos
- **WHEN** o Gestor aciona “Lista de frequência” na linha do evento ou no diálogo de inscritos
- **THEN** o sistema abre a frequência vinculada ao evento selecionado e carrega seus inscritos

#### Scenario: Formatar e ordenar os inscritos
- **WHEN** o Gestor consulta a lista de frequência
- **THEN** os inscritos aparecem da inscrição mais antiga à mais recente, com CPF em `000.000.000-00` e nascimento em `dd/MM/yyyy`

#### Scenario: Evento sem inscritos
- **WHEN** o Gestor abre a frequência de um evento sem inscritos
- **THEN** o sistema exibe o estado vazio e mantém os botões de salvar e exportar desabilitados

#### Scenario: Restringir acesso
- **WHEN** uma pessoa sem sessão válida de Gestor tenta abrir a frequência ou consultar seus dados
- **THEN** a página ou API bloqueia o acesso conforme as regras de autenticação e autorização do módulo

### Requirement: Marcação e persistência da frequência

Cada inscrição SHALL ter frequência Presente ou Ausente, iniciando como Ausente. O Gestor SHALL poder editar e salvar a frequência a partir do início do evento, inclusive após seu encerramento; antes do início, a edição e o salvamento SHALL ficar bloqueados.

#### Scenario: Estado inicial e resumo
- **WHEN** o Gestor abre a lista de frequência
- **THEN** inscrições sem marcação anterior aparecem como Ausente, com a caixa de Presente desmarcada
- **AND** o resumo calcula automaticamente inscritos, presentes e ausentes

#### Scenario: Salvar frequência no horário permitido
- **WHEN** o Gestor salva alterações no horário de início ou depois dele
- **THEN** o sistema persiste os estados dos inscritos do evento no banco e mantém o resumo atualizado

#### Scenario: Corrigir frequência após o encerramento
- **WHEN** o Gestor altera e salva a frequência de um evento encerrado
- **THEN** o sistema persiste a correção e a disponibiliza nas consultas e exportações seguintes

#### Scenario: Bloquear edição antes do início
- **WHEN** o horário atual em `America/Fortaleza` é anterior ao início do evento
- **THEN** o sistema permite consultar os inscritos, mas bloqueia alteração e salvamento da frequência

### Requirement: Busca e ações em lote da frequência

O Gestor SHALL poder filtrar visualmente inscritos por CPF, com ou sem formatação, ou por e-mail, e marcar ou desmarcar todos os inscritos do evento em lote. A busca SHALL afetar somente a visualização; as ações em lote SHALL sempre abranger todos os inscritos.

#### Scenario: Buscar por CPF ou e-mail
- **WHEN** o Gestor informa um CPF formatado ou não, ou um e-mail no campo de busca
- **THEN** a lista exibe os inscritos correspondentes sem alterar a frequência dos demais

#### Scenario: Marcar ou desmarcar todos com busca ativa
- **WHEN** o Gestor aciona “Marcar todos” ou “Desmarcar todos” enquanto há uma busca ativa
- **THEN** o sistema aplica Presente ou Ausente a todos os inscritos do evento, inclusive os que não aparecem no resultado filtrado

### Requirement: Exportação da lista de frequência em PDF

O Gestor SHALL poder baixar em PDF a frequência consolidada de uma oficina ou curso. O documento SHALL incluir os dados completos do evento, todos os inscritos e seus estados salvos, o resumo quantitativo e nenhum campo de assinatura.

#### Scenario: Exportar a lista completa com busca ativa
- **WHEN** o Gestor exporta a lista enquanto há uma busca ativa
- **THEN** o PDF inclui todos os inscritos, sem aplicar o filtro visual

#### Scenario: Conteúdo do PDF
- **WHEN** o Gestor baixa a frequência consolidada
- **THEN** o PDF inclui título, tipo, data, horários, local e instrutor do evento
- **AND** apresenta todos os inscritos em ordem de inscrição, com CPF em `000.000.000-00`, nascimento em `dd/MM/yyyy`, e-mail ou “Não informado” e status de cada inscrito
- **AND** apresenta totais de inscritos, presentes e ausentes, sem campo de assinatura

#### Scenario: Evento sem inscritos
- **WHEN** o Gestor abre a frequência de um evento sem inscritos
- **THEN** o sistema exibe o estado vazio e mantém a exportação em PDF desabilitada
