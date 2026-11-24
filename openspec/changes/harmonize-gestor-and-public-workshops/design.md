# Design

## Context

O Painel Gestor já reutiliza os indicadores nutricionais e a programação pública de oficinas. As telas operacionais usam `PaginaOficinasGestor`, e o Portal do Cidadão monta a seção de oficinas dentro da página pública, que fornece o cabeçalho global.

## Decisions

### Layout do Gestor

Dar ao Painel Gestor um CSS Module próprio em vez de herdar o limite estreito do dashboard da Nutricionista. Usar largura máxima maior em desktop, gutters consistentes e empilhamento do título e da ação em telas pequenas. Reutilizar o padrão dos outros painéis: botão MUI `outlined`, pequeno, com ícone de atualizar e o texto “Atualizado às HH:mm”; o clique solicita nova consulta dos indicadores.

As telas de gerenciamento usam o mesmo limite de conteúdo mais amplo. A informação do evento permanece agrupada à esquerda e as ações ficam em uma área separada, com quebra de linha em telas menores.

### Portal público

Manter o cabeçalho público compartilhado de `mainPage`; não renderizar um segundo cabeçalho dentro de `OficinasPortal`. Adicionar “Oficinas” à navegação existente, apontando para o `id` da seção. Reforçar os títulos e cartões com a hierarquia MUI que já aparece no portal.

Aplicar à superfície de Oficinas a mesma base visual do cartão de Localização: fundo branco, borda neutra, cantos arredondados e sombra discreta. Os títulos de “Oficinas ou Cursos” e “Minhas inscrições” usam o marcador circular azul e a tipografia de seção do portal, com uma divisória entre os blocos.

No menu administrativo do Gestor, usar o rótulo curto “Oficinas”. O ícone de calendário precisa contrastar com o fundo branco do menu.

### Uso do MUI

Passar `justifyContent`, `alignItems` e outras propriedades CSS de layout por `sx` em `Stack`. Usar as propriedades próprias de `Stack` para direção e espaçamento, evitando atributos desconhecidos no DOM.

## Verification

- `npm run lint` e `git diff --check` foram executados após a implementação.
- A revisão visual em viewport móvel de 360 px e desktop, incluindo console do navegador, continua pendente e deve ser concluída antes de arquivar esta change.
