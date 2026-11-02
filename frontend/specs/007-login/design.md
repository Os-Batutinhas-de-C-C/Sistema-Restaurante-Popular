# Design — Login de Funcionários e Recuperação de Acesso

## Objetivo da experiência

O funcionário deve conseguir entrar no painel administrativo com nome de usuário e senha, ou iniciar a recuperação de acesso informando o e-mail de recuperação, em qualquer dispositivo. A tela é de acesso restrito a funcionários.

## Histórias atendidas

- **RF002 (Login e recuperação de senha):** o funcionário faz login com suas credenciais e pode recuperar a senha informando um e-mail de recuperação previamente cadastrado.
- **HU006 (Controle de acesso administrativo):** o sistema bloqueia páginas administrativas para quem não está logado e exige credenciais válidas após abrir `/login`, mesmo que exista uma sessão anterior.
- **RF011 (Meu Perfil):** o e-mail de recuperação é cadastrado nessa tela (fora do escopo desta spec).

## Fluxo principal

1. A pessoa acessa `/login` (ou é redirecionada para ela ao tentar abrir uma página administrativa sem estar logada).
2. O sistema exibe o card de login com os campos "Usuário" e "Senha de acesso".
3. A pessoa preenche as credenciais e clica em "ENTRAR".
4. O sistema valida as credenciais no mock e redireciona para `/painel-nutricionista`.

## Fluxo alternativo — Recuperação de acesso

1. A pessoa clica em "RECUPERAR SENHA".
2. O sistema abre o Dialog "Recuperação de Acesso" com o campo de e-mail.
3. A pessoa informa o e-mail e clica em "ENVIAR LINK".
4. O sistema fecha o Dialog e exibe um Snackbar de confirmação genérico.

## Estrutura da interface

*(Nota: esta tela usa uma versão simplificada da AppBar/Toolbar da Navbar do Portal do Cidadão, mantendo apenas a identidade do restaurante e a ação "Voltar".)*

1. **Cabeçalho**
   - À esquerda: ícone de talheres em quadrado azul arredondado, título "Restaurante Popular" e, abaixo, "PREFEITURA MUNICIPAL DE QUIXADÁ" em caixa alta e fonte pequena.
   - À direita: botão laranja "Voltar", que leva à tela inicial (Portal do Cidadão).

2. **Card de login (centralizado, largura máxima de 320px)**
   - Ícone de talheres (azul), título "Restaurante Popular" e subtítulo "Acesso restrito para funcionários".
   - Campo "Usuário" (placeholder "Digite seu Usuário").
   - Campo "Senha de acesso" com ícone de olho para mostrar/ocultar a senha.
   - Botão "ENTRAR" (largura total, contido, azul).
   - Botão "RECUPERAR SENHA" (texto, largura total).

3. **Modal "Recuperação de Acesso" (MUI Dialog)**
   - Título: "Recuperação de Acesso".
   - Corpo: texto "Informe o seu E-mail de recuperação." e campo de e-mail (placeholder "E-mail de Recuperação").
   - Rodapé: "CANCELAR" (texto) e "ENVIAR LINK" (contido, azul), alinhados à direita.

## Campos e controles

### Campo Usuário
- Tipo: MUI TextField (outlined, size small), obrigatório.
- Comportamento: o login é por nome de usuário (não e-mail nem matrícula). Sem máscara.

### Campo Senha de acesso
- Tipo: MUI TextField (outlined, size small) com `type` alternando entre `password` e `text`, obrigatório. O campo começa vazio.
- Ícone de olho (IconButton) no `endAdornment`: alterna entre "Mostrar senha" e "Ocultar senha".

### Botão ENTRAR
- Tipo: MUI Button (variante contida, `type="submit"`).
- Comportamento: valida usuário e senha no mock. Com credenciais corretas, grava a sessão e redireciona para `/painel-nutricionista`. [SUPOSIÇÃO] Fica desabilitado enquanto usuário ou senha estiverem vazios. Enter nos campos também submete.
- Credenciais inválidas: a pessoa permanece na tela e os campos não são limpos. Nesta versão não há mensagem de erro (decisão de escopo; a HU006 prevê a mensagem, que fica para uma próxima entrega).

### Botão RECUPERAR SENHA
- Tipo: MUI Button (variante texto, `type="button"`).
- Comportamento: abre o modal de recuperação.

### Botão Voltar
- Tipo: MUI Button (variante contida, cor laranja).
- Comportamento: navega para a tela inicial do Portal do Cidadão (`/mainPage`).

### Campo E-mail de Recuperação (modal)
- Tipo: MUI TextField `type="email"`, obrigatório, com `aria-label="E-mail de Recuperação"`.
- Validação: [SUPOSIÇÃO] formato de e-mail válido. Enquanto vazio ou inválido, "ENVIAR LINK" fica desabilitado.

### Botão ENVIAR LINK
- Tipo: MUI Button (variante contida).
- Comportamento: como não há backend, apenas fecha o modal e exibe um Snackbar [SUPOSIÇÃO]: "Se o e-mail estiver cadastrado, enviaremos o link de recuperação." A mensagem é genérica e não confirma se o e-mail existe.

### Botão CANCELAR
- Tipo: MUI Button (variante texto).
- Comportamento: fecha o modal e limpa o campo.

## Estados da interface

- **Padrão:** campos vazios, "ENTRAR" desabilitado. [SUPOSIÇÃO]
- **Carregando:** [SUPOSIÇÃO] não necessário nesta versão (o mock responde na hora). Quando houver backend, "ENTRAR" mostra estado de carregamento e fica desabilitado.
- **Erro de credencial:** sem mensagem nesta versão (ver Botão ENTRAR).
- **Sessão ativa:** abrir `/login` encerra a sessão anterior e mostra o formulário para exigir nova autenticação.

## Responsividade

- **Desktop:** card centralizado horizontalmente, com largura máxima de 320px, abaixo do cabeçalho. Fundo em degradê claro.
- **Mobile (a partir de 360px, conforme HU001):** o card ocupa a largura disponível com margem lateral de 16px, sem rolagem horizontal. No cabeçalho, o subtítulo "PREFEITURA MUNICIPAL DE QUIXADÁ" pode quebrar em duas linhas, como já ocorre no Figma. O botão "Voltar" mantém touch target de no mínimo 44x44px, e os botões do card, no mínimo 44px de altura. O Dialog ocupa a largura disponível com margem lateral.

## Acessibilidade

- Cada campo deve ter rótulo associado (label visível ou `aria-label`). O campo de e-mail do modal usa `aria-label` porque o protótipo só tem placeholder.
- O ícone de olho deve ter `aria-label` alternando "Mostrar senha" e "Ocultar senha".
- O Dialog deve aplicar foco inicial no campo de e-mail, fechar com Esc e possuir `aria-labelledby` apontando para o título.
- O card deve usar `h1` único na página ("Restaurante Popular" do card). O título do cabeçalho não deve ser outro `h1`.
- Todos os controles devem ser operáveis por teclado (Tab e Enter), e o foco deve voltar ao botão "RECUPERAR SENHA" ao fechar o modal.

## Código de referência (protótipo da tela)

Protótipo exportado do Figma em MUI. Serve como referência visual (cores, medidas e estrutura dos componentes). O `handleSubmit` é placeholder e deve ser substituído pela autenticação no mock (`src/services/authService.js`).

**Tokens visuais extraídos do protótipo**
- Cor primária (ícone do cabeçalho, ENTRAR, RECUPERAR SENHA): `primary.main` do tema (azul padrão do MUI).
- Botão Voltar: laranja `#ed5c0a` (hover `#d94f00`).
- Fundo da página: degradê `linear-gradient(117deg, #f7f9fb 0%, #eef3f8 100%)`.
- Cabeçalho: fundo branco 95%, borda inferior `rgba(226,232,240,0.9)`.
- Card: largura máxima 320px, `elevation={3}`, raio 0.75.

```jsx
import RestaurantIcon from "@mui/icons-material/Restaurant";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Box,
  Button,
  Card,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

const LoginDoRestaurante = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("* * * * * *");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <Box
      data-palette-mode="light"
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(117deg, rgba(247,249,251,1) 0%, rgba(238,243,248,1) 100%)",
      }}
    >
      <Box
        component="header"
        sx={{
          bgcolor: "rgba(255,255,255,0.95)",
          borderBottom: "1px solid rgba(226,232,240,0.9)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        <Container maxWidth="md">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ minHeight: 64 }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 1.5,
                  bgcolor: "primary.main",
                  border: "1px solid rgba(254,215,170,0.8)",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                <RestaurantMenuIcon
                  sx={{ color: "common.white", fontSize: 25 }}
                />
              </Box>
              <Stack spacing={0.15}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "slate.900",
                    fontSize: 19,
                    fontWeight: 800,
                    letterSpacing: "-0.5px",
                    lineHeight: 1.1,
                  }}
                >
                  Restaurante Popular
                </Typography>
                <Typography
                  sx={{
                    color: "slate.500",
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: "0.35px",
                    lineHeight: 1.2,
                  }}
                >
                  PREFEITURA MUNICIPAL DE QUIXADÁ
                </Typography>
              </Stack>
            </Stack>
            <Button
              type="button"
              variant="contained"
              color="warning"
              disableElevation
              sx={{
                minWidth: 61,
                minHeight: 25,
                px: 1.5,
                py: 0.5,
                borderRadius: 1.25,
                bgcolor: "#ed5c0a",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { bgcolor: "#d94f00" },
              }}
            >
              Voltar
            </Button>
          </Stack>
        </Container>
      </Box>
      <Box
        component="main"
        sx={{
          display: "flex",
          justifyContent: "center",
          px: 2,
          pt: 8,
        }}
      >
        <Card
          component="section"
          elevation={3}
          sx={{
            width: "100%",
            maxWidth: 320,
            borderRadius: 0.75,
            px: 3.25,
            py: 3.5,
          }}
        >
          <Stack spacing={3.25}>
            <Stack spacing={1.5} alignItems="center">
              <RestaurantIcon color="primary" sx={{ fontSize: 33 }} />
              <Stack spacing={0.5} alignItems="center">
                <Typography
                  component="h1"
                  sx={{
                    color: "text.primary",
                    fontSize: 19,
                    fontWeight: 700,
                    lineHeight: 1.35,
                  }}
                >
                  Restaurante Popular
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: 11.5 }}
                >
                  Acesso restrito para funcionários
                </Typography>
              </Stack>
            </Stack>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={1.5}>
                <TextField
                  fullWidth
                  size="small"
                  label="Usuário"
                  placeholder="Digite seu Usuário"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  inputProps={{ "aria-label": "Usuário" }}
                  sx={{
                    "& .MuiOutlinedInput-root": { fontSize: 12.5 },
                    "& .MuiInputLabel-root": { fontSize: 11.5 },
                    "& .MuiInputBase-input::placeholder": {
                      color: "text.disabled",
                      opacity: 1,
                    },
                  }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Senha de acesso"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  inputProps={{ "aria-label": "Senha de acesso" }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showPassword ? "Ocultar senha" : "Mostrar senha"
                          }
                          edge="end"
                          size="small"
                          onClick={() => setShowPassword((visible) => !visible)}
                        >
                          {showPassword ? (
                            <VisibilityOffIcon sx={{ fontSize: 20 }} />
                          ) : (
                            <VisibilityIcon sx={{ fontSize: 20 }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": { fontSize: 12.5 },
                    "& .MuiInputLabel-root": { fontSize: 11.5 },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    minHeight: 34,
                    borderRadius: 0.75,
                    fontSize: 11.5,
                    fontWeight: 500,
                  }}
                >
                  ENTRAR
                </Button>
                <Button
                  type="button"
                  variant="text"
                  fullWidth
                  sx={{
                    minHeight: 26,
                    fontSize: 10.5,
                    fontWeight: 500,
                  }}
                >
                  RECUPERAR SENHA
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Card>
      </Box>
    </Box>
  );
};

export default LoginDoRestaurante;
```

**Divergências conhecidas entre o protótipo e esta spec** (a implementação deve seguir a spec):
- O estado inicial da senha é `"* * * * * *"` (para o Figma exibir pontos). Deve começar vazio.
- `handleSubmit` só faz `preventDefault`; na spec autentica no mock e redireciona.
- "Voltar", "RECUPERAR SENHA" e "ENTRAR" não têm ação ligada (`onClick`); na spec navegam ou abrem o modal conforme descrito.
- `color: "slate.900"` e `"slate.500"` não são tokens do tema do MUI e são ignorados (o texto cai na cor padrão). Usar hex (`#0f172a` e `#64748b`) ou tokens do tema.
- `inputProps` e `InputProps` são depreciados no MUI v9; usar `slotProps={{ htmlInput: {...}, input: { endAdornment: ... } }}`. O `aria-label` duplicado nos campos com `label` é redundante e pode ser removido.
- `minHeight: "100vh"` causa pulo de altura em navegadores móveis com barra de endereço dinâmica; usar `100dvh`.
- O atributo `data-palette-mode="light"` vem do Figma e não faz nada; remover.
- O título do cabeçalho usa `variant="h6"` (renderiza `h6`) e o card tem `h1`; o do cabeçalho deve ser `component="p"` (ou `span`) para não bagunçar a hierarquia de títulos.
- O botão "Voltar" tem 25px de altura mínima, abaixo dos 44px de touch target no mobile; e `color="warning"` com `bgcolor` fixo duplica a definição de cor (usar o tema).
- O botão de olho do campo de senha tem `size="small"`; garantir área de toque suficiente no mobile.

## Código de referência (modal "Recuperação de Acesso")

Protótipo exportado do Figma em MUI para o conteúdo do modal. O título "Recuperação de Acesso" e os botões "CANCELAR" e "ENVIAR LINK" aparecem no print do Figma, mas não estão neste trecho de código.

```jsx
import { Stack, TextField, Typography } from "@mui/material";

export const ContedoDoDilogo = () => {
  return (
    <Stack
      component="form"
      noValidate
      spacing={2}
      sx={{
        px: 3,
        pb: 2.5,
        pt: 0,
        width: "100%",
      }}
    >
      <Typography color="text.secondary" variant="body2">
        Informe o seu E-mail de recuperação.
      </Typography>
      <TextField
        fullWidth
        placeholder="E-mail de Recuperação"
        type="email"
        variant="outlined"
        inputProps={{
          "aria-label": "E-mail de Recuperação",
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 1,
          },
          "& .MuiOutlinedInput-input": {
            py: 2.25,
          },
        }}
      />
    </Stack>
  );
};

export default ContedoDoDilogo;
```

**Divergências conhecidas entre este protótipo e esta spec** (a implementação deve seguir a spec):
- O campo não é controlado (sem `value`/`onChange`); na spec é controlado, para validar o formato e habilitar "ENVIAR LINK".
- Não há `Dialog`, `DialogTitle` nem `DialogActions`. Envolver em `Dialog` com `DialogTitle` ("Recuperação de Acesso", `id` ligado ao `aria-labelledby`) e `DialogActions` com "CANCELAR" e "ENVIAR LINK".
- O `form` está dentro do conteúdo e os botões ficam no rodapé, fora dele; ligar o botão ao formulário com `form="id-do-form"` e `type="submit"`, para o Enter no campo enviar. O `noValidate` desliga a validação do navegador, então a validação do e-mail é manual.
- `inputProps` é depreciado; usar `slotProps={{ htmlInput: { "aria-label": "E-mail de Recuperação" } }}`.
- O campo só tem placeholder, sem label visível; o `aria-label` é necessário para leitores de tela. Se possível, usar `label` no lugar do placeholder.
- `pt: 0` e o `py: 2.25` do input vêm da escala do Figma; conferir a altura no mobile.
- O print do modal está com fundo escuro, provavelmente do preview do Figma; na spec, o Dialog segue o tema claro da aplicação, como o card de login.
- A linha azul ao redor do conteúdo no print vem do clique de seleção no Figma e não faz parte da tela.
