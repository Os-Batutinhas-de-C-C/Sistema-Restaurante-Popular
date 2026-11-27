# Spec Delta

## MODIFIED Requirements

### Requirement: Programação pública de Oficinas ou Cursos

O Portal do Cidadão SHALL mostrar Oficinas ou Cursos em uma seção da página inicial, integrada à navegação pública e responsiva. A listagem mantém os eventos não encerrados em ordem cronológica, com os campos e vagas definidos no contrato.

#### Scenario: Consultar a programação sem login
- **WHEN** um visitante abre o Portal do Cidadão
- **THEN** a seção mostra os eventos programados e em andamento, com os nove campos e os dois totais de vagas
- **AND** os dados dos inscritos ficam disponíveis somente pelo gerenciamento do Gestor

#### Scenario: Acompanhar início e fim
- **WHEN** um evento atinge o início
- **THEN** a listagem mantém o evento com indicação de inscrições encerradas
- **AND** quando o evento atinge o fim, ele sai da listagem pública

#### Scenario: Acessar oficinas pelo cabeçalho público
- **WHEN** a pessoa seleciona “Oficinas” na navegação do Portal do Cidadão
- **THEN** a página desloca a visualização até a seção de programação de oficinas
- **AND** mantém o cabeçalho público compartilhado do site, sem duplicá-lo dentro da seção

#### Scenario: Exibir programação em telas diferentes
- **WHEN** a pessoa consulta a programação em tela móvel ou desktop
- **THEN** títulos, dados do evento e ações ficam agrupados em cartões legíveis e responsivos
- **AND** a superfície pública usa fundo branco, cabeçalho com marcador circular azul e uma divisória entre programação e inscrições

### Requirement: Gerenciamento de Oficinas ou Cursos

O sistema SHALL disponibilizar uma lista de gerenciamento e páginas de cadastro e edição. As rotas administrativas SHALL exigir o papel Gestor; a lista SHALL manter largura e espaçamentos responsivos para separar os dados do evento das ações.

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

#### Scenario: Acessar oficinas pelo menu do Gestor
- **WHEN** o Gestor abre o menu de navegação
- **THEN** o item aparece como “Oficinas”, com ícone de calendário visível, e abre o gerenciamento

#### Scenario: Gerenciar evento em desktop
- **WHEN** o Gestor consulta a lista de eventos em desktop
- **THEN** as informações do evento e seus controles aparecem alinhados em áreas distintas, com espaçamento suficiente

#### Scenario: Gerenciar evento em tela estreita
- **WHEN** o Gestor consulta a lista de eventos em tela móvel
- **THEN** os controles se reorganizam abaixo dos dados do evento, sem sobreposição ou rolagem horizontal

## ADDED Requirements

### Requirement: Uso de componentes MUI nas telas de oficinas

As telas SHALL usar propriedades suportadas pelos componentes MUI. Propriedades CSS de flexbox, como `justifyContent` e `alignItems`, SHALL ser passadas por `sx` quando usadas em `Stack`, sem vazarem como atributos DOM.

#### Scenario: Renderização das telas sem avisos de propriedade
- **WHEN** o Painel Gestor, a programação pública ou o gerenciamento de eventos é renderizado
- **THEN** propriedades de layout MUI não são encaminhadas ao DOM como atributos desconhecidos
