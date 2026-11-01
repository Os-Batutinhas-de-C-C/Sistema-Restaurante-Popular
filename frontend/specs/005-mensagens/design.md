# Design — Painel Administrativo: Mensagens (Fale Conosco)

## Objetivo da experiência

A nutricionista ou gestor deve conseguir consultar as mensagens enviadas pelos clientes pelo formulário "Fale Conosco" em um período e ler o conteúdo completo de cada uma, fechando o ciclo de atendimento e acompanhando o feedback recebido, em qualquer dispositivo.

## Histórias atendidas

- **RF010 (Gestão de mensagens do "Fale Conosco"):** a nutricionista acessa o painel "Mensagens" para ler e acompanhar os relatos enviados pelos clientes.
- **HU011 (parte administrativa):** as mensagens enviadas pelo formulário do cliente chegam ao painel de mensagens do administrador.

## Fluxo principal

1. A pessoa acessa "Mensagens" no painel administrativo logado.
2. O sistema exibe o filtro de período e a lista de mensagens do período padrão.
3. A pessoa clica no ícone de "Visualizar" (olho) de uma mensagem.
4. O sistema abre um Dialog com a mensagem completa e o botão para fechar.
5. [SUPOSIÇÃO] A pessoa pode clicar no ícone de envelope para responder ao cliente por e-mail (ver "Botão de Ação: Responder").

## Estrutura da interface

*(Nota: A Navbar já existe e deve envolver o conteúdo principal)*

1. **Título da página:** "Mensagens".

2. **Barra de filtro**
   - Campo "Selecione o Período" (intervalo, ex: "21/09/2026 – 24/09/2026").

3. **Lista de mensagens (tabela)**
   - Colunas: Data (data + hora abaixo), Título, Descrição (truncada com reticências) e Ações.
   - Ações por linha: Visualizar (olho) e Responder (envelope).

4. **Modal "Visualizar Mensagem" (MUI Dialog)**
   - Cabeçalho: título "Visualizar Mensagem" e, logo abaixo, data e hora do envio separadas por divisor vertical (mesmo padrão do modal "Visualizar Notícia").
   - Corpo: título da mensagem e, em um bloco destacado (fundo cinza claro e borda), o texto completo.
   - [SUPOSIÇÃO] Linha com o nome do remetente ("Não informado" quando vazio, pois o nome é opcional na HU011).
   - Rodapé: botão "Fechar" (texto alinhado à direita).

## Campos e controles

### Filtro de período
- Tipo: campo de intervalo de datas. [SUPOSIÇÃO] O protótipo usa TextField de texto livre; a spec prevê o mesmo seletor de intervalo da tela de Notícias (MUI X Date Range Picker, se permitido no projeto, ou dois TextFields `type="date"`), para manter consistência entre as telas.
- Comportamento: ao alterar o período, a lista é recarregada.
- Padrão: [SUPOSIÇÃO] semana atual (segunda a sexta).

### Botão de Ação: Visualizar
- Tipo: MUI IconButton (variante preenchida, ícone de olho, 32x32 no desktop).
- Comportamento: abre o modal de visualização da mensagem da linha.

### Botão de Ação: Responder
- Tipo: MUI IconButton (variante preenchida, ícone de envelope, 32x32 no desktop).
- [A CONFIRMAR] O protótipo traz o ícone com `aria-label="Enviar mensagem"`, mas o SRS não define resposta ao cliente: o formulário da HU011 só coleta mensagem (obrigatória) e nome (opcional), sem e-mail ou telefone. Sem um contato do cliente não há como responder.
- [SUPOSIÇÃO] Comportamento adotado nesta spec: o botão permanece conforme o Figma, mas fica desabilitado com Tooltip "Cliente não informou contato". A decisão (adicionar campo de contato opcional no formulário e habilitar `mailto:`, ou remover o botão) fica pendente com o cliente.

## Estados da interface

- **Carregando:** MUI Skeleton sobre o filtro e as linhas da tabela.
- **Sucesso:** tabela preenchida, da mais recente para a mais antiga. [SUPOSIÇÃO] sem paginação nesta versão.
- **Vazio:** mensagem "Nenhuma mensagem no período selecionado." no lugar das linhas.
- **Erro:** [SUPOSIÇÃO] mensagem "Não foi possível carregar as mensagens." com botão "Tentar novamente".

## Responsividade

- **Desktop:** conteúdo centralizado em coluna única, largura máxima de aproximadamente 616px, com filtro e lista em cards (Paper) empilhados.
- **Mobile (a partir de 360px, conforme HU001):** [SUPOSIÇÃO] a tabela vira lista de cards, cada um com data/hora, título, descrição truncada e botões de ação no rodapé do card. O filtro ocupa a largura total. Sem rolagem horizontal. Botões de ação com touch target de no mínimo 44x44px.

## Acessibilidade

- Os ícones de ação devem ter `aria-label` descritivo (ex: `aria-label="Visualizar mensagem: Sugestão de cardápio"`).
- O modal deve aplicar foco inicial automático, fechar com Esc e possuir `aria-labelledby` apontando para o título.
- A tabela deve ter `aria-label="Mensagens"` e a seção de filtro `aria-label="Filtro de período"`.
- Todos os controles devem ser operáveis por teclado (Tab e Enter).

## Código de referência (protótipo da tela)

Protótipo exportado do Figma em MUI. Serve como referência visual (cores, medidas e estrutura dos componentes). Os `onClick` são placeholders e devem ser substituídos pelos handlers descritos em Tasks. Os dados de `messages` devem vir do mock em `src/services/mensagensService.js`.

**Tokens visuais extraídos do protótipo**
- Cor dos botões de ação: `#0789cf` (hover `#0578b8`). Obs.: a tela de Notícias usa `#008fd3`; padronizar em uma cor só.
- Texto principal: `#1f1f1f` e `#202020`. Texto secundário: `#4f5663` e `#44505e`.
- Bordas dos cards: `#e4e8eb`, raio de 2 (16px no tema padrão). Divisórias da tabela: `#edf0f2`.
- Botões de ação: 32x32 (no mobile, mínimo de 44x44px).
- Container: largura máxima de 616px, centralizado.

```jsx
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import {
  Box,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

const messages = [
  {
    date: "21/09/2026",
    time: "08:12",
    title: "Sobre o almoço de segunda-feira",
    description: "Gostaria de expressar minha...",
  },
  {
    date: "22/09/2026",
    time: "09:45",
    title: "Sugestão de cardápio",
    description: "Venho por meio desta mensa...",
  },
  {
    date: "23/09/2026",
    time: "11:20",
    title: "Opinião sobre o restaurante",
    description: "Gosto muito das opções de...",
  },
  {
    date: "24/09/2026",
    time: "14:05",
    title: "Solicitação de ajuste no cardápio",
    description: "Requerimento para trocar o...",
  },
];

export const Frame = () => {
  const [period, setPeriod] = useState("21/09/2026 – 24/09/2026");

  return (
    <Box
      component="main"
      sx={{
        width: "100%",
        maxWidth: 616,
        mx: "auto",
        pt: 3,
        px: { xs: 2, sm: 0 },
      }}
    >
      <Stack spacing={1}>
        <Typography
          component="h1"
          sx={{
            fontSize: 24,
            fontWeight: 700,
            lineHeight: 1.3,
            color: "#1f1f1f",
          }}
        >
          Mensagens
        </Typography>
        <Paper
          component="section"
          variant="outlined"
          aria-label="Filtro de período"
          sx={{
            borderColor: "#e4e8eb",
            borderRadius: 2,
            px: 3,
            py: 3,
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)",
          }}
        >
          <TextField
            label="Selecione o Período"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            size="small"
            sx={{
              width: 250,
              "& .MuiInputLabel-root": {
                fontSize: 10,
              },
              "& .MuiInputBase-input": {
                color: "#929292",
                fontSize: 12,
                py: 1.3,
              },
            }}
          />
        </Paper>
        <Paper
          component="section"
          variant="outlined"
          aria-label="Lista de mensagens"
          sx={{
            overflow: "hidden",
            borderColor: "#e4e8eb",
            borderRadius: 2,
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)",
          }}
        >
          <Table
            size="small"
            aria-label="Mensagens"
            sx={{
              tableLayout: "fixed",
              "& .MuiTableCell-root": {
                borderColor: "#edf0f2",
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    width: "21%",
                    px: 1.75,
                    pt: 1.5,
                    pb: 1.25,
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  Data
                </TableCell>
                <TableCell
                  sx={{
                    width: "35%",
                    px: 1.75,
                    pt: 1.5,
                    pb: 1.25,
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  Título
                </TableCell>
                <TableCell
                  sx={{
                    width: "29%",
                    px: 1.75,
                    pt: 1.5,
                    pb: 1.25,
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  Descrição
                </TableCell>
                <TableCell sx={{ width: "15%", p: 0 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {messages.map((message) => (
                <TableRow key={`${message.date}-${message.time}`} hover>
                  <TableCell sx={{ px: 1.75, py: 1.35 }}>
                    <Typography
                      sx={{ fontSize: 12, fontWeight: 700, lineHeight: 1.15 }}
                    >
                      {message.date}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.15,
                        fontSize: 10,
                        lineHeight: 1.15,
                        color: "#44505e",
                      }}
                    >
                      {message.time}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ px: 1.75, py: 1.35 }}>
                    <Typography
                      noWrap
                      sx={{ fontSize: 12, fontWeight: 700, color: "#202020" }}
                    >
                      {message.title}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ px: 1.75, py: 1.35 }}>
                    <Typography noWrap sx={{ fontSize: 12, color: "#4f5663" }}>
                      {message.description}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ px: 0.5, py: 1.1 }}>
                    <Stack direction="row" spacing={0.75}>
                      <IconButton
                        aria-label={`Visualizar mensagem: ${message.title}`}
                        size="small"
                        onClick={() => undefined}
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: "#0789cf",
                          color: "#fff",
                          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.25)",
                          "&:hover": { bgcolor: "#0578b8" },
                        }}
                      >
                        <VisibilityOutlined sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton
                        aria-label={`Enviar mensagem: ${message.title}`}
                        size="small"
                        onClick={() => undefined}
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: "#0789cf",
                          color: "#fff",
                          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.25)",
                          "&:hover": { bgcolor: "#0578b8" },
                        }}
                      >
                        <EmailOutlined sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Stack>
    </Box>
  );
};

export default Frame;
```

**Divergências conhecidas entre o protótipo e esta spec** (a implementação deve seguir a spec):
- O filtro de período é um TextField de texto livre, sem validação nem formato; na spec vira um seletor de intervalo funcional que recarrega a lista.
- Os dois `onClick` são `() => undefined`; na spec o olho abre o modal de visualização e o envelope segue a decisão pendente da seção "Botão de Ação: Responder".
- O `aria-label` do envelope diz "Enviar mensagem", mas a mensagem já foi enviada pelo cliente; o rótulo correto é "Responder mensagem: {título}".
- A tabela tem quatro colunas em larguras percentuais com `tableLayout: "fixed"`. Em 360px o conteúdo fica espremido (data, título e descrição truncados e dois botões na mesma célula); na spec vira lista de cards no mobile.
- A `key` do `TableRow` é `${date}-${time}`, que colide se duas mensagens chegarem no mesmo minuto; usar um `id` da mensagem.
- Os botões de ação têm 32x32; na spec precisam de no mínimo 44x44px no mobile.
- O botão de ação usa `#0789cf`, enquanto a tela de Notícias usa `#008fd3`; padronizar via tema.

## Código de referência (modal "Visualizar Mensagem")

Protótipo exportado do Figma em MUI para o conteúdo do modal aberto pelo ícone de olho. Mostra apenas o bloco do texto da mensagem; o cabeçalho e o rodapé seguem a seção "Estrutura da interface". O texto de `ContedoDoDilogo` deve vir do mock.

```jsx
import { Paper, Typography } from "@mui/material";

export const ContedoDoDilogo = () => {
  return (
    <section>
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          minHeight: 182,
          p: 4,
          borderColor: "slate.200",
          borderRadius: 2,
          bgcolor: "#f7f9fb",
        }}
      >
        <Typography
          component="p"
          variant="body1"
          sx={{
            color: "text.primary",
            letterSpacing: "0.15px",
            lineHeight: 1.75,
          }}
        >
          Requerimento para trocar o acompanhamento do almoço da quinta-feira.
        </Typography>
      </Paper>
    </section>
  );
};

export default ContedoDoDilogo;
```

**Divergências conhecidas entre este protótipo e esta spec** (a implementação deve seguir a spec):
- `borderColor: "slate.200"` não é um token do tema do MUI; o valor é ignorado e a borda cai no padrão. Usar `"divider"` ou o hex `#e4e8eb` da tela.
- O texto é fixo e não recebe props; deve receber a mensagem selecionada. Usar `whiteSpace: "pre-wrap"` para preservar quebras de linha do texto do cliente e `overflowWrap: "anywhere"` para palavras longas.
- Não há `Dialog`, título, data/hora nem botão "Fechar". Envolver em `Dialog` com `DialogTitle` (com `id` referenciado em `aria-labelledby`), `DialogContent` e `DialogActions`.
- `minHeight: 182` e `p: 4` são medidas do frame do Figma; conferir no mobile para não gerar rolagem desnecessária no modal.
- O nome do componente (`ContedoDoDilogo`) veio mutilado da exportação; renomear para `ConteudoMensagem`.