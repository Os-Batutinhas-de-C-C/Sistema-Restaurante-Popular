# Design — Painel Administrativo: Notícias e Avisos

## Objetivo da experiência

A nutricionista ou gestor deve conseguir consultar as notícias de um período, publicar novas notícias com duração definida e excluir notícias, de forma que o Portal do Cidadão (RF001) mostre comunicados atualizados sobre o funcionamento do restaurante, em qualquer dispositivo.

## Histórias atendidas

- **HU018:** A nutricionista/gestor publica notícias em destaque na página inicial para informar rapidamente alterações operacionais.

## Fluxo principal

1. A pessoa acessa "Notícias e Avisos" no painel administrativo logado.
2. O sistema exibe o filtro de período e a lista de notícias do período padrão.
3. A pessoa clica em "Publicar Notícia".
4. O sistema abre um Dialog com o formulário (título, texto e duração em horas).
5. A pessoa preenche e confirma; a notícia aparece no topo da lista.
6. A pessoa pode clicar em "Visualizar" (olho) para ver a notícia completa ou em "Remover" para excluí-la.

## Estrutura da interface

*(Nota: A Navbar já existe e deve envolver o conteúdo principal)*

1. **Título da página:** "Notícias e Avisos".

2. **Barra de filtros**
   - Campo "Selecione o Período" (intervalo, ex: "21/09/2026 - 24/09/2026").
   - Botão "+ Publicar Notícia" alinhado à direita.

3. **Lista de notícias (tabela)**
   - Colunas: Data (data + hora abaixo), Título, Descrição (truncada com reticências), Duração (ex: 6h, 12h, 24h) e Ações.
   - Ações por linha: Visualizar (olho) e Remover (ícone de cancelar inscrição).

4. **Modal "Publicar Notícia" (MUI Dialog)**
   - Título: "Publicar Notícia".
   - Corpo: formulário "Dados do aviso" com os campos "Título do Aviso", "Texto do Aviso" e "Duração (horas)".
   - Rodapé: "Cancelar" e "Publicar".

5. **Modal "Visualizar Notícia" (MUI Dialog)**
   - Cabeçalho: título "Visualizar Notícia" e, logo abaixo, data e hora da publicação separadas por um divisor vertical (ex: "21/09/2026 | 08:12").
   - Corpo: título da notícia, texto completo e duração.
   - Rodapé: botão "Fechar" (texto alinhado à direita).

6. **Modal "Remover Notícia" (MUI Dialog)**
   - Texto de confirmação com o título da notícia e aviso de que a ação não pode ser desfeita.
   - Rodapé: "Cancelar" e "Remover".

## Campos e controles

### Filtro de período
- Tipo: campo de intervalo de datas. [SUPOSIÇÃO] O protótipo usa TextField readOnly; a spec prevê um seletor de intervalo (MUI X Date Range Picker, se permitido no projeto, ou dois TextFields `type="date"`).
- Comportamento: ao alterar o período, a lista é recarregada.
- Padrão: [SUPOSIÇÃO] semana atual (segunda a sexta).

### Botão Publicar Notícia
- Tipo: MUI Button (variante contida) com ícone "+".
- Comportamento: abre o modal de publicação.

### Campos do formulário de publicação
- **Título do Aviso:** MUI TextField multilinha (mínimo 2 linhas), obrigatório. [SUPOSIÇÃO] máx. 120 caracteres, pois o exemplo do Figma já tem ~85.
- **Texto do Aviso:** MUI TextField multilinha (mínimo 3 linhas), obrigatório. [SUPOSIÇÃO] máx. 500 caracteres, com contador.
- **Duração (horas):** MUI TextField numérico, obrigatório, aceita apenas inteiros positivos. [SUPOSIÇÃO] intervalo de 1 a 72 horas. Define por quanto tempo a notícia fica em destaque no Portal.
- O botão "Publicar" fica desabilitado enquanto houver campo obrigatório vazio ou duração inválida.
- Na tabela, a coluna Duração exibe o valor formatado (ex: "24h").

### Botão de Ação: Visualizar
- Tipo: MUI IconButton (variante preenchida, ícone de olho, 32x32 no desktop).
- Comportamento: abre o modal de visualização da notícia da linha.

### Botão de Ação: Remover
- Tipo: MUI IconButton (variante preenchida, ícone de cancelar inscrição).
- Comportamento: abre o modal de confirmação; ao confirmar, exclui a notícia (RF009).

## Estados da interface

- **Carregando:** MUI Skeleton sobre a barra de filtros e as linhas da tabela.
- **Sucesso:** tabela preenchida, do mais recente para o mais antigo. [SUPOSIÇÃO] sem paginação nesta versão.
- **Vazio:** mensagem "Nenhuma notícia no período selecionado." no lugar das linhas.
- **Erro:** [SUPOSIÇÃO] mensagem "Não foi possível carregar as notícias." com botão "Tentar novamente".
- **Feedback de ações:** MUI Snackbar após publicar ("Notícia publicada") e após remover ("Notícia removida").

## Responsividade

- **Desktop:** conteúdo centralizado em coluna única, largura máxima de aproximadamente 616px, com filtros e lista em cards (Paper) empilhados.
- **Mobile (a partir de 360px, conforme HU001):** [SUPOSIÇÃO] a tabela vira lista de cards, cada um com data/hora, título, descrição truncada, duração e botões de ação no rodapé. Filtro e botão "Publicar Notícia" empilham em largura total. Sem rolagem horizontal. Botões de ação com touch target de no mínimo 44x44px.

## Acessibilidade

- Os ícones de ação devem ter `aria-label` descritivo (ex: `aria-label="Visualizar Atualização do Cardápio"`, `aria-label="Remover Campanha de Saúde"`).
- Os modais devem aplicar foco inicial automático, fechar com Esc e possuir `aria-labelledby` apontando para o título.
- A tabela deve ter `aria-label="Lista de notícias e avisos"` e a seção de filtros `aria-label="Filtros de notícias e avisos"`.
- Todos os controles devem ser operáveis por teclado (Tab e Enter).

## Código de referência (protótipo da tela)

Protótipo exportado do Figma em MUI. Serve como referência visual (cores, medidas e estrutura dos componentes). Os `onClick` e o estado `selectedNotice` são placeholders e devem ser substituídos pelos handlers reais descritos em Tasks (T05 a T07). Os dados de `notices` devem vir do mock em `src/services/noticiasService.js`.

**Tokens visuais extraídos do protótipo**
- Cor primária dos botões: `#008fd3` (hover `#007fbc`).
- Texto principal: `#202124`. Texto secundário: `#4b5563` e `#4c5664`.
- Bordas dos cards: `#e5eaed`, com raio de 9px. Divisórias da tabela: `#edf0f2`.
- Botões de ação: 32x32 (no mobile, mínimo de 44x44px).
- Container: largura máxima de 616px, centralizado.

```jsx
import AddIcon from "@mui/icons-material/Add";
import UnsubscribeOutlinedIcon from "@mui/icons-material/UnsubscribeOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Box,
  Button,
  CssBaseline,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

const notices = [
  {
    id: 1,
    date: "21/09/2026",
    time: "08:12",
    title: "Atualização do Cardápio",
    description: "Atenção: o cardápi...",
    duration: "24h",
  },
  {
    id: 2,
    date: "22/09/2026",
    time: "09:45",
    title: "Manutenção no Restaura...",
    description: "Avisamos que o res...",
    duration: "12h",
  },
  {
    id: 3,
    date: "23/09/2026",
    time: "11:20",
    title: "Campanha de Saúde",
    description: "Nova campanha de...",
    duration: "6h",
  },
];

const actionButtonSx = {
  width: 32,
  height: 32,
  bgcolor: "#008fd3",
  color: "common.white",
  boxShadow: "0 3px 7px rgba(0, 0, 0, 0.22)",
  "&:hover": {
    bgcolor: "#007fbc",
  },
};

export const Frame = () => {
  const [selectedNotice, setSelectedNotice] = useState(null);

  return (
    <>
      <CssBaseline />
      <Box
        component="main"
        sx={{
          width: "100%",
          maxWidth: 616,
          mx: "auto",
          pt: "26px",
          px: { xs: 2, sm: 0 },
        }}
      >
        <Typography
          component="h1"
          sx={{
            mb: "26px",
            color: "#202124",
            fontSize: 23,
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: "-0.5px",
          }}
        >
          Notícias e Avisos
        </Typography>
        <Stack spacing={1}>
          <Paper
            component="section"
            variant="outlined"
            aria-label="Filtros de notícias e avisos"
            sx={{
              minHeight: 94,
              borderColor: "#e5eaed",
              borderRadius: "9px",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)",
              px: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Selecione o Período"
              value="21/09/2026 - 24/09/2026"
              size="small"
              variant="outlined"
              InputProps={{ readOnly: true }}
              InputLabelProps={{ shrink: true }}
              sx={{
                maxWidth: 250,
                "& .MuiOutlinedInput-root": {
                  height: 45,
                  borderRadius: "3px",
                  color: "#959595",
                  fontSize: 12,
                },
                "& .MuiInputLabel-root": {
                  color: "#686868",
                  fontSize: 10,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#d4d4d4",
                },
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 18 }} />}
              onClick={() => setSelectedNotice("publish")}
              sx={{
                minWidth: 168,
                height: 34,
                borderRadius: "3px",
                bgcolor: "#008fd3",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.23)",
                fontSize: 11,
                fontWeight: 700,
                "&:hover": {
                  bgcolor: "#007fbc",
                },
              }}
            >
              Publicar Notícia
            </Button>
          </Paper>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              borderColor: "#e5eaed",
              borderRadius: "9px",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)",
              px: "24px",
              py: "12px",
              overflow: "hidden",
            }}
          >
            <Table
              size="small"
              aria-label="Lista de notícias e avisos"
              sx={{
                tableLayout: "fixed",
                "& .MuiTableCell-root": {
                  borderColor: "#edf0f2",
                },
              }}
            >
              <TableHead>
                <TableRow sx={{ height: 49 }}>
                  <TableCell
                    sx={{
                      width: 103,
                      p: 0,
                      color: "#202124",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    Data
                  </TableCell>
                  <TableCell
                    sx={{
                      width: 150,
                      p: 0,
                      color: "#202124",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    Título
                  </TableCell>
                  <TableCell
                    sx={{
                      width: 167,
                      p: 0,
                      color: "#202124",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    Descrição
                  </TableCell>
                  <TableCell
                    sx={{
                      width: 74,
                      p: 0,
                      color: "#202124",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    Duração
                  </TableCell>
                  <TableCell sx={{ width: 74, p: 0 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {notices.map((notice, index) => (
                  <TableRow
                    hover
                    key={notice.id}
                    selected={selectedNotice === notice.id}
                    sx={{
                      height: 55,
                      "&:last-child .MuiTableCell-root": {
                        borderBottom: 0,
                      },
                    }}
                  >
                    <TableCell sx={{ p: 0, verticalAlign: "middle" }}>
                      <Typography
                        sx={{
                          color: "#202124",
                          fontSize: 11,
                          fontWeight: 700,
                          lineHeight: 1.25,
                        }}
                      >
                        {notice.date}
                      </Typography>
                      <Typography
                        sx={{
                          color: "#4c5664",
                          fontSize: 10,
                          lineHeight: 1.35,
                        }}
                      >
                        {notice.time}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ p: 0, verticalAlign: "middle" }}>
                      <Typography
                        noWrap
                        sx={{
                          color: "#202124",
                          fontSize: 11,
                          fontWeight: 700,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {notice.title}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ p: 0, verticalAlign: "middle" }}>
                      <Typography
                        noWrap
                        sx={{
                          color: "#4b5563",
                          fontSize: 11,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {notice.description}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ p: 0, verticalAlign: "middle" }}>
                      <Typography
                        sx={{
                          color: "#202124",
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {notice.duration}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ p: 0, verticalAlign: "middle" }}>
                      <Stack direction="row" spacing={0.75}>
                        <IconButton
                          aria-label={`Visualizar ${notice.title}`}
                          onClick={() => setSelectedNotice(notice.id)}
                          sx={actionButtonSx}
                        >
                          <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton
                          aria-label={`Remover ${notice.title}`}
                          onClick={() => setSelectedNotice(index)}
                          sx={actionButtonSx}
                        >
                          <UnsubscribeOutlinedIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Box>
    </>
  );
};

export default Frame;
```

**Divergências conhecidas entre o protótipo e esta spec** (a implementação deve seguir a spec):
- O filtro de período é `readOnly` com valor fixo; na spec vira um seletor de intervalo funcional.
- O botão "Publicar Notícia" e os dois IconButtons só chamam `setSelectedNotice`; na spec abrem os modais de publicar, visualizar e remover.
- A tabela usa `tableLayout: "fixed"` com larguras que somam cerca de 570px, o que estoura em 360px; na spec vira lista de cards no mobile.
- Os botões de ação têm 32x32; na spec precisam de no mínimo 44x44px no mobile.
- `onClick={() => setSelectedNotice(index)}` no botão Remover mistura `index` com `id` no mesmo estado; deve ser substituído pelo handler de remoção.

## Código de referência (interações e modais)

Protótipos exportados do Figma em MUI para os modais "Publicar Notícia" (corpo do formulário) e "Visualizar Notícia" (cabeçalho). Servem como referência de estrutura e rótulos. Os valores de `notice` e `publication` são exemplos fixos e devem vir do mock em `src/services/noticiasService.js`.

### Corpo do modal "Publicar Notícia"

```jsx
import { Box, Stack, TextField } from "@mui/material";
import { useState } from "react";

const noticeFields = {
  title:
    "Novo cardápio balanceado com ingredientes da agricultura familiar do Sertão Central",
  message:
    "Hortaliças frescas, polpas de frutas e feijão de corda fornecidos diretamente por pequenos produtores rurais cadastrados no município.",
  duration: "24",
};

export const DialogBody = () => {
  const [notice, setNotice] = useState(noticeFields);

  const handleChange = (field) => (event) => {
    setNotice((currentNotice) => ({
      ...currentNotice,
      [field]: event.target.value,
    }));
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 1,
      alignItems: "flex-start",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "grey.400",
      borderWidth: 2,
    },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "grey.500",
    },
    "& .MuiInputLabel-root": {
      color: "text.secondary",
      fontSize: "1.5rem",
      lineHeight: 1,
      backgroundColor: "background.paper",
      px: 0.5,
    },
    "& .MuiInputLabel-shrink": {
      transform: "translate(22px, -11px) scale(1)",
    },
    "& .MuiInputBase-input": {
      color: "text.primary",
      fontSize: "1.9rem",
      lineHeight: 1.52,
      letterSpacing: 0,
      py: 1.25,
    },
    "& .MuiInputBase-inputMultiline": {
      py: 0,
    },
  };

  return (
    <Box component="form" aria-label="Dados do aviso" width="100%">
      <Stack spacing={4.75}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          label="Título do Aviso"
          value={notice.title}
          onChange={handleChange("title")}
          sx={fieldSx}
        />
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Texto do Aviso"
          value={notice.message}
          onChange={handleChange("message")}
          sx={{
            ...fieldSx,
            "& .MuiInputBase-input": {
              ...fieldSx["& .MuiInputBase-input"],
              color: "text.secondary",
            },
          }}
        />
        <TextField
          fullWidth
          label="Duração (horas)"
          value={notice.duration}
          onChange={handleChange("duration")}
          inputMode="numeric"
          sx={fieldSx}
        />
      </Stack>
    </Box>
  );
};

export default DialogBody;
```

### Cabeçalho do modal "Visualizar Notícia"

```jsx
import { Box, Stack, Typography } from "@mui/material";

const publication = {
  title: "Visualizar Notícia",
  date: "21/09/2026",
  time: "08:12",
};

export const TtuloEPublicao = () => {
  return (
    <Box
      component="article"
      sx={{
        px: 5,
        py: 5,
      }}
    >
      <Stack component="header" spacing={2}>
        <Typography
          component="h1"
          sx={{
            color: "text.primary",
            fontSize: "2rem",
            fontWeight: 500,
            letterSpacing: 0,
            lineHeight: 1.2,
          }}
        >
          {publication.title}
        </Typography>
        <Stack
          direction="row"
          alignItems="center"
          spacing={3}
          aria-label={`Publicado em ${publication.date} às ${publication.time}`}
        >
          <Typography
            component="time"
            sx={{
              color: "text.secondary",
              fontSize: "1.5rem",
              lineHeight: 1.33,
            }}
          >
            {publication.date}
          </Typography>
          <Box
            component="span"
            role="separator"
            aria-orientation="vertical"
            sx={{
              width: "1px",
              height: 3,
              bgcolor: "divider",
            }}
          />
          <Typography
            component="time"
            sx={{
              color: "text.secondary",
              fontSize: "1.5rem",
              lineHeight: 1.33,
            }}
          >
            {publication.time}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default TtuloEPublicao;
```

**Divergências conhecidas entre estes protótipos e esta spec** (a implementação deve seguir a spec):
- Os tamanhos de fonte (`1.9rem`, `2rem`, `1.5rem`) vêm de um frame do Figma em escala ampliada. Não copiar: usar a tipografia do tema (corpo ~1rem, título do modal ~1.25rem).
- `inputMode="numeric"` no `TextField` não chega ao `<input>` (vai para o elemento raiz). Usar `slotProps={{ htmlInput: { inputMode: "numeric", pattern: "[0-9]*" } }}` (ou `inputProps` em versões antigas do MUI).
- O cabeçalho usa `<h1>` dentro de um `article`. Dentro do `Dialog`, usar `DialogTitle` (renderiza `h2`) com `id` referenciado em `aria-labelledby` do Dialog.
- O divisor vertical tem `height: 3` (24px no tema padrão) e `role="separator"` em um `span`. Pode ser trocado por `Divider orientation="vertical" flexItem`.
- O formulário não tem validação, contador de caracteres, nem botões. Isso vem dos modais (rodapé "Cancelar"/"Publicar") e das regras desta spec.
- O estado inicial vem preenchido com um exemplo. No modal de publicação, os campos começam vazios.
- Os dois trechos não mostram o conteúdo do modal "Visualizar" (título da notícia, texto e duração). Seguir a estrutura da seção "Estrutura da interface".