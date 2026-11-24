# Proposal

## Why

O portal não oferece controles próprios para pessoas com baixa visão, e a tradução em Libras também não está integrada. Recursos gratuitos podem tornar as páginas públicas mais acessíveis sem introduzir dependências pagas.

## What Changes

- Adicionar ao frontend um widget VLibras gratuito para apoio à tradução do conteúdo em Libras.
- Disponibilizar, junto ao VLibras na lateral esquerda, uma barra inicialmente recolhida por seta com controles de fonte A-, A e A+ e modo de alto contraste persistente.
- Permitir ajustes sucessivos do tamanho da fonte entre limites mínimo e máximo.
- Definir comportamento responsivo, acessível por teclado e com rótulos claros para os controles.

## Capabilities

### New Capabilities
- `frontend-accessibility`: recursos globais de acessibilidade no frontend, incluindo VLibras e ajustes visuais persistentes.

### Modified Capabilities

## Impact

- Frontend Next.js/React: layout global, componentes reutilizáveis de acessibilidade e estilos globais.
- Carregamento do widget VLibras por integração gratuita externa.
- APIs do navegador para controles locais, sem dependências adicionais.

