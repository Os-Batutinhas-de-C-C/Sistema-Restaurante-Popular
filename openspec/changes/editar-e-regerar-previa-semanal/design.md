# Design

## Context

A tela semanal mantém uma prévia em estado React, apresenta resumos por dia e permite salvar ou descartar. A API recebe a semana completa em uma única operação; a edição diária existente pode servir de referência visual para os campos.

## Goals / Non-Goals

**Goals:**

- Permitir gerar novamente sem gravar a versão anterior.
- Permitir editar os campos de qualquer dia dentro do fluxo da prévia.
- Preservar os valores editados até salvar ou descartar.

**Non-Goals:**

- Alterar endpoints ou persistir edições antes da confirmação da semana.
- Mudar os critérios de combinação distinta do gerador.

## Decisions

- Adicionar o botão “Gerar novamente” junto a salvar e descartar; reutilizar a geração atual e substituir a prévia apenas quando uma nova semana válida estiver disponível. Se a tentativa falhar ou o histórico for insuficiente, manter a prévia atual.
- Abrir a edição de um dia em um formulário/modal com os mesmos campos do cadastro diário. Confirmar a edição atualiza somente o item correspondente na prévia em memória; cancelar fecha sem alterar valores.
- Salvar envia as cinco refeições editadas pela operação semanal existente; descartar limpa a prévia e todas as alterações locais.

## Risks / Trade-offs

- Gerar novamente pode levar tempo → indicar carregamento e impedir cliques repetidos enquanto a consulta está ativa.
- A edição pode deixar campos incompletos → validar antes de confirmar a edição, preservando a prévia enquanto houver erro.
- Há cinco formulários distintos → identificar cada um pelo dia e garantir que editar um não altere os outros.

## Migration Plan

Sem migração ou alteração de API. Reverter removendo o controle e o editor da prévia; os cardápios já salvos continuam disponíveis.
