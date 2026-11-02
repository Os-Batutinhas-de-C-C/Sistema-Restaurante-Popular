# Prompt — Relatórios do Painel Nutricionista

Refatorar a tela de relatórios do painel da nutricionista usando como referência
visual [relatorio.png](../../docs/interface/relatorio.png) e
[relatorio-painel.png](../../docs/interface/relatorio-painel.png).

A rota principal deve ser `src/app/painel-nutricionista-relatorio/page.js`.
Reutilizar os componentes compartilhados de navegação, intervalo de datas e
gráficos. Isolar os componentes específicos em
`src/components/painel-nutricionista-relatorios/` e centralizar dados simulados,
filtros, cálculos, atualização dos registros e exportações CSV/PDF em
`src/services/relatoriosService.js`. Manter a interface responsiva, acessível e
com uma página de rota enxuta. A documentação desta implementação deve ser
referenciada em `design.md`.
