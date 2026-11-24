# Design

## Context

Consulte `proposal.md` para a motivação e `specs/oficinas-ou-cursos/spec.md` para o contrato funcional. O Gestor já abre `DialogoInscritos` a partir de `GerenciarOficinas`; `OficinaController` concentra o recurso sob `/api/oficinas-ou-cursos/**`, protegido para Gestor. `InscricaoOficina` já relaciona participante e evento e guarda CPF, nascimento e e-mail. A tela usa MUI e o serviço `oficinasService.js`. O projeto ainda não tem geração de PDF.

## Goals / Non-Goals

**Goals:**

- Persistir a presença como parte da inscrição no evento, com atualização em lote e autorização existente.
- Apresentar a chamada em uma tela própria do Gestor, alcançável pelo gerenciamento e pelo diálogo de inscritos.
- Gerar PDF paginado no navegador com a relação completa e o último estado salvo.

**Non-Goals:**

- Alterar validação, campos ou persistência do cadastro de inscrição.
- Adicionar nome, leitura de comprovante/QR Code ou assinatura digital/manual.
- Permitir edição de frequência antes do início do evento.

## Decisions

### Estado e persistência no domínio

Adicionar `presente BOOLEAN NOT NULL DEFAULT FALSE` a `inscricoes_oficinas_ou_cursos`, refletido como booleano na entidade e DTO. A associação já representa uma pessoa inscrita em um evento de ocorrência única; não é necessário introduzir uma tabela de sessões de frequência. O valor padrão mantém inscrições existentes como Ausente e a caixa de Presente desmarcada.

Uma migração SQL aditiva cria a coluna com `NOT NULL DEFAULT FALSE`. Não alterar a coluna nem a validação atual do e-mail. Em um rollback de código, manter a coluna e os dados de frequência; removê-la durante rollback descartaria o histórico.

### Contratos de frequência

Adicionar `GET /api/oficinas-ou-cursos/{id}/frequencia` para retornar os dados do evento e todos os inscritos com estado salvo, e `PUT /api/oficinas-ou-cursos/{id}/frequencia` para substituir atomicamente o conjunto de estados do evento. O corpo do `PUT` contém os IDs de inscrição e seus valores booleanos. Rejeitar IDs duplicados ou pertencentes a outro evento; validar que a lista corresponde às inscrições atuais antes de persistir.

Aplicar a autorização Gestor já existente para `/api/oficinas-ou-cursos/**`. No service, validar o início do evento usando o `Clock` em `America/Fortaleza`; leitura permanece disponível antes do início, mas o `PUT` só aceita alterações no início ou depois. Usar uma transação para persistir o lote completo, de modo que uma falha não deixe presença parcialmente gravada. Responder ao GET com `Cache-Control: no-store`, como a consulta de inscritos atual.

### Tela e navegação

Criar a rota protegida `/painel-gestor/oficinas-ou-cursos/{id}/frequencia`, usando `PaginaOficinasGestor` e controles MUI existentes. Adicionar links para ela na linha de cada evento em `GerenciarOficinas` e no `DialogoInscritos`. A tela carrega evento e inscrições pelo endpoint de frequência, mantém o estado editado localmente e salva o lote pelo serviço `oficinasService.js`.

A busca opera no cliente, normalizando o CPF para comparar apenas dígitos e comparando e-mail sem diferenciar maiúsculas/minúsculas. “Marcar todos” e “Desmarcar todos” atualizam o estado local de toda a lista, não somente os resultados visíveis. O resumo também conta toda a lista. Antes do início, controles de presença e salvar ficam desabilitados. Erros de carregamento/salvamento permanecem visíveis sem descartar a edição local.

Manter a tela responsiva para a lista de participantes; formatar o CPF como `000.000.000-00` e a data de nascimento como `dd/MM/yyyy`, usando “Não informado” como fallback defensivo para e-mail nulo ou vazio sem mudar o contrato de inscrição. Preservar a ordem de inscrição, da mais antiga à mais recente, na API, na tela e no PDF. Quando não houver inscritos, exibir estado vazio, resumo com zero e manter salvar e exportar desabilitados.

### Exportação PDF

Gerar o arquivo no cliente com `jsPDF` e `jspdf-autotable`, carregados apenas quando a ação de exportação for solicitada. O AutoTable produz tabelas e paginação, e o jsPDF oferece salvamento do arquivo no navegador; isso evita criar uma rota de documento e evita transmitir novamente dados pessoais a outro serviço. Referências oficiais: [jsPDF](https://github.com/parallax/jsPDF) e [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable).

Usar orientação paisagem para acomodar CPF, nascimento, e-mail e status. Repetir o cabeçalho da tabela nas páginas seguintes e incluir os dados completos do evento e o resumo quantitativo. Formatar CPF em `000.000.000-00` e nascimento em `dd/MM/yyyy`. A exportação sempre usa todos os inscritos na ordem de inscrição e os estados do último GET/salvamento; a busca visual não filtra o arquivo. Desabilitar exportação enquanto houver alterações locais não salvas e orientar o Gestor a salvar antes. Com lista vazia, manter os controles de salvar e exportar desabilitados.

## Risks / Trade-offs

- **A lista pode conter muitos inscritos ou textos longos** → paginar a tabela, repetir cabeçalhos e testar quebra de e-mails e nomes de locais/instrutores longos.
- **Uma inscrição pode ser removida antes do início** → salvar somente IDs de inscrições ainda vinculadas ao evento e recarregar a lista após erro de conflito.
- **Dados pessoais aparecem no PDF local** → gerar o arquivo apenas após autorização Gestor, evitar armazená-lo no servidor e usar o último conjunto confirmado pela API.
- **A exportação no browser pode falhar por limite de memória** → carregar as bibliotecas sob demanda e apresentar erro recuperável; avaliar processamento servidor somente se volume real exigir.

## Migration Plan

1. Aplicar a migração aditiva que adiciona a coluna de presença com padrão Ausente.
2. Implantar o backend com GET/PUT de frequência e depois o frontend com rota, salvamento e exportação.
3. Em rollback, reverter a aplicação e manter a coluna e os estados gravados para evitar perda de histórico.
