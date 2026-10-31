# Design — Gerenciamento de Cardápio e Histórico

## Objetivo da experiência

Fornecer um formulário claro e direto para a inserção dos dados nutricionais de um dia, apoiado por uma ferramenta de busca em modal para reaproveitar cardápios antigos.


# Código de referência (APENAS REFERENCIAL)
import AccountCircle from "@mui/icons-material/AccountCircle";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Menu from "@mui/icons-material/Menu";
import Restaurant from "@mui/icons-material/Restaurant";
import {
  AppBar,
  Box,
  Button,
  CssBaseline,
  IconButton,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";

const weekDays = [
  { name: "Segunda-feira", date: "21/09/2026" },
  { name: "Terça-feira", date: "22/09/2026" },
  { name: "Quarta-feira", date: "23/09/2026" },
  { name: "Quinta-feira", date: "24/09/2026" },
  { name: "Sexta-feira", date: "25/09/2026" },
];

const initialMenu = {
  pratoProteico: "Suíno com Legumes",
  opcaoProteica: "Omelete",
  acompanhamento1: "Arroz Branco",
  acompanhamento2: "Feijão Carioca",
  guarnicao: "Farofa de Cuscuz",
  saladaDoDia: "Salada Crua",
  sobremesa: "Doce",
  sucoNatural: "Suco de Polpa de Cajá",
  valorCalorico: "950",
};

const menuFields = [
  { key: "pratoProteico", label: "Prato Proteico" },
  { key: "opcaoProteica", label: "Opção Proteica" },
  { key: "acompanhamento1", label: "Acompanhamento 1" },
  { key: "acompanhamento2", label: "Acompanhamento 2" },
  { key: "guarnicao", label: "Guarnição" },
  { key: "saladaDoDia", label: "Salada do Dia" },
  { key: "sobremesa", label: "Sobremesa" },
  { key: "sucoNatural", label: "Suco Natural" },
  { key: "valorCalorico", label: "Valor Calórico Estimado (kcal)" },
];

const PainelNutricionista = () => {
  const [selectedDay, setSelectedDay] = useState(2);
  const [menu, setMenu] = useState(initialMenu);

  const handleMenuChange = (event) => {
    const { name, value } = event.target;
    setMenu((currentMenu) => ({ ...currentMenu, [name]: value }));
  };

  const handleCopyHistory = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(
        menuFields.map(({ key, label }) => `${label}: ${menu[key]}`).join("\n"),
      );
    }
  };

  return (
    <>
      <CssBaseline />
      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          pb: 6,
        }}
      >
        <AppBar component="header" position="static" elevation={2}>
          <Toolbar
            sx={{ minHeight: "50px !important", px: { xs: 1.5, sm: 3 } }}
          >
            <IconButton
              aria-label="Abrir menu de navegação"
              color="inherit"
              edge="start"
              sx={{ mr: 2 }}
            >
              <Menu />
            </IconButton>
            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              sx={{ flexGrow: 1 }}
            >
              <Restaurant fontSize="small" />
              <Typography
                variant="subtitle1"
                sx={{ color: "common.white", fontWeight: 500 }}
              >
                Painel Nutricionista
              </Typography>
            </Stack>
            <IconButton aria-label="Perfil do usuário" color="inherit">
              <AccountCircle sx={{ color: "secondary.main", fontSize: 31 }} />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            width: "100%",
            maxWidth: 640,
            mx: "auto",
            px: { xs: 2, sm: 0 },
            pt: 3.25,
          }}
        >
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton aria-label="Voltar" size="small" color="primary">
                <ArrowBack fontSize="small" />
              </IconButton>
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  component="h1"
                  variant="h4"
                  sx={{ fontSize: 24, fontWeight: 500, lineHeight: 1.2 }}
                >
                  Gerenciamento de Cardápio
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  21 a 25 de Setembro
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  aria-label="Semana anterior"
                  variant="contained"
                  size="small"
                  startIcon={<ChevronLeft fontSize="small" />}
                  sx={{
                    minWidth: 122,
                    height: 24,
                    fontSize: 10,
                    textTransform: "none",
                  }}
                >
                  Semana Anterior
                </Button>
                <Button
                  aria-label="Próxima semana"
                  variant="contained"
                  size="small"
                  endIcon={<ChevronRight fontSize="small" />}
                  sx={{
                    minWidth: 122,
                    height: 24,
                    fontSize: 10,
                    textTransform: "none",
                  }}
                >
                  Próxima Semana
                </Button>
              </Stack>
            </Stack>
            <Paper
              component="nav"
              aria-label="Dias da semana"
              variant="outlined"
              sx={{ p: 1.5, borderRadius: 1.25 }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                  gap: 0.5,
                }}
              >
                {weekDays.map((day, index) => {
                  const isSelected = selectedDay === index;

                  return (
                    <Button
                      key={day.date}
                      onClick={() => setSelectedDay(index)}
                      variant="outlined"
                      disableElevation
                      sx={{
                        minWidth: 0,
                        minHeight: 56,
                        px: 1,
                        py: 0.75,
                        borderColor: isSelected
                          ? "primary.main"
                          : "transparent",
                        borderBottomColor: isSelected
                          ? "primary.main"
                          : "divider",
                        borderRadius: isSelected ? 1 : 0,
                        color: isSelected ? "primary.main" : "text.primary",
                        alignItems: "flex-start",
                        justifyContent: "center",
                        textAlign: "left",
                        textTransform: "none",
                        "&:hover": {
                          borderColor: isSelected ? "primary.main" : "divider",
                          bgcolor: "transparent",
                        },
                      }}
                    >
                      <Stack spacing={0} sx={{ width: "100%" }}>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: 11,
                            fontWeight: isSelected ? 500 : 400,
                            lineHeight: 1.25,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {day.name}
                        </Typography>
                        <Typography
                          component="span"
                          sx={{
                            fontSize: 11,
                            fontWeight: 400,
                            lineHeight: 1.25,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {day.date}
                        </Typography>
                      </Stack>
                    </Button>
                  );
                })}
              </Box>
            </Paper>
          </Stack>
          <Paper
            component="section"
            aria-labelledby="menu-title"
            variant="outlined"
            sx={{ mt: 1, p: 3.25, borderRadius: 1.25 }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={2}
              sx={{ pb: 2, borderBottom: 1, borderColor: "divider" }}
            >
              <Box>
                <Typography
                  id="menu-title"
                  component="h2"
                  variant="h6"
                  sx={{ fontWeight: 500 }}
                >
                  Cardápio: Quarta-feira, 23/09
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Defina a composição nutricional para o almoço.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  sx={{ fontSize: 10, textTransform: "none", height: 24 }}
                >
                  Gerar Cardápio
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleCopyHistory}
                  sx={{ fontSize: 10, textTransform: "none", height: 24 }}
                >
                  Copiar Do Histórico
                </Button>
              </Stack>
            </Stack>
            <Box
              component="form"
              onSubmit={(event) => event.preventDefault()}
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                },
                columnGap: 2.25,
                rowGap: 1.5,
                pt: 2,
              }}
            >
              {menuFields.map(({ key, label }) => (
                <TextField
                  key={key}
                  fullWidth
                  name={key}
                  label={label}
                  value={menu[key]}
                  onChange={handleMenuChange}
                  variant="standard"
                  size="small"
                  sx={{
                    "& .MuiInputLabel-root": {
                      fontSize: 10,
                      color: "text.secondary",
                    },
                    "& .MuiInputBase-input": {
                      fontSize: 12,
                      py: 0.25,
                    },
                  }}
                />
              ))}

              <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" }, pt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  fullWidth
                  sx={{ height: 34, fontSize: 11 }}
                >
                  Salvar Cardápio
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default PainelNutricionista;


--------MODAL--------
import {
  Autocomplete,
  Box,
  Button,
  Divider,
  List,
  ListItemButton,
  Paper,
  Radio,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

const menuHistory = [
  {
    day: "Segunda-feira",
    date: "21/09/2026",
    description:
      "Gado com Legumes, Omelete, Arroz a Grega, Feijão de Corda, ...",
  },
  {
    day: "Terça-feira",
    date: "22/09/2026",
    description:
      "Suíno ao Molho, Frango Cozido,Arroz Branco, Feijão Carioca, ...",
  },
  {
    day: "Quarta-feira",
    date: "23/09/2026",
    description:
      "Suíno com Legumes, Omelete, Arroz Branco, Feijão Carioca, Farofa de Cuscuz, Salada Crua, Doce, Suco de Polpa de Cajá",
    calories: "Valor Calórico Estimado (kcal): 950",
  },
];

const fieldSx = {
  "& .MuiInputBase-root": {
    minHeight: 30,
  },
  "& .MuiInputBase-input": {
    py: 0,
  },
  "& .MuiInputLabel-root": {
    transform: "translate(0, -1px) scale(1)",
  },
  "& .MuiInputLabel-shrink": {
    transform: "translate(0, -1px) scale(1)",
  },
};

const HistricoDeCardpios = () => {
  const [startDate, setStartDate] = useState("01/09/2026");
  const [endDate, setEndDate] = useState("30/09/2026");
  const [searchTerm, setSearchTerm] = useState("Suíno com Legumes");
  const [selectedDate, setSelectedDate] = useState("23/09/2026");

  const handleSearch = (event) => {
    event.preventDefault();
  };

  return (
    <Paper
      component="main"
      elevation={2}
      data-palette-mode="light"
      sx={{
        width: "100%",
        overflow: "hidden",
        borderRadius: 4,
        bgcolor: "background.paper",
      }}
    >
      <Box component="header" sx={{ px: 3, pt: 3, pb: 4 }}>
        <Stack spacing={1}>
          <Typography variant="subtitle2" color="info.dark">
            Copiar do Histórico
          </Typography>
          <Typography component="h1" variant="h6">
            Histórico de Cardápios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Selecione um cardápio para copiar para o dia em edição.
          </Typography>
        </Stack>
      </Box>
      <Box component="form" onSubmit={handleSearch} sx={{ px: 3, pb: 3 }}>
        <Stack spacing={2}>
          <Typography
            component="h2"
            variant="subtitle1"
            sx={{ color: "menu.main" }}
          >
            Filtros
          </Typography>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "flex-end" }}
          >
            <TextField
              variant="standard"
              label="Data inicial"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: { xs: "100%", md: 231 }, ...fieldSx }}
            />
            <TextField
              variant="standard"
              label="Data final"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: { xs: "100%", md: 231 }, ...fieldSx }}
            />
            <Autocomplete
              freeSolo
              disableClearable
              forcePopupIcon={false}
              options={[]}
              inputValue={searchTerm}
              onInputChange={(_, value) => setSearchTerm(value)}
              sx={{ flex: 1, minWidth: { xs: "100%", md: 240 } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  label="Pesquisar"
                  InputLabelProps={{
                    ...params.InputLabelProps,
                    shrink: true,
                  }}
                  sx={fieldSx}
                />
              )}
            />
            <Button
              type="submit"
              variant="contained"
              color="info"
              sx={{ px: "22px", whiteSpace: "nowrap" }}
            >
              PESQUISAR
            </Button>
          </Stack>
        </Stack>
      </Box>
      <Box
        component="section"
        aria-label="Cardápios disponíveis"
        sx={{ px: 3, pb: 3 }}
      >
        <List disablePadding role="radiogroup">
          {menuHistory.map((menu, index) => {
            const isSelected = selectedDate === menu.date;

            return (
              <Box key={menu.date}>
                <ListItemButton
                  component="article"
                  role="radio"
                  aria-checked={isSelected}
                  selected={isSelected}
                  onClick={() => setSelectedDate(menu.date)}
                  sx={{
                    alignItems: "flex-start",
                    gap: 1.5,
                    p: 2,
                    borderRadius: isSelected ? 2 : 0,
                    border: isSelected ? 1 : 0,
                    borderColor: isSelected ? "info.main" : "transparent",
                    bgcolor: isSelected ? "#f0f9ff" : "background.paper",
                    "&.Mui-selected": {
                      bgcolor: "#f0f9ff",
                    },
                    "&.Mui-selected:hover": {
                      bgcolor: "#f0f9ff",
                    },
                    "&:hover": {
                      bgcolor: isSelected ? "#f0f9ff" : "action.hover",
                    },
                  }}
                >
                  <Radio
                    checked={isSelected}
                    color="info"
                    value={menu.date}
                    inputProps={{ "aria-label": menu.day }}
                    sx={{
                      width: 24,
                      height: 24,
                      p: "2px",
                      mt: "2px",
                      color: "text.secondary",
                    }}
                  />
                  <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={2}
                      alignItems="center"
                    >
                      <Typography
                        component="h3"
                        variant="subtitle1"
                        sx={{
                          color: isSelected ? "info.dark" : "menu.main",
                        }}
                      >
                        {menu.day}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          flexShrink: 0,
                          color: "menu.secondary",
                          fontFamily:
                            '"Inter", "Roboto", Helvetica, Arial, sans-serif',
                        }}
                      >
                        {menu.date}
                      </Typography>
                    </Stack>
                    <Typography
                      variant="body1"
                      sx={{ color: "menu.secondary" }}
                    >
                      {menu.description}
                    </Typography>
                    {menu.calories && (
                      <Typography variant="body2" color="text.secondary">
                        {menu.calories}
                      </Typography>
                    )}

                    {isSelected && (
                      <Typography variant="subtitle2" color="info.dark">
                        Selecionado
                      </Typography>
                    )}
                  </Stack>
                </ListItemButton>
                {index < menuHistory.length - 1 && !isSelected && (
                  <Divider sx={{ borderColor: "divider" }} />
                )}
              </Box>
            );
          })}
        </List>
      </Box>
      <Divider sx={{ borderColor: "divider" }} />
      <Stack
        component="footer"
        direction="row"
        justifyContent="flex-end"
        spacing={2}
        sx={{ px: 3, py: 2 }}
      >
        <Button color="info" onClick={() => setSelectedDate("23/09/2026")}>
          Fechar
        </Button>
        <Button variant="contained" color="info">
          Selecionar Cardápio
        </Button>
      </Stack>
    </Paper>
  );
};

export default HistricoDeCardpios;



## Histórias atendidas

- **HU003:** Edição rápida do formulário de refeição.
- **HU016:** Busca e cópia de cardápio do histórico através de modal filtrável.

## Design Tokens (MUI) e Estrutura

- **Navbar:** Mantém a Navbar global já implementada.
- **Cores base:** Azul Primário (`#1976D2`), Botão Salvar Verde (`#2E7D32`), Fundo Modal Branco (`#FFFFFF`).
- **Tipografia:** Títulos em MUI `<Typography variant="h5">` ou `h6`.

### 1. Cabeçalho de Navegação Diária
- **Container:** MUI `<Box>` ou `<Stack direction="row">` com o título da página e o seletor de dias.
- **Título principal:** `<Typography variant="h5">` (Ex: "Gerenciamento de Cardápio").
- **Seletor de dias:** Uma lista horizontal (ex: `<Tabs>` ou conjunto de `<Button>`) exibindo os 5 dias da semana com suas respectivas datas. O dia selecionado deve possuir um destaque visual (borda ou fundo azul).

### 2. Formulário Principal
- **Card container:** MUI `<Card variant="outlined">` englobando o formulário.
- **Cabeçalho do Card:** Título com o dia ativo (ex: "Cardápio: Quarta-feira, 23/09") e os botões "Gerar Cardápio" e "Copiar Do Histórico" (MUI `<Button variant="contained">`).
- **Grid de Campos:** Usar MUI `<Grid container spacing={2}>` ou `<Stack direction="row" flexWrap="wrap">`.
- **Inputs:** 9 campos no total. Usar MUI `<TextField variant="standard" fullWidth>` (apenas com a linha inferior). Rótulos pequenos acima das linhas.
- **Rodapé do formulário:** MUI `<Button variant="contained" color="success" size="large" fullWidth>` ("SALVAR CARDÁPIO").

### 3. Modal "Histórico de Cardápios"
- **Container:** MUI `<Dialog fullWidth maxWidth="md">`.
- **Cabeçalho:** `<DialogTitle>` ("Histórico de Cardápios") com a instrução textual.
- **Filtros (Corpo topo):** `<Stack direction="row" spacing={2}>` contendo dois inputs de Data, um `<TextField variant="standard">` para pesquisa e um `<Button variant="contained">` ("PESQUISAR").
- **Lista de Resultados:** MUI `<List>`. Cada `<ListItem>` deve conter um MUI `<Radio>` para seleção única, seguido pela data em negrito e o resumo truncado dos pratos daquele dia. Quando selecionado, o fundo do `ListItem` fica levemente azul com a borda primária (usar a prop `selected` ou `sx`).
- **Rodapé:** `<DialogActions>` contendo botão "Fechar" (texto) e "Selecionar Cardápio" (preenchido).

## Estados da interface

- **Formulário limpo:** TextFields vazios esperando digitação.
- **Formulário preenchido via Histórico:** Os TextFields recebem o `value` do state atualizado instantaneamente após fechar o modal.
- **Salvamento:** Exibir feedback de carregamento no botão "Salvar Cardápio" (spinner) e depois um MUI `<Snackbar>` de sucesso.

## Responsividade

- **Desktop:** Layout de campos do formulário distribuídos em 2 colunas (50% de largura cada).
- **Mobile (360px):** O Grid se reorganiza empilhando os TextFields em 1 coluna (100% de largura). Os filtros do modal do Histórico também devem se empilhar no mobile.