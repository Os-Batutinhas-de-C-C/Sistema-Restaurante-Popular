# Tasks — Painel Administrativo: Relatórios

## Implementação

- [x] **T01 — Estrutura Base e Mock de Dados**
- Criar `src/app/painel-nutricionista-relatorios/page.js` (ou caminho equivalente definido no projeto) e o componente `PainelNutricionistaRelatorios`.
- Criar `src/services/relatoriosService.js` com os dados da semana (dia, data, cardápio ou "Pendente", fichas, desperdício em kg e os percentuais prontos de fichas e desperdício) e as funções de listar a semana e salvar o desperdício de um dia. O mock deve permitir configurar a "data atual" (23/09/2026, como no Figma).
- Unificar a fonte dos gráficos do painel principal com este mock, se ainda forem mocks separados.
- **Relacionada a:** HU013, HU014, RF008

- [x] **T02 — Layout e Responsividade da Página**
- Implementar o container centralizado (máx. ~616px) com os cards de filtros, gráficos e tabela, dentro da Navbar do projeto (sem criar um segundo `<main>`).
- Garantir coluna única, sem rolagem horizontal, a partir de 360px, com "Exportar" em largura total e gráficos empilhados.
- **Relacionada a:** RNF001, HU001

- [x] **T03 — Seletor de Período (semana)**
- Localizar e reaproveitar o seletor de datas já existente no projeto; não criar um novo.
- Configurá-lo para selecionar uma semana (segunda a sexta), com padrão na semana atual e exibição "dd/mm/aaaa – dd/mm/aaaa". Se o componente não suportar, adaptá-lo sem duplicá-lo e registrar a mudança.
- Recarregar gráficos e tabela ao mudar a semana.
- **Relacionada a:** RN02, HU019

- [x] **T04 — Gráficos de Fichas e Desperdício**
- Criar `src/components/relatorios/GraficoSemanal.jsx` com props independentes da biblioteca (`titulo`, `cor`, `rotulos`, `valores`), usando o BarChart do `@mui/x-charts` (verificar a API da versão instalada, 9.16). Este deve ser o único arquivo que importa `@mui/x-charts`.
- Aplicar as cores (azul para Fichas, laranja para Desperdício), eixo X Seg–Sex, eixo Y de 0 a 100 com marcas a cada 20 e sufixo "%", legenda à direita acima do gráfico e `aria-label` descritivo.
- Usar o componente também nos gráficos do painel principal.
- **Relacionada a:** HU013, RN03

- [x] **T05 — Tabela Semanal e Cards Mobile**
- Renderizar a tabela (desktop) com Dia/Data, Cardápio truncado ou "Pendente", Fichas, Desperdício (kg) e Ações, usando "-" para dias sem dado.
- Renderizar os cards diários no mobile no lugar da tabela, como no Figma.
- Exibir o lápis nos cinco dias e permitir registrar ou corrigir o desperdício; implementar estados de carregando (Skeleton), vazio e erro.
- Substituir o `Button` do lápis por `IconButton`, com `aria-label` descritivo.
- **Relacionada a:** RN04, RN07

- [x] **T06 — Modal "Editar relatório do dia"**
- Criar `ModalEditarRelatorio` (MUI Dialog) com título, texto de apoio, bloco "Dados do dia" (somente leitura), campos editáveis "Fichas" e "Desperdício (kg)", e botões "CANCELAR" e "SALVAR ALTERAÇÕES".
- Guardar o texto digitado no estado (permitir apagar), validar Fichas como inteiro não negativo e Desperdício como número não negativo (até 1 casa decimal), e desabilitar "SALVAR ALTERAÇÕES" quando inválido.
- Ocultar as setas de incremento no mobile; migrar `inputProps`/`InputProps` para `slotProps`.
- Ao salvar, atualizar o mock, a tabela e ambos os gráficos, e exibir Snackbar; ao cancelar, descartar.
- **Relacionada a:** HU014, RN05, RN06, RN08

- [x] **T07 — Exportação (menu, CSV e PDF)**
- Substituir o `MenuExportao` do protótipo por um MUI `Menu` ancorado no botão "Exportar", com itens "PDF" e "CSV", `Fragment`/`Divider component="li"` e `aria-label` em português.
- Criar `src/utils/exportarRelatorio.js` com `exportarCsv(semana)` (sem biblioteca; separador `;`, UTF-8 com BOM) e `exportarPdf(semana)` (biblioteca de PDF, por exemplo jsPDF com autotable; instalar em `package.json`). Este deve ser o único arquivo que importa a biblioteca de PDF.
- Nomear os arquivos como `relatorio-dd-mm-aaaa-a-dd-mm-aaaa`.
- **Relacionada a:** HU019, RN09, RN11

- [x] **T09 — Acessibilidade**
- Adicionar `aria-label` descritivo no lápis, na tabela e nos gráficos, `aria-labelledby` no modal e foco inicial no campo de desperdício.
- Garantir navegação por teclado (Tab, Enter, setas no menu, Esc) e touch target de 44x44px no mobile.
- **Relacionada a:** RNF001

## Verificação

- [ ] **T10 — Verificar cenário: Semana, Gráficos e Dias Pendentes**
- Confirmar que a semana atual carrega, que trocar de semana recarrega tudo, que dias sem cardápio mostram "Pendente", "-" e barras zeradas e que o eixo Y vai de 0 a 100.
- **Critério relacionado:** Cenários 1, 2 e 3

- [ ] **T11 — Verificar cenário: Edição do Desperdício**
- Confirmar que o lápis abre o modal com os dados da linha, que Fichas e Desperdício aceitam valores válidos, que o botão fica desabilitado com valores vazios ou inválidos, que salvar atualiza tabela e gráficos e que cancelar, Esc e clique fora descartam.
- **Critério relacionado:** Cenários 4, 5, 6 e 7

- [ ] **T12 — Verificar cenário: Exportação**
- Confirmar que o menu abre e fecha por teclado, que o CSV abre corretamente no Excel (acentos e colunas) e que o PDF baixa com a semana selecionada.
- **Critério relacionado:** Cenários 8 e 9

- [x] **T13 — Verificar cenário: Isolamento das bibliotecas**
- Confirmar que `@mui/x-charts` só é importado em `GraficoSemanal.jsx` e a biblioteca de PDF só em `exportarRelatorio.js` (por exemplo, com `grep -rn` pelos pacotes em `src`), e que trocar a implementação interna não exige mudar as telas.
- **Critério relacionado:** RN11

- [ ] **T14 — Verificar cenário: Responsividade**
- Confirmar que em 360px a interface flui para coluna única sem rolagem horizontal e que a tabela vira cards.
- **Critério relacionado:** RNF001, HU001

## Pronto quando

- [ ] A tela, os gráficos e a tabela renderizam os dados do arquivo de mock.
- [ ] A edição de Fichas e desperdício e a troca de semana funcionam.
- [ ] A exportação em PDF e CSV funciona para a semana selecionada.
- [ ] O fluxo funciona em desktop e mobile (responsividade).
- [ ] A Navbar do projeto envolve a tela e o seletor de datas existente foi reaproveitado.
- [ ] As bibliotecas (`@mui/x-charts` e a de PDF) estão isoladas em um arquivo cada.
- [ ] Os botões, o menu e o modal são plenamente acessíveis por teclado (Tab, Enter e Esc).
