# Requisitos — Relatórios do Painel Nutricionista

## Requisitos funcionais

- **RF001:** A nutricionista pode filtrar relatórios por intervalo de datas.
- **RF002:** A tela apresenta gráficos semanais de fichas vendidas e
  desperdício, além do detalhamento diário.
- **RF003:** A nutricionista pode editar fichas e desperdício de um dia.
- **RF004:** A nutricionista pode exportar os dados filtrados em CSV ou PDF.
- **RF005:** Os dados do relatório incluem fichas, desperdício, sobras e
  satisfação; o serviço calcula médias e totais para os indicadores.

## Requisitos de interface

- Usar as referências visuais `docs/interface/relatorio.png` e
  `docs/interface/relatorio-painel.png`.
- Reutilizar NavbarPainel, SeletorIntervaloDatas e GraficosCardapio.
- Manter os elementos específicos da página em
  `src/components/painel-nutricionista-relatorios/`.
- Manter dados, operações e exportações em `src/services/relatoriosService.js`.
- A página da rota nova deve ser um contêiner enxuto em
  `src/app/painel-nutricionista-relatorio/page.js`.
- Preservar a rota legada com redirecionamento para a nova rota.
- Exibir erros de validação e de exportação à pessoa usuária.
