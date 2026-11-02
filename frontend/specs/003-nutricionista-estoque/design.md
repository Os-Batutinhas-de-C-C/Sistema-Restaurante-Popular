# Design — Gerenciamento de Estoque de Alimentos

## Objetivo da experiência

Uma interface limpa para consulta rápida de ingredientes na despensa, utilizando tabela/lista expansível para visualização no desktop e estrutura de *cards* fluida para leitura no celular.

# Código de referência (APENAS REFERENCIAL FEITO PELO ANIMA)
------TELA ESTOQUE------

import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import {
  Autocomplete,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";

const inventoryItems = [
  {
    name: "Arroz branco parboilizado",
    batch: "Lote 2409-AB",
    stock: "1.240 kg",
    delivery: "Entrega: 10/09/2026",
    expiration: "Validade: 10/10/2026",
    status: "No prazo",
    statusColor: "#2E7D32",
    observation: ["Recebimento completo.", "Produto para uso rápido"],
  },
  {
    name: "Tomate cereja",
    batch: "Lote 2410-TC",
    stock: "48 caixas",
    delivery: "Entrega: 12/09/2026",
    expiration: "Validade: 18/09/2026",
    status: "Vence em breve",
    statusColor: "#EF6C00",
    observation: [
      "Recebimento completo.",
      "Lote armazenado em",
      "paletes fechados.",
    ],
  },
  {
    name: "Farinha de trigo tipo 1",
    batch: "Lote 2411-FT",
    stock: "860 kg",
    delivery: "Entrega: 14/09/2026",
    expiration: "Validade: 14/10/2026",
    status: "No prazo",
    statusColor: "#2E7D32",
    observation: [
      "Envio parcial, solicitar o",
      "restante no próximo",
      "pedido",
    ],
  },
  {
    name: "Leite integral UHT",
    batch: "Lote 2412-LI",
    stock: "96 caixas",
    delivery: "Entrega: 15/09/2026",
    expiration: "Validade: 15/12/2026",
    status: "No prazo",
    statusColor: "#2E7D32",
    observation: ["Recebimento completo.", "Produto de uso rápido"],
  },
];

const Frame = () => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems = inventoryItems.filter((item) =>
    item.name.toLowerCase().includes(searchValue.toLowerCase()),
  );

  return (
    <Box component="main" sx={{ width: "100%", pt: "26px" }}>
      <Stack
        spacing={1}
        sx={{
          width: "100%",
          maxWidth: "692px",
          mx: "auto",
          px: { xs: 2, sm: 0 },
        }}
      >
        <Typography
          component="h1"
          variant="h1"
          sx={{ mb: "18px", fontSize: "23px", lineHeight: 1.2 }}
        >
          Estoque de Alimentos
        </Typography>
        <Paper
          component="form"
          variant="outlined"
          onSubmit={(event) => event.preventDefault()}
          sx={{
            minHeight: "84px",
            borderRadius: "10px",
            px: "24px",
            py: "24px",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Autocomplete
              freeSolo
              options={[]}
              inputValue={searchValue}
              onInputChange={(_, value) => setSearchValue(value)}
              sx={{ flex: 1 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Buscar insumo pelo nome..."
                  size="small"
                  inputProps={{
                    ...params.inputProps,
                    "aria-label": "Buscar insumo pelo nome",
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: "33px",
                      borderRadius: "4px",
                    },
                    "& .MuiInputBase-input": {
                      py: 0,
                      fontSize: "12px",
                    },
                  }}
                />
              )}
            />
            <Button
              type="button"
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: "14px !important" }} />}
              sx={{
                height: "34px",
                minWidth: "160px",
                borderRadius: "4px",
                fontSize: "12px",
                bgcolor: "primary.main",
              }}
            >
              ADICIONAR INSUMO
            </Button>
          </Stack>
        </Paper>
        <Paper
          component="section"
          aria-label="Lista de estoque de alimentos"
          variant="outlined"
          sx={{
            mt: "7px !important",
            overflow: "hidden",
            borderRadius: "10px",
            px: "24px",
            py: "17px",
          }}
        >
          <Table
            size="small"
            aria-label="Estoque de alimentos"
            sx={{
              tableLayout: "fixed",
              "& .MuiTableCell-root": {
                px: 0,
                py: 0,
                verticalAlign: "middle",
              },
            }}
          >
            <TableHead>
              <TableRow sx={{ height: "42px" }}>
                <TableCell sx={{ width: "23.5%", fontSize: "11px" }}>
                  Insumo e Lote
                </TableCell>
                <TableCell sx={{ width: "14.5%", fontSize: "11px" }}>
                  Estoque Atual
                </TableCell>
                <TableCell sx={{ width: "22.5%", fontSize: "11px" }}>
                  Datas
                </TableCell>
                <TableCell sx={{ width: "12.5%", fontSize: "11px" }}>
                  Status
                </TableCell>
                <TableCell sx={{ width: "20.5%", fontSize: "11px" }}>
                  Observação
                </TableCell>
                <TableCell sx={{ width: "6.5%" }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.batch} sx={{ height: "59px" }}>
                  <TableCell>
                    <Typography
                      component="p"
                      sx={{
                        color: "text.primary",
                        fontSize: "11px",
                        fontWeight: 700,
                        lineHeight: 1.2,
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography
                      component="p"
                      sx={{
                        color: "text.secondary",
                        fontSize: "10px",
                        lineHeight: 1.2,
                        mt: "1px",
                      }}
                    >
                      {item.batch}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      component="p"
                      sx={{
                        color: "text.primary",
                        fontSize: "11px",
                        fontWeight: 700,
                        lineHeight: 1.2,
                      }}
                    >
                      {item.stock}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      component="p"
                      sx={{ fontSize: "10px", lineHeight: 1.2 }}
                    >
                      {item.delivery}
                    </Typography>
                    <Typography
                      component="p"
                      sx={{ fontSize: "10px", lineHeight: 1.2 }}
                    >
                      {item.expiration}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        bgcolor: item.statusColor,
                        color: "common.white",
                        borderRadius: "10px",
                        px: "5px",
                        py: "2px",
                        fontSize: "10px",
                        fontWeight: 700,
                        lineHeight: 1,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.status}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {item.observation.map((line) => (
                      <Typography
                        component="p"
                        key={line}
                        sx={{ fontSize: "10px", lineHeight: 1.2 }}
                      >
                        {line}
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Stack
                      direction="row"
                      spacing="6px"
                      justifyContent="flex-end"
                    >
                      <Tooltip title="Editar">
                        <IconButton
                          aria-label={`Editar ${item.name}`}
                          size="small"
                          onClick={() => setSelectedItem(item.batch)}
                          sx={{
                            width: "25px",
                            height: "25px",
                            bgcolor: "primary.main",
                            color: "common.white",
                            "&:hover": { bgcolor: "primary.dark" },
                          }}
                        >
                          <EditOutlinedIcon sx={{ fontSize: "15px" }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ver lote">
                        <IconButton
                          aria-label={`Ver lote de ${item.name}`}
                          size="small"
                          onClick={() => setSelectedItem(item.batch)}
                          sx={{
                            width: "25px",
                            height: "25px",
                            bgcolor: "primary.main",
                            color: "common.white",
                            "&:hover": { bgcolor: "primary.dark" },
                          }}
                        >
                          <Inventory2OutlinedIcon sx={{ fontSize: "15px" }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
        <Box
          aria-live="polite"
          sx={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
          }}
        >
          {selectedItem ? `Lote selecionado: ${selectedItem}` : ""}
        </Box>
      </Stack>
    </Box>
  );
};
export default Frame;


------Dialog de editar------

import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

const initialValues = {
  name: "Tomate Cereja",
  quantity: "48",
  unit: "caixas",
  batch: "2410-TC",
  deliveryDate: "12/09/2026",
  expirationDate: "18/10/2026",
  notes: "Recebimento completo. Produto para uso rápido",
  status: "Vence em breve",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 56,
  },
};

export const InsumoDialogDe = () => {
  const [values, setValues] = useState(initialValues);

  const handleChange = (field) => (event) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: event.target.value,
    }));
  };

  const handleCancel = () => {
    setValues(initialValues);
  };

  const quantityAdornment = (
    <InputAdornment position="end" sx={{ mr: -1.25 }}>
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={0}
        sx={{
          width: 26,
          height: 32,
          bgcolor: "material.grey300",
        }}
      >
        <KeyboardArrowUp
          sx={{ fontSize: 18, color: "text.secondary", mt: -0.5 }}
        />
        <KeyboardArrowDown
          sx={{ fontSize: 18, color: "text.secondary", mt: -1 }}
        />
      </Stack>
    </InputAdornment>
  );

  return (
    <Paper
      component="section"
      aria-labelledby="insumo-title"
      elevation={0}
      sx={{
        width: "100%",
        border: 1,
        borderColor: "slate.200",
        borderRadius: 4,
        px: 4,
        pt: "13px",
        pb: 4,
      }}
    >
      <Stack spacing={3}>
        <Box component="header" sx={{ px: 3, pt: 3 }}>
          <Typography component="h2" id="insumo-title" variant="h6">
            Insumo
          </Typography>
        </Box>
        <Box
          component="form"
          aria-label="Detalhes do insumo"
          noValidate
          sx={{ px: 3, pb: 3 }}
        >
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Nome do insumo"
              value={values.name}
              onChange={handleChange("name")}
              sx={fieldSx}
            />
              <TextField
                fullWidth
                label="Quantidade"
                type="text"
                inputMode="numeric"
                value={values.quantity}
                onChange={handleChange("quantity")}
                InputProps={{ endAdornment: quantityAdornment }}
                sx={fieldSx}
              />
              <TextField
                fullWidth
                label="Unidade"
                value={values.unit}
                onChange={handleChange("unit")}
                sx={fieldSx}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              label="Lote"
              value={values.batch}
              onChange={handleChange("batch")}
              sx={fieldSx}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="Data de entrega"
                value={values.deliveryDate}
                onChange={handleChange("deliveryDate")}
                sx={fieldSx}
              />
              <TextField
                fullWidth
                label="Data de validade"
                value={values.expirationDate}
                onChange={handleChange("expirationDate")}
                sx={fieldSx}
              />
            </Stack>
            <TextField
              fullWidth
              label="Observações"
              value={values.notes}
              onChange={handleChange("notes")}
              sx={fieldSx}
            />
            <TextField
              fullWidth
              select
              label="Status"
              value={values.status}
              onChange={handleChange("status")}
              sx={fieldSx}
            >
              <MenuItem value="Vence em breve">Vence em breve</MenuItem>
            </TextField>
          </Stack>
        </Box>
        <Stack
          component="footer"
          direction="row"
          justifyContent="flex-end"
          spacing={1.5}
        >
          <Button
            type="button"
            variant="text"
            color="primary"
            onClick={handleCancel}
            sx={{ px: 1, py: 0.75 }}
          >
            CANCELAR
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="info"
            onClick={() => undefined}
            sx={{ px: 2.75, py: 1 }}
          >
            CONFIRMAR
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default InsumoDialogDe;


------Dialog de Cadastro------

import {
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

const insumoData = {
  nome: "Arroz branco parboilizado",
  quantidade: "1.240",
  unidade: "kg",
  lote: "2409-AB",
  dataEntrega: "10/09/2026",
  dataValidade: "10/10/2026",
  observacoes: "Recebimento completo. Lote armazenado em paletes fechados.",
  status: "No prazo",
};

const statusOptions = [insumoData.status];

const ReadOnlyField = ({
  label,
  value,
  multiline = false,
  type = "text",
  inputProps,
}) => (
  <TextField
    fullWidth
    label={label}
    value={value}
    type={type}
    multiline={multiline}
    minRows={multiline ? 2 : undefined}
    InputProps={{ readOnly: true }}
    inputProps={inputProps}
  />
);

const InsumoDialogDe = () => {
  const [quantity, setQuantity] = useState(insumoData.quantidade);
  const [status, setStatus] = useState(insumoData.status);

  const pairedFields = [
    [
      {
        label: "Quantidade",
        value: quantity,
        type: "number",
        onChange: (event) => setQuantity(event.target.value),
        inputProps: { step: 1 },
      },
      {
        label: "Unidade",
        value: insumoData.unidade,
      },
    ],
    [
      {
        label: "Data de entrega",
        value: insumoData.dataEntrega,
      },
      {
        label: "Data de validade",
        value: insumoData.dataValidade,
      },
    ],
  ];

  return (
    <Paper
      component="section"
      variant="outlined"
      aria-labelledby="insumo-title"
      sx={{
        width: "100%",
        maxWidth: 620,
        mx: "auto",
        pt: "13px",
        px: 4,
        pb: 4,
        borderColor: "divider",
      }}
    >
      <Box component="header" sx={{ px: 3, pt: 3 }}>
        <Typography id="insumo-title" component="h2" variant="h5">
          Insumo
        </Typography>
      </Box>
      <Stack
        component="form"
        spacing={2}
        sx={{ px: 3, pt: 0, pb: 3 }}
        onSubmit={(event) => event.preventDefault()}
      >
        <ReadOnlyField label="Nome do insumo" value={insumoData.nome} />
        {pairedFields.map((fields) => (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            {fields.map((field) =>
              field.label === "Quantidade" ? (
                <TextField
                  key={field.label}
                  fullWidth
                  label={field.label}
                  value={field.value}
                  type={field.type}
                  onChange={field.onChange}
                  inputProps={field.inputProps}
                />
              ) : (
                <ReadOnlyField
                  key={field.label}
                  label={field.label}
                  value={field.value}
                />
              ),
            )}
          </Stack>
        ))}

        <ReadOnlyField label="Lote" value={insumoData.lote} />
        <ReadOnlyField
          label="Observações"
          value={insumoData.observacoes}
          multiline
        />
        <TextField
          fullWidth
          select
          label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {statusOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
        <Button type="button" color="primary" sx={{ px: 1, py: 0.75 }}>
          CANCELAR
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="info"
          sx={{
            px: "22px",
            py: 1,
            typography: "buttonLarge",
          }}
        >
          CONFIRMAR
        </Button>
      </Stack>
    </Paper>
  );
};

export default InsumoDialogDe;


## Histórias atendidas

- **HU010:** CRUD básico de insumos em estoque.

## Design Tokens e Componentes Base (MUI)

- **Cores Status:** Verde (`color="success"`), Laranja (`color="warning"`). Botões azuis (`color="primary"`).
- **Navbar:** Navbar global padronizada.

### 1. Cabeçalho e Barra de Pesquisa
- **Container:** MUI `<Box>` ou `<Stack>`.
- **Título:** `<Typography variant="h5">` ("Estoque de Alimentos").
- **Barra de Ações:** MUI `<Card variant="outlined">` contendo um `<Stack direction="row" spacing={2}>`.
- **Pesquisa:** `<TextField placeholder="Buscar insumo pelo nome..." fullWidth variant="outlined" size="small">`.
- **Botão Adicionar:** `<Button variant="contained" color="primary">` ("+ ADICIONAR INSUMO").

### 2. Lista de Estoque (Listagem de Insumos)
- **Container Principal:** MUI `<Card variant="outlined">`.
- **Desktop (Tabela Customizada):**
  - Usar estrutura de linha com `<Grid container>` ou `<Box display="flex">` para o cabeçalho (Insumo e Lote, Estoque Atual, Datas, Status, Observação).
  - Cada item da lista será renderizado como uma linha exibindo as informações alinhadas às colunas do cabeçalho.
- **Chip de Status:** Usar MUI `<Chip label="No prazo" color="success" size="small">`.
- **Ações da linha:** `<Stack direction="row">` com dois `<IconButton color="primary">` (um para Editar "lápis", um para Excluir "X").

### 3. Modal (Dialog) de Insumo (Cadastro/Edição)
- **Container:** MUI `<Dialog fullWidth maxWidth="sm">`.
- **Cabeçalho:** `<DialogTitle>` ("Insumo").
- **Corpo:** `<DialogContent>`.
  - Formulário usando `<Grid container spacing={2}>` com `<TextField variant="outlined" fullWidth>` para todos os campos textuais.
  - **Inputs:**
    - "Nome do insumo" (largura total 12).
    - "Quantidade" (tipo `number` com seta indicadora nativa) e "Unidade" dividindo o espaço em uma linha.
    - "Lote" (largura total).
    - "Data de entrega" e "Data de validade" dividindo o espaço em uma linha. Usar tipo `date` para acionar calendário nativo, se preferir ou formato texto de máscara.
    - "Observações" (largura total).
    - "Status": Usar `<TextField select>` configurando o dropdown.
- **Rodapé:** `<DialogActions>` com dois botões: `<Button variant="text">` ("CANCELAR") e `<Button variant="contained">` ("CONFIRMAR").

## Responsividade (Mobile-First)

- **Mobile (telas pequenas, ex: 360px):**
  - **Barra de Ações:** O `<TextField>` de busca e o `<Button>` "+ ADICIONAR" devem empilhar verticalmente.
  - **Lista de Insumos:** Ao invés da linha de tabela do Desktop, cada insumo vira um **Card em formato de coluna** (ver referência "Mobile"). A estrutura renderiza os rótulos seguidos de seus valores (ex: "Estoque Atual" acima, "1.240 kg" em negrito abaixo). As datas e ações de botão vão para o final do card do insumo.
  - **Modal de Insumo:** Os campos divididos em coluna (ex: Quantidade / Unidade) passam a ocupar 100% de largura cada, empilhando-se verticalmente.
