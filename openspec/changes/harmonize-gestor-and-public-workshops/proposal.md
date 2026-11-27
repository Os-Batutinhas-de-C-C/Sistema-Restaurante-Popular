# Proposal

## Why

O Painel Gestor e as telas de Oficinas ou Cursos usam componentes compartilhados, mas a composição deixa indicadores e ações visualmente apertados e sem a hierarquia dos outros painéis. No portal público, a seção de oficinas precisa ficar integrada à navegação e à apresentação das demais áreas do site. Algumas propriedades flexbox passadas diretamente a `Stack` também chegam ao DOM e geram avisos React/Next.

## What Changes

- Dar ao Painel Gestor uma área de conteúdo responsiva com largura e espaçamento adequados para métricas e programação.
- Padronizar a atualização dos indicadores com o botão MUI pequeno e contornado, ícone de atualizar e horário da última atualização, como nos demais painéis.
- Reforçar a hierarquia de títulos e cartões no Portal do Cidadão e expor um link de navegação para Oficinas.
- Exibir um ícone de calendário visível e usar apenas o rótulo “Oficinas” no menu do Gestor; padronizar a superfície pública de oficinas com fundo branco, cabeçalho marcado por ponto azul e divisória entre seções.
- Usar `sx` para propriedades flexbox em `Stack`, evitando que atributos de layout sejam encaminhados a elementos DOM.

## Capabilities

### Modified Capabilities

- `painel-gestor`: apresentação responsiva e ações do painel.
- `oficinas-ou-cursos`: organização visual das telas de gestão e da programação pública.

## Impact

- Frontend Next.js/MUI: composição do Painel Gestor, páginas de gerenciamento de oficinas e programação pública.
- Sem alteração de API, banco de dados, regras de acesso ou conteúdo do PDF de frequência.
