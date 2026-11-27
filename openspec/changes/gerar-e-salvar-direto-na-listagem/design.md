# Design

## Context

A tela semanal tem uma lista de dias salvos e um estado separado para a prévia. A geração seleciona cinco refeições completas do histórico, e o serviço já grava as cinco posições pela API semanal. Ver `proposal.md` para a mudança de fluxo.

## Goals / Non-Goals

**Goals:**

- Escrever os resultados gerados usando a operação semanal existente.
- Atualizar o estado da lista somente depois de a gravação ter sucesso.
- Manter a edição diária que já existe.

**Non-Goals:**

- Manter uma cópia da semana gerada como prévia editável.
- Alterar critérios de seleção, endpoints ou permissões.

## Decisions

- Fazer o botão de geração iniciar seleção e gravação em sequência. Isso atende ao fluxo direto; manter um estado local separado criaria novamente a etapa de prévia que será removida.
- Em caso de geração insuficiente, falha da API ou exceção, manter a lista persistida em memória intacta e exibir feedback. Atualizar `todosCardapios` e `semanas` somente após resposta de sucesso.
- Reusar o serviço de gravação semanal para criar ou substituir a semana selecionada em uma operação. Não adicionar botões de salvar ou descartar específicos da geração.
- Após atualizar a lista, deixar os botões de edição diária existentes disponíveis.

## Risks / Trade-offs

- Um clique salva a semana imediatamente → indicar carregamento no botão e mostrar mensagem clara após sucesso.
- A semana existente é substituída sem revisão prévia → deixar esse efeito explícito no rótulo/feedback antes ou no momento da geração.
- Erro após a requisição pode deixar o estado local desatualizado → preservar a lista exibida e permitir recarregar os dados.

## Migration Plan

Não há mudança de API ou banco. Remover o estado e controles exclusivos de prévia no frontend; cardápios já salvos continuam sujeitos ao fluxo normal de edição.
