# Requisitos — Correções visuais e de navegação dos painéis

## Objetivo

Corrigir inconsistências visuais e de navegação identificadas nos painéis da Nutricionista, do Caixa e na tela administrativa de Cardápios, preservando os contratos atuais da API e o padrão visual já utilizado no frontend.

## Decisões confirmadas pelo solicitante

- A ficha do painel da Nutricionista deve usar os mesmos campos do Caixa: fichas entregues/capacidade no formato `77 / 300`, percentual e barra linear.
- O painel da Nutricionista não deve exibir o texto separado “Capacidade diária”.
- O texto “Restam X fichas” deve ser removido de todas as telas que exibem fichas. Entregues, capacidade, percentual e barra permanecem.
- A tela de Cardápios não deve exibir um botão adicional de adicionar; os dias pendentes já devem permanecer visíveis para permitir a continuidade do fluxo pelo controle de edição existente.
- O menu do Caixa terá o item “Início”, apontando para `/painel-caixa`.

## Requisitos funcionais

### RF001 — Indicador de fichas no painel da Nutricionista

O cartão de fichas do painel da Nutricionista deve apresentar fichas entregues e capacidade na mesma linha, no formato `entregues / capacidade`, além do percentual calculado e da barra linear de progresso, seguindo o padrão visual e semântico do cartão do Caixa. Não deve haver uma linha separada com “Capacidade diária”.

### RF002 — Remoção do texto de fichas restantes

Nenhuma tela de fichas deve renderizar o texto “Restam X fichas” ou equivalente. A remoção se aplica às telas pública, Nutricionista/Gestor, Caixa e componentes de cardápio/gráficos que exibam esse indicador. O total entregue, a capacidade, o percentual e a barra de progresso não devem ser removidos.

### RF003 — Exibição de dias pendentes

A tela de Cardápios deve exibir os cinco dias úteis da semana selecionada quando houver uma semana válida, inclusive quando não houver refeições cadastradas. Dias sem refeição devem mostrar “Pendente”. A ausência de refeição não deve ocultar a semana; a tela deve conservar os controles e ações existentes para continuar o fluxo de gerenciamento.

### RF004 — Início no menu do Caixa

O menu de navegação da variante Caixa deve conter o item “Início”, apontando para `/painel-caixa`, além do item “Sair” já existente. O item deve reutilizar o ícone e o comportamento de navegação do menu compartilhado.

## Restrições

- Não alterar endpoints, payloads, permissões ou regras de negócio do backend.
- Reutilizar componentes, serviços, ícones e estilos existentes sempre que possível.
- Preservar os estados de carregamento, vazio e erro.
- Manter navegação autenticada por `router.push`, sem recarregar a página.

## Critérios de aceitação

1. A ficha da Nutricionista exibe percentual e barra linear quando os dados estão disponíveis.
2. A busca por “Restam” não encontra texto de fichas restantes renderizado nas telas de fichas.
3. Uma semana com dias vazios mostra os cinco dias e “Pendente”, sem botão adicional no cabeçalho.
4. O menu do Caixa exibe “Início” e navega para `/painel-caixa`.
