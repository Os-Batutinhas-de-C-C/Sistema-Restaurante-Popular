# Proposal

## Why

O portal não oferece controles próprios para pessoas com baixa visão ou que prefiram consumir conteúdo por áudio, e a tradução em Libras também não está integrada. Recursos simples, gratuitos e nativos do navegador podem tornar as páginas públicas mais acessíveis sem introduzir dependências pagas.

## What Changes

- Adicionar ao frontend um widget VLibras gratuito para apoio à tradução do conteúdo em Libras.
- Disponibilizar, junto ao VLibras na lateral esquerda, uma barra recolhível por seta com controles de fonte A-, A e A+ e modo de alto contraste persistente.
- Permitir iniciar e interromper a leitura em voz alta do conteúdo usando a Web Speech API nativa, com voz em pt-BR quando disponível.
- Definir comportamento responsivo, acessível por teclado e com rótulos claros para os controles.

## Capabilities

### New Capabilities
- `frontend-accessibility`: recursos globais de acessibilidade no frontend, incluindo VLibras, ajustes visuais persistentes e leitura de conteúdo em voz alta.

### Modified Capabilities

## Impact

- Frontend Next.js/React: layout global, componentes reutilizáveis de acessibilidade e estilos globais.
- Carregamento do widget VLibras por integração gratuita externa.
- Web Speech API do navegador, sem serviço de síntese de voz ou dependência adicional.

