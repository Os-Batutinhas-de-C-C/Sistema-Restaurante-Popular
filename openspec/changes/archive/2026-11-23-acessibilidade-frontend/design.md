# Design

## Context

See proposal.md for motivation and specs/frontend-accessibility/spec.md for observable behavior. O layout raiz Next.js já define `lang="pt-BR"`, importa os estilos globais e envolve as rotas com o provedor MUI. O projeto usa App Router e JavaScript; componentes que acessam estado, armazenamento, fala ou DOM precisam ser Client Components.

## Goals / Non-Goals

**Goals:**
- Tornar os recursos disponíveis de forma consistente nas páginas montadas pelo layout raiz.
- Manter controles visuais utilizáveis quando o armazenamento ou o serviço VLibras não estiverem disponíveis.
- Evitar dependências adicionais e manter os recursos recolhidos no canto inferior esquerdo, adaptar a barra a telas estreitas e permitir expandi-la quando necessário.

**Non-Goals:**
- Garantir tradução automática integral do conteúdo para Libras; o VLibras fornece apoio de tradução por meio do seu widget.
- Substituir leitores de tela, recursos de acessibilidade do sistema operacional ou a voz disponível no navegador.
- Refatorar as telas existentes para reescrever seu conteúdo ou identidade visual.

## Decisions

- **Montar um componente cliente de acessibilidade no layout raiz.** O layout continua sendo Server Component e inclui um componente cliente dedicado para as barras e a inicialização do VLibras. Isso alcança as rotas do App Router sem duplicar controles em cada página.
- **Agrupar barra visual e VLibras na lateral esquerda.** A barra inicia recolhida, fixa junto ao botão VLibras no canto inferior esquerdo; o widget usa sua configuração oficial de posição esquerda. A seta permanece visível para expandir os controles. Em telas estreitas, a barra limita sua largura ao espaço disponível.
- **Ajustar tipografia com uma variável CSS global limitada a níveis discretos.** A-, A e A+ alteram uma variável de escala aplicada ao texto, com nível padrão e limites definidos na implementação. O estado do tamanho de fonte vale durante a sessão; persistência é requisito apenas para o alto contraste.
- **Persistir alto contraste em armazenamento local com inicialização tolerante a falhas.** A leitura e gravação de localStorage ocorrem no cliente e são protegidas contra exceções; o estado em memória continua funcionando quando armazenamento é bloqueado. Uma classe ou atributo no elemento raiz ativa tokens de alto contraste sem sobrescrever foco e estados semânticos.
- **Carregar o widget VLibras sem bloquear a renderização.** O carregamento é isolado do conteúdo e dos controles locais. Falha de script ou indisponibilidade de rede deixa as demais funções utilizáveis; não se adiciona fallback de tradução próprio.
- **Não adicionar dependências.** As capacidades requeridas estão cobertas por CSS, React e APIs do navegador, e o widget é gratuito e externo. Isso respeita a stack atual e reduz manutenção.

## Risks / Trade-offs

- [VLibras requer conexão e pode alterar seu modo de integração] → Carregar de forma não bloqueante, isolar falhas e conferir a integração oficial durante a implementação.
- [A barra expandida pode cobrir parte do conteúdo enquanto flutua perto do VLibras] → Iniciar a barra recolhida, manter a seta visível e limitar a largura em viewports estreitos.
- [A escala de fonte pode interagir com componentes MUI que usam tamanhos fixos] → Aplicar a escala globalmente e revisar as telas representativas para preservar leitura e operação.
- [Os temas atuais podem não responder todos aos mesmos tokens CSS] → Definir cobertura em estilos globais e revisar contraste de texto, controles, bordas e foco nas páginas existentes.

## Migration Plan

Não há migração de dados nem alteração de API. A implantação consiste em adicionar o componente e estilos compartilhados ao frontend. A reversão pode remover a montagem global e os estilos sem afetar dados persistidos; a chave de preferência local pode ser ignorada por versões futuras.


