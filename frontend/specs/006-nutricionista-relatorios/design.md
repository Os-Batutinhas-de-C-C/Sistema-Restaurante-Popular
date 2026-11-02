# Design — Painel Administrativo: Relatórios

## Objetivo da experiência

A nutricionista ou gestor deve conseguir acompanhar, em uma única tela, as fichas vendidas e o desperdício de cada dia útil de uma semana (em gráficos e em tabela), registrar o desperdício diário e exportar o relatório da semana em PDF ou CSV, em qualquer dispositivo.

## Histórias atendidas

- **HU013 (Relatório de desperdício e satisfação):** a nutricionista consulta relatórios de desperdício por dia da semana. A parte de satisfação está fora desta tela.
- **HU014 (Cadastro de informações de desperdício):** a nutricionista cadastra o desperdício diário.
- **HU019 (Exportação de relatórios):** a nutricionista exporta o consolidado do período selecionado em PDF ou CSV.
- **RF008 (Gestão de métricas e relatórios):** registrar o desperdício diário, visualizar gráficos comparativos de fichas vendidas e exportar os dados.

## Fluxo principal

1. A pessoa acessa "Relatórios" no painel administrativo.
2. O sistema exibe a semana atual (segunda a sexta) no filtro, os dois gráficos e a tabela semanal.
3. A pessoa pode trocar a semana pelo seletor de período.
4. Para registrar o desperdício de um dia, a pessoa clica no lápis da linha. O sistema abre o Dialog "Editar relatório do dia".
5. A pessoa informa o desperdício (kg) e clica em "SALVAR ALTERAÇÕES". A tabela e o gráfico de desperdício são atualizados.
6. Para exportar, a pessoa clica em "Exportar" e escolhe PDF ou CSV. O arquivo da semana selecionada é baixado.

## Estrutura da interface

*(Nota: A Navbar já existe (menu, "Painel Nutricionista" e avatar) e deve envolver o conteúdo principal. A página não deve criar outro `<main>`.)*

1. **Título da página:** "Relatórios".

2. **Card de filtros**
   - Seletor "Selecione o Período" (semana, ex: "21/09/2026 – 25/09/2026"), usando o seletor de data que já existe no projeto.
   - Botão "Exportar" (verde, com ícone de download), que abre o menu PDF/CSV.

3. **Card de gráficos**
   - Dois gráficos de barras verticais lado a lado no desktop: "Fichas" (azul) e "Desperdício" (laranja).
   - Cada gráfico tem a legenda (quadrado colorido + nome) alinhada à direita, acima do gráfico.
   - Eixo X: "Seg", "Ter", "Qua", "Qui", "Sex". Eixo Y: de 0 a 100 (percentual).

4. **Tabela semanal (desktop)**
   - Colunas: Dia (dia da semana + data), Cardápio (resumo truncado ou "Pendente"), Fichas, Desperdício (kg) e Ações.
   - 5 linhas (segunda a sexta). Sem dado, Fichas e Desperdício mostram "-".
   - Ação por linha: Editar (lápis), disponível nos cinco dias da semana.

5. **Cards diários (mobile)**
   - A tabela vira uma lista de 5 cards: dia e data no topo, "Descrição Cardápio" com o resumo (ou "Pendente"), e em seguida "Fichas" e "Desperdício (kg)" lado a lado. O lápis fica no canto superior direito de cada card.

6. **Menu de exportação (MUI Menu)**
   - Itens "PDF" e "CSV", separados por divisor.

7. **Modal "Editar relatório do dia" (MUI Dialog)**
   - Título: "Editar relatório do dia", com um texto de apoio abaixo. [SUPOSIÇÃO] "Atualize o desperdício do dia."
   - Bloco "Dados do dia" com a etiqueta "Somente leitura": Dia (ex: "Quarta-feira · 23/09/2026") e Descrição Cardápio.
   - Campos "Fichas" (inteiro não negativo) e "Desperdício (kg)" (até uma casa decimal), ambos editáveis, lado a lado no desktop e empilhados no mobile.
   - Rodapé: "CANCELAR" (texto) e "SALVAR ALTERAÇÕES" (contido, azul), alinhados à direita.

## Campos e controles

### Seletor de período
- Tipo: o seletor de datas já usado em outras telas do projeto. Deve ser reaproveitado, sem criar um novo.
- Comportamento: o período é sempre uma semana, de segunda a sexta. Ao escolher qualquer dia, a semana correspondente é selecionada e exibida como "dd/mm/aaaa – dd/mm/aaaa". Ao mudar, gráficos e tabela são recarregados.
- Padrão: semana atual.
- [A CONFIRMAR] Se o seletor existente não permite selecionar uma semana inteira, é preciso adaptá-lo (por exemplo, restringindo o intervalo a segunda–sexta) sem duplicar o componente.

### Botão Exportar e menu
- Tipo: MUI Button (variante contida, verde, `endIcon` de download) e MUI Menu ancorado ao botão (`aria-haspopup`, `aria-expanded`, `aria-controls`).
- Comportamento: clicar em "PDF" ou "CSV" gera e baixa o arquivo da semana selecionada e fecha o menu.
- **CSV:** colunas Dia, Data, Cardápio, Fichas e Desperdício (kg). [SUPOSIÇÃO] separador `;`, codificação UTF-8 com BOM (abre direto no Excel), nome `relatorio-dd-mm-aaaa-a-dd-mm-aaaa.csv`.
- **PDF:** [SUPOSIÇÃO] título "Relatório semanal" com o período e a tabela da semana (sem os gráficos), gerado no navegador com uma biblioteca de PDF.
- A biblioteca de PDF é temporária e deve ficar isolada em um único módulo (ver "Isolamento das bibliotecas").

### Gráficos de Fichas e Desperdício
- Tipo: gráfico de barras do MUI X Charts (`@mui/x-charts`, já instalado), um para cada série.
- Cores: Fichas `#075d9e`, Desperdício `#ef7000`.
- Valores: percentuais de 0 a 100. Eixo Y de 0 a 100 com marcas a cada 20, formatado com "%". Dia sem registro mostra barra zero.
- [A CONFIRMAR] A base do cálculo do percentual (fichas vendidas sobre o total do dia e desperdício sobre o total preparado). Até a definição, o mock já devolve os percentuais prontos.
- Alternativa textual: a tabela com os mesmos dados fica logo abaixo; cada gráfico recebe `aria-label` descritivo.

### Botão de Ação: Editar
- Tipo: MUI IconButton (redondo, azul, ícone de lápis, 24px no desktop; no mobile, área de toque de 44x44px).
- Visibilidade: aparece em todas as cinco linhas/cards da semana. A pessoa pode registrar ou corrigir o desperdício de qualquer dia.
- Comportamento: abre o modal "Editar relatório do dia" com os dados da linha.

### Campo Fichas (modal)
- Tipo: MUI TextField editável, obrigatório, inteiro e maior ou igual a 0. O estado guarda o texto até validar; quando o relatório não possui dado, inicia vazio. Como não há backend, a correção afeta o mock desta tela.

### Campo Desperdício (kg) (modal)
- Tipo: MUI TextField numérico, obrigatório, valor maior ou igual a 0. [SUPOSIÇÃO] aceita até 1 casa decimal e usa `inputMode="decimal"`. O estado guarda o texto digitado (permite apagar o campo).
- As setas de incremento/decremento do Figma ficam no desktop; no mobile são ocultadas, pois têm 16x12px, muito abaixo dos 44px de toque.
- "SALVAR ALTERAÇÕES" fica desabilitado enquanto o campo estiver vazio ou inválido.

### Botões do modal
- **SALVAR ALTERAÇÕES:** grava Fichas e Desperdício no mock, atualiza tabela, gráficos e exportações, fecha o modal e exibe um Snackbar "Relatório atualizado". [SUPOSIÇÃO]
- **CANCELAR**, Esc e clique fora: fecham o modal sem salvar e descartam o que foi digitado.

## Estados da interface

- **Carregando:** MUI Skeleton sobre o filtro, os gráficos e as linhas/cards da semana.
- **Sucesso:** gráficos e tabela preenchidos.
- **Dia sem cardápio:** o resumo exibe "Pendente" de forma sutil; Fichas e Desperdício mostram "-".
- **Edição:** o lápis é exibido para todos os dias, mesmo quando já há desperdício registrado.
- **Erro:** [SUPOSIÇÃO] mensagem "Não foi possível carregar o relatório." com botão "Tentar novamente".
- **Exportação:** se não houver dados na semana, o arquivo é gerado com as linhas "Pendente". [SUPOSIÇÃO]

## Responsividade

- **Desktop:** conteúdo centralizado, largura máxima de aproximadamente 616px, com os cards de filtros, gráficos e tabela empilhados e os dois gráficos lado a lado.
- **Mobile (a partir de 360px, conforme HU001 e o Figma mobile):** coluna única. O seletor de período ocupa a largura total e o botão "Exportar" também, abaixo dele. Os gráficos ficam empilhados (Fichas e depois Desperdício) e a tabela vira lista de cards diários. Sem rolagem horizontal. Botões de ação com touch target de no mínimo 44x44px.

## Acessibilidade

- O lápis deve ter `aria-label` descritivo (ex: `aria-label="Editar relatório de Quarta-feira"`).
- A tabela deve ter `aria-label="Relatório semanal"`. Os cards mobile usam lista semântica.
- O menu de exportação deve ter `aria-label="Opções de exportação"` e navegação por setas, Enter e Esc.
- O modal deve aplicar foco inicial no campo de desperdício, fechar com Esc e possuir `aria-labelledby` apontando para o título.
- Cada gráfico deve ter `aria-label` resumindo a série (ex: "Fichas por dia da semana, em percentual").
- Todos os controles devem ser operáveis por teclado (Tab e Enter).

## Isolamento das bibliotecas (fácil de remover)

- **`@mui/x-charts`:** importado em um único componente, `src/components/relatorios/GraficoSemanal.jsx`, com props independentes da biblioteca (`titulo`, `cor`, `rotulos`, `valores`). A página e o painel só usam esse componente. Para trocar ou remover a biblioteca, basta reescrever o interior do componente (por exemplo, voltando às barras com `Box` do Figma), sem tocar nas telas.
- **Biblioteca de PDF (por ora):** importada em um único módulo, `src/utils/exportarRelatorio.js`, que expõe `exportarCsv(semana)` e `exportarPdf(semana)`. O CSV não depende de biblioteca. Para remover a biblioteca de PDF, basta trocar a implementação de `exportarPdf` (ou desativar o item "PDF" do menu), sem alterar o resto do código.

## Código de referência (protótipo da tela)

Protótipo exportado do Figma em MUI. Serve como referência visual (cores, medidas e estrutura). Os dados de `reportRows` e os valores dos gráficos devem vir do mock em `src/services/relatoriosService.js`.

**Tokens visuais extraídos do protótipo**
- Fichas: `#075d9e`. Desperdício: `#ef7000`.
- Botão Exportar: verde `#267b38` (hover `#206b30`). Botão de edição: `#008bd2` (hover `#0078b6`).
- Bordas dos cards: `#e4e9ed`, raio 1.25. Divisórias da tabela: `#eef1f4`.
- Container: largura máxima de 616px, centralizado.

```jsx
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  OutlinedInput,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

const reportRows = [
  {
    day: "Segunda-feira",
    date: "21/09/2026",
    meal: "Gado com Legumes, Omelete, ...",
    records: "85",
    waste: "10",
  },
  {
    day: "Terça-feira",
    date: "22/09/2026",
    meal: "Suíno ao Molho, Dobradinha, ...",
    records: "80",
    waste: "30",
  },
  {
    day: "Quarta-feira",
    date: "23/09/2026",
    meal: "Suíno com Legumes, Omelete, ...",
    records: "60",
    waste: "30",
  },
  {
    day: "Quinta-feira",
    date: "24/09/2026",
    meal: "Pendente",
    records: "-",
    waste: "-",
  },
  {
    day: "Sexta-feira",
    date: "25/09/2026",
    meal: "Pendente",
    records: "-",
    waste: "-",
  },
];

const chartLabels = ["Seg", "Ter", "Qua", "Qui", "Sex"];

const Chart = ({ color, values, label }) => (
  <Box sx={{ flex: 1, minWidth: 0 }}>
    <Stack
      direction="row"
      justifyContent="flex-end"
      alignItems="center"
      spacing={0.5}
      mb={2}
    >
      <Box sx={{ width: 15, height: 15, bgcolor: color }} />
      <Typography sx={{ fontSize: 12, color: "text.primary" }}>
        {label}
      </Typography>
    </Stack>
    <Stack direction="row" sx={{ height: 158 }}>
      <Stack
        justifyContent="space-between"
        alignItems="flex-end"
        sx={{
          width: 27,
          pt: 0.1,
          pb: 2.1,
          pr: 0.8,
          borderRight: "1px solid",
          borderColor: "text.secondary",
        }}
      >
        {[100, 90, 80, 60, 40, 20, 0].map((value) => (
          <Typography
            key={value}
            sx={{ fontSize: 9, lineHeight: 1, color: "text.primary" }}
          >
            {value}
          </Typography>
        ))}
      </Stack>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            px: 0.65,
            borderBottom: "1px solid",
            borderColor: "text.secondary",
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.10) 1px, transparent 1px)",
            backgroundSize: "20% 100%, 100% 20%",
          }}
        >
          {values.map((value, index) => (
            <Box
              key={chartLabels[index]}
              sx={{
                width: "20%",
                height: `${value}%`,
                mx: 0.35,
                bgcolor: color,
              }}
            />
          ))}
        </Box>
        <Stack direction="row" sx={{ height: 20, px: 0.4 }}>
          {chartLabels.map((day) => (
            <Box key={day} sx={{ width: "20%", textAlign: "center" }}>
              <Typography sx={{ fontSize: 9, lineHeight: "20px" }}>
                {day}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Stack>
  </Box>
);

const Frame = () => {
  return (
    <Box
      component="main"
      sx={{ minHeight: "100vh", bgcolor: "background.default", py: 3.25 }}
    >
      <Box
        sx={{ width: "100%", maxWidth: 616, mx: "auto", px: { xs: 2, sm: 0 } }}
      >
        <Typography
          component="h1"
          sx={{ fontSize: 24, fontWeight: 700, mb: 3 }}
        >
          Relatórios
        </Typography>
        <Card
          variant="outlined"
          sx={{
            mb: 1,
            borderColor: "#e4e9ed",
            borderRadius: 1.25,
            boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
          }}
        >
          <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <FormControl size="small" sx={{ width: 250 }}>
                <InputLabel shrink htmlFor="report-period">
                  Selecione o Período
                </InputLabel>
                <OutlinedInput
                  id="report-period"
                  label="Selecione o Período"
                  value="21/09/2026 – 25/09/2026"
                  inputProps={{
                    readOnly: true,
                    "aria-label": "Selecione o Período",
                  }}
                  sx={{
                    height: 45,
                    "& .MuiOutlinedInput-input": {
                      py: 1.2,
                      fontSize: 12,
                      color: "text.secondary",
                    },
                  }}
                />
              </FormControl>
              <Button
                variant="contained"
                endIcon={<DownloadOutlinedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  minWidth: 80,
                  height: 25,
                  px: 1,
                  borderRadius: 0.75,
                  bgcolor: "#267b38",
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 2px 3px rgba(0,0,0,0.2)",
                  "&:hover": { bgcolor: "#206b30" },
                }}
              >
                Exportar
              </Button>
            </Stack>
          </CardContent>
        </Card>
        <Card
          variant="outlined"
          sx={{
            mb: 1,
            borderColor: "#e4e9ed",
            borderRadius: 1.25,
            boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
          }}
        >
          <CardContent
            sx={{ px: 4.75, py: 3.25, "&:last-child": { pb: 3.25 } }}
          >
            <Stack direction="row" spacing={3.5}>
              <Chart
                color="#075d9e"
                values={[85, 85, 60, 0, 0]}
                label="Fichas"
              />
              <Chart
                color="#ef7000"
                values={[10, 30, 30, 0, 0]}
                label="Desperdício"
              />
            </Stack>
          </CardContent>
        </Card>
        <Paper
          variant="outlined"
          sx={{
            overflow: "hidden",
            borderColor: "#e4e9ed",
            borderRadius: 1.25,
            boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
          }}
        >
          <TableContainer sx={{ px: 3.25, py: 1.5 }}>
            <Table size="small" aria-label="Relatório semanal">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ width: 142, borderBottomColor: "#eef1f4", py: 0.7 }}
                  />
                  <TableCell sx={{ borderBottomColor: "#eef1f4", py: 0.7 }} />
                  <TableCell
                    align="center"
                    sx={{
                      width: 65,
                      borderBottomColor: "#eef1f4",
                      py: 0.7,
                      whiteSpace: "nowrap",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    Fichas
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      width: 100,
                      borderBottomColor: "#eef1f4",
                      py: 0.7,
                      whiteSpace: "nowrap",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    Desperdício (kg)
                  </TableCell>
                  <TableCell
                    sx={{ width: 33, borderBottomColor: "#eef1f4", py: 0.7 }}
                  />
                </TableRow>
              </TableHead>
              <TableBody>
                {reportRows.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell
                      sx={{ py: 1.1, px: 1.2, borderBottomColor: "#eef1f4" }}
                    >
                      <Typography
                        sx={{ fontSize: 12, fontWeight: 700, lineHeight: 1.35 }}
                      >
                        {row.day}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "#344054",
                          lineHeight: 1.35,
                        }}
                      >
                        {row.date}
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        py: 1.1,
                        px: 1.2,
                        borderBottomColor: "#eef1f4",
                        fontSize: 11,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.meal}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        py: 1.1,
                        px: 0.5,
                        borderBottomColor: "#eef1f4",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {row.records}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        py: 1.1,
                        px: 0.5,
                        borderBottomColor: "#eef1f4",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {row.waste}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ py: 1.1, px: 0, borderBottomColor: "#eef1f4" }}
                    >
                      {row.records === "-" && (
                        <Button
                          aria-label={`Editar ${row.day}`}
                          size="small"
                          sx={{
                            minWidth: 24,
                            width: 24,
                            height: 24,
                            p: 0,
                            borderRadius: "50%",
                            bgcolor: "#008bd2",
                            color: "common.white",
                            "&:hover": { bgcolor: "#0078b6" },
                          }}
                        >
                          <EditOutlinedIcon sx={{ fontSize: 15 }} />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
};

export default Frame;
```

**Divergências conhecidas entre o protótipo e esta spec** (a implementação deve seguir a spec):
- Os gráficos são feitos à mão com `Box`; na spec usam o MUI X Charts, isolado em `GraficoSemanal.jsx`. O eixo Y do protótipo é irregular (`100, 90, 80, 60, 40, 20, 0`, falta o 70); na spec as marcas são a cada 20.
- O gráfico de Fichas usa 85 na terça e a tabela mostra 80. Se o gráfico é percentual e a tabela é contagem, os números são independentes; confirmar a base do cálculo.
- O filtro é um `OutlinedInput` `readOnly` com valor fixo; na spec é o seletor de datas já existente no projeto, restrito a uma semana.
- O botão "Exportar" não tem ação; na spec abre o menu PDF/CSV. O botão tem 25px de altura, abaixo dos 44px de toque no mobile.
- O protótipo só exibia um `Button` de 24px sem `onClick` em algumas linhas; a implementação atual usa `IconButton` funcional em todos os dias da semana.
- A coluna do cardápio usa `whiteSpace: "nowrap"`, que estoura em 360px; no desktop usar `noWrap` com `maxWidth` e reticências, no mobile a linha vira card.
- Cabeçalhos das colunas de dia e cardápio estão vazios; na spec, `aria-label`/texto visualmente oculto para leitores de tela.
- O componente envolve a página em `<main>` com `minHeight: "100vh"`; a Navbar do projeto já envolve o conteúdo, então usar um `div` e evitar dois `<main>`.
- `inputProps` é depreciado no MUI v9; usar `slotProps={{ htmlInput: {...} }}`.
- A `key` da linha é a data; funciona numa semana fixa, mas prefira o `id` do dia.
- Os dados dos gráficos e da tabela estão duplicados no código; vêm do mesmo mock (`relatoriosService.js`), inclusive nos gráficos do painel principal, para não divergirem.

## Código de referência (modal "Editar relatório do dia")

Protótipo exportado do Figma em MUI para o conteúdo do modal. O título "Editar relatório do dia" e os botões "CANCELAR" e "SALVAR ALTERAÇÕES" aparecem no print do Figma, mas não estão neste trecho de código.

```jsx
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

const dailyData = {
  day: "Quarta-feira · 23/09/2026",
  menuDescription: "Suíno com Legumes, Omelete, ...",
  fields: [
    { id: "fichas", label: "Fichas", value: 60 },
    { id: "desperdicio", label: "Desperdício (kg)", value: 30 },
  ],
};

const ContedoDoDilogo = () => {
  const [values, setValues] = useState(
    dailyData.fields.reduce(
      (currentValues, field) => ({
        ...currentValues,
        [field.id]: field.value,
      }),
      {},
    ),
  );

  const updateValue = (fieldId, nextValue) => {
    setValues((currentValues) => ({
      ...currentValues,
      [fieldId]: Math.max(0, nextValue),
    }));
  };

  return (
    <Box component="section" sx={{ px: 3, pb: 3 }}>
      <Stack spacing={3}>
        <Stack
          component="article"
          spacing={2}
          sx={{
            p: 2,
            bgcolor: "#f7f9fb",
            borderRadius: 2,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="subtitle2" fontWeight={700}>
              Dados do dia
            </Typography>
            <Chip
              label="Somente leitura"
              variant="outlined"
              size="small"
              sx={{
                borderColor: "rgba(0, 0, 0, 0.28)",
                color: "text.primary",
              }}
            />
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Dia
            </Typography>
            <Typography variant="body1">{dailyData.day}</Typography>
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Descrição Cardápio
            </Typography>
            <Typography variant="body1">{dailyData.menuDescription}</Typography>
          </Stack>
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          {dailyData.fields.map((field) => (
            <TextField
              key={field.id}
              fullWidth
              id={field.id}
              label={field.label}
              value={values[field.id]}
              onChange={(event) => {
                const nextValue = Number(event.target.value);
                if (!Number.isNaN(nextValue)) {
                  updateValue(field.id, nextValue);
                }
              }}
              inputProps={{
                inputMode: "numeric",
                "aria-label": field.label,
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ mr: -0.5 }}>
                    <Stack
                      spacing={0}
                      alignItems="center"
                      justifyContent="center"
                      sx={{
                        width: 16,
                        height: 24,
                        bgcolor: "grey.300",
                      }}
                    >
                      <IconButton
                        aria-label={`Aumentar ${field.label}`}
                        size="small"
                        onClick={() =>
                          updateValue(field.id, values[field.id] + 1)
                        }
                        sx={{
                          width: 16,
                          height: 12,
                          p: 0,
                          borderRadius: 0,
                        }}
                      >
                        <KeyboardArrowUp sx={{ fontSize: 14 }} />
                      </IconButton>
                      <IconButton
                        aria-label={`Diminuir ${field.label}`}
                        size="small"
                        onClick={() =>
                          updateValue(field.id, values[field.id] - 1)
                        }
                        sx={{
                          width: 16,
                          height: 12,
                          p: 0,
                          borderRadius: 0,
                        }}
                      >
                        <KeyboardArrowDown sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Stack>
                  </InputAdornment>
                ),
              }}
            />
          ))}
        </Stack>
      </Stack>
    </Box>
  );
};

export default ContedoDoDilogo;
```

**Divergências conhecidas entre este protótipo e esta spec** (a implementação deve seguir a spec):
- O protótipo original não valida Fichas; nesta versão Fichas aceita apenas inteiros não negativos e ambos os campos são editáveis.
- O estado guarda `Number(...)`, então apagar o campo vira `0` e não dá para limpar o valor nem digitar `1,5`. Guardar o texto digitado e converter só na validação/salvamento.
- O `inputMode` é `numeric`, que não mostra vírgula/ponto em teclados móveis; usar `decimal` para o desperdício.
- As setas têm 16x12px (abaixo de 44px de toque); no mobile são ocultadas.
- Não há `Dialog`, título, texto de apoio nem rodapé. Envolver em `Dialog` com `DialogTitle` ("Editar relatório do dia", com `id` ligado ao `aria-labelledby`), `DialogContent` e `DialogActions` com "CANCELAR" e "SALVAR ALTERAÇÕES".
- `inputProps` e `InputProps` são depreciados no MUI v9; usar `slotProps={{ htmlInput: {...}, input: { endAdornment: ... } }}`. O `aria-label` é redundante, já que o campo tem `label`.
- Os dados (`dailyData`) são fixos e não recebem a linha selecionada; devem vir da linha clicada.
- A linha azul ao redor do conteúdo no print vem do clique de seleção no Figma e não faz parte da tela.

## Código de referência (menu de exportação)

Protótipo exportado do Figma em MUI para o menu aberto pelo botão "Exportar".

```jsx
import { Divider, MenuItem, MenuList, Paper, Typography } from "@mui/material";
import { useState } from "react";

const exportFormats = ["PDF", "CSV"];

const MenuExportao = () => {
  const [selectedFormat, setSelectedFormat] = useState(null);

  return (
    <Paper
      component="nav"
      aria-label="Export options"
      elevation={0}
      sx={{
        width: 110,
        overflow: "hidden",
        bgcolor: "background.paper",
        borderRadius: 1,
      }}
    >
      <MenuList disablePadding>
        {exportFormats.map((format, index) => (
          <div key={format}>
            <MenuItem
              selected={selectedFormat === format}
              onClick={() => setSelectedFormat(format)}
              sx={{
                minHeight: 29,
                px: 1,
                py: 0.5,
              }}
            >
              <Typography variant="body2">{format}</Typography>
            </MenuItem>
            {index < exportFormats.length - 1 && <Divider />}
          </div>
        ))}
      </MenuList>
    </Paper>
  );
};

export default MenuExportao;
```

**Divergências conhecidas entre este protótipo e esta spec** (a implementação deve seguir a spec):
- O menu é um `Paper` solto, sem ancoragem no botão. Na spec, usar o MUI `Menu` com `anchorEl`, `open` e `onClose`, e `aria-haspopup`/`aria-expanded`/`aria-controls` no botão "Exportar".
- Clicar só marca o item (`selectedFormat`); na spec clicar dispara a exportação do formato escolhido e fecha o menu, sem estado de seleção persistente.
- Os `<div>` dentro do `MenuList` quebram a navegação por setas e a semântica; usar `Fragment` com `key` e `Divider component="li"`.
- `aria-label="Export options"` está em inglês; usar "Opções de exportação".
- `minHeight: 29` e `width: 110` estão abaixo do touch target de 44px no mobile.
