# Proposta — Oficinas ou Cursos

## Why

O Restaurante Popular precisa divulgar Oficinas ou Cursos e organizar as vagas pelo Portal do Cidadão. O Gestor precisa acompanhar a programação e administrar eventos e inscrições em uma área própria.

## What Changes

- Adicionar o catálogo de Oficinas ou Cursos com os nove campos obrigatórios e dois horários para o intervalo do evento no mesmo dia, em Fortaleza.
- Permitir a qualquer Gestor cadastrar, editar e remover eventos. A área de gerenciamento oferece uma lista com filtros de data, horário de início e horário de fim, páginas de formulário e um diálogo para consultar e cancelar inscrições.
- Publicar eventos ao salvar e exibir os que ainda não terminaram no fim da página inicial do Portal do Cidadão e no Painel Gestor. O painel oferece um botão para abrir o gerenciamento, que também fica no menu.
- Permitir inscrição sem login por CPF, data de nascimento e e-mail, com confirmação na tela e cálculo de vagas restantes. Em “Minhas inscrições”, o visitante consulta pelo CPF e data de nascimento e pode cancelar antes do início.
- Aplicar em conjunto as regras de lotação, CPF único por evento, sobreposição de horários e confirmação de remoções em caso de reagendamento.

## Capabilities

### New Capabilities

- `oficinas-ou-cursos` — Cadastro, publicação, gerenciamento e inscrições em Oficinas ou Cursos.

### Modified Capabilities

- `painel-gestor` — Leitura dos eventos no painel, botão e menu de gerenciamento e autorização para as operações de Oficinas ou Cursos. O delta segue a versão aplicada em [`restrict-gestor-access`](../2026-11-23-restrict-gestor-access/specs/painel-gestor/spec.md).

## Impact

- Frontend Next.js — seção pública, diálogo de inscrição, consulta de inscrições, área de gerenciamento e navegação do Gestor.
- Backend Spring Boot — contratos públicos e autenticados, validação de horários e vagas, e operações transacionais de inscrição e reagendamento.
- PostgreSQL — persistência de eventos e inscrições com vínculo por evento.
