# Spec Delta

## Purpose

Permitir que a Nutricionista obtenha rapidamente uma sugestão de composição para o dia em edição, reaproveitando cardápios já cadastrados e mantendo a decisão de revisar e salvar sob seu controle.

## ADDED Requirements

### Requirement: Gerar sugestão para o dia em edição
O sistema SHALL permitir que a Nutricionista gere uma sugestão de cardápio para o dia selecionado, usando composições completas já registradas no histórico.

#### Scenario: Gerar uma sugestão disponível
- **WHEN** a Nutricionista aciona “Gerar Cardápio” e há uma composição histórica disponível para o dia
- **THEN** o sistema preenche os campos do formulário com a sugestão e mantém o dia selecionado
- **AND** a composição inclui os campos disponíveis da refeição, inclusive o valor calórico estimado

#### Scenario: Gerar outra sugestão
- **WHEN** a Nutricionista aciona novamente “Gerar Cardápio” enquanto outra sugestão elegível está disponível
- **THEN** o sistema apresenta uma composição histórica elegível diferente da sugestão anterior

### Requirement: Revisar e salvar a sugestão
Uma sugestão gerada SHALL permanecer como edição não salva até que a Nutricionista a revise e acione “Salvar Cardápio”.

#### Scenario: Editar sugestão antes de salvar
- **WHEN** a Nutricionista altera um ou mais campos preenchidos pela geração
- **THEN** o formulário mantém as alterações e salva somente os valores atuais quando “Salvar Cardápio” é acionado

#### Scenario: Descartar a sugestão sem salvar
- **WHEN** a Nutricionista navega para outro dia ou semana antes de salvar a sugestão
- **THEN** a sugestão não é persistida como cardápio daquele dia

### Requirement: Tratar ausência de sugestão
Quando não houver uma composição histórica elegível, o sistema SHALL informar a Nutricionista sem persistir alterações nem substituir os valores atuais do formulário.

#### Scenario: Histórico sem composições disponíveis
- **WHEN** a Nutricionista aciona “Gerar Cardápio” e não há composição histórica elegível
- **THEN** o sistema informa que não há sugestões disponíveis e preserva o formulário atual

### Requirement: Restringir a geração às permissões de cardápio
A geração SHALL estar disponível no gerenciamento de cardápios da Nutricionista e respeitar os controles de autenticação e autorização existentes para leitura do histórico e gravação de cardápios.

#### Scenario: Gestor tenta gerar sugestão pela rota administrativa
- **WHEN** uma sessão Gestor tenta acessar o gerenciamento de cardápios ou a operação protegida de geração
- **THEN** o sistema bloqueia o acesso conforme as regras existentes para cardápios e não altera dados
