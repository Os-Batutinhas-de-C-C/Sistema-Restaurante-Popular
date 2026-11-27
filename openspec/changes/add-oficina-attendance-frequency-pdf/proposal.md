# Proposal

## Why

O Gestor já consulta os inscritos de uma oficina, mas não consegue registrar a frequência nem gerar um documento consolidado para manter o histórico institucional. A chamada deve aproveitar os dados de inscrição existentes e ficar vinculada à oficina, com registro persistente e exportação da relação completa.

## What Changes

- Disponibilizar a lista de frequência pelos dois acessos: ação na lista de gerenciamento e botão no modal de inscritos.
- Permitir busca por CPF, com ou sem formatação, e por e-mail; marcar cada inscrito como Presente ou Ausente, com padrão Ausente, além de marcar ou desmarcar todos.
- Exibir CPF, data de nascimento e e-mail dos participantes, mostrando “Não informado” quando não houver e-mail; permitir salvar a frequência no banco por ação explícita do Gestor.
- Permitir alterações a partir do início do evento, inclusive depois de encerrado; bloquear gravação antes do horário de início.
- Exibir totais de inscritos, presentes e ausentes e gerar PDF com os dados do evento, todos os inscritos, seus status e o resumo, sem campo de assinatura.
- Fazer busca afetar somente a visualização. Ações em lote e PDF sempre abrangem todos os inscritos da oficina.

## Capabilities

### New Capabilities

### Modified Capabilities

- `oficinas-ou-cursos`: incluir registro, consulta e exportação da frequência do evento.

## Impact

- Frontend Next.js: gerenciamento de oficinas, modal de inscritos, nova tela de frequência e serviço de oficinas.
- Backend Spring Boot: DTOs, controller, serviço, entidade/repositório de inscrições e autorização Gestor.
- PostgreSQL: persistência do status de frequência por participante, com migração aditiva. O contrato atual de inscrição não muda.
- PDF: o frontend ainda não possui biblioteca de geração de PDF; a escolha técnica será definida no design.
- Requisitos de referência: RF015 e HU026 do Documento de Especificação de Requisitos, versão 1.3 de 22/11/2026, com os comportamentos definidos pelo solicitante.
