# Design — Tela de Login e Autenticação

## Objetivo da experiência

Fornecer uma interface limpa, segura e intuitiva para que funcionários (nutricionistas e operadores de caixa) realizem o acesso à área administrativa ou solicitem a redefinição de senha com facilidade, tanto no desktop quanto em dispositivos móveis.

## Histórias atendidas

- **RF002:** Login com credenciais e solicitação de recuperação de senha.
- **HU006:** Controle de acesso e redirecionamento de acordo com a permissão do usuário.

## Fluxo principal

1. O usuário acessa a rota `/login`.
2. O sistema exibe o formulário com os campos de E-mail, Senha e a opção "Esqueceu a senha?".
3. O usuário preenche os campos e clica no botão "Entrar".
4. O sistema valida os dados através do `authService.js`.
5. Se válido, o usuário é redirecionado para seu painel; se inválido, um alerta de erro é exibido.
6. (Fluxo Secundário): Ao clicar em "Esqueceu a senha?", o sistema abre o modal `DialogRecuperarSenha`, onde o usuário informa seu e-mail e confirma o envio.

## Estrutura da interface

1. **Card Principal de Login (Paper/Card MUI)**
   - Logotipo ou Título: "Acesso ao Sistema".
   - Subtítulo explicativo: "Informe suas credenciais para continuar".
   - Campo 1: `TextField` para "E-mail" (tipo `email`).
   - Campo 2: `TextField` para "Senha" (tipo `password` com opção de alternar visibilidade).
   - Link de Ação: `Link` ou `Button` "Esqueceu a senha?".
   - Botão Principal: `Button variant="contained"` ("Entrar").

2. **Modal "Recuperar Senha" (MUI Dialog)**
   - Cabeçalho: Título "Recuperar Senha".
   - Corpo: Texto instrucional e `TextField` para inserção do e-mail cadastrado.
   - Rodapé: Botão "Cancelar" (`variant="text"`) e Botão "Enviar E-mail" (`variant="contained"`).

## Campos e controles

### Campo de E-mail
- Tipo: `TextField` (MUI v6), obrigatório, validação de formato de e-mail.

### Campo de Senha
- Tipo: `TextField` com `InputAdornment` contendo `IconButton` para alternar entre mostrar/ocultar senha.

### Botão Entrar
- Tipo: MUI `Button` (`variant="contained"`, `color="primary"`, `fullWidth`).

## Estados da interface

- **Padrao:** Campos limpos ou prontos para preenchimento.
- **Carregando:** Botão "Entrar" exibe estado desabilitado com indicador de carregamento (`CircularProgress`).
- **Erro:** Alerta de aviso (`Alert severity="error"`) acima do formulário indicando credenciais incorretas.

## Responsividade

- **Desktop:** Card centralizado na tela com largura máxima de ~420px e fundo suave.
- **Mobile (a partir de 360px, conforme HU001):** Card ocupa 100% da largura útil da tela com margens adequadas, mantendo botões com área de toque mínima de 44px.

## Acessibilidade

- Todos os campos devem possuir rótulos associados (`label` ou `aria-label`).
- O formulário deve permitir a submissão ao pressionar a tecla **Enter**.
- O modal de recuperação deve fechar com a tecla **Esc** e manter foco controlado.

## Código de referência (protótipo da tela)

```jsx
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FormEvent, useState } from "react";

const LoginDoRestaurante = (): JSX.Element => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <Box
      data-palette-mode="light"
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f8fb",
        background:
          "linear-gradient(117deg, rgba(247,249,251,1) 0%, rgba(238,243,248,1) 100%)",
      }}
    >
      <Box
        component="header"
        sx={{
          height: 64,
          bgcolor: "rgba(255,255,255,0.95)",
          borderBottom: "1px solid rgba(226,232,240,0.9)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            height: "100%",
            maxWidth: 884,
            mx: "auto",
            px: { xs: 2, sm: 0 },
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                display: "grid",
                placeItems: "center",
                bgcolor: "#2458d3",
                borderRadius: 1.5,
                border: "1px solid rgba(254,215,170,0.8)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              <RestaurantIcon sx={{ color: "common.white", fontSize: 25 }} />
            </Box>
            <Stack spacing={0}>
              <Typography
                sx={{
                  color: "#172033",
                  fontSize: 19,
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: "-0.5px",
                }}
              >
                Restaurante Popular
              </Typography>
              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: 9,
                  fontWeight: 700,
                  lineHeight: 1.25,
                  letterSpacing: "0.35px",
                  maxWidth: 150,
                }}
              >
                PREFEITURA MUNICIPAL DE QUIXADÁ
              </Typography>
            </Stack>
          </Stack>
          <Button
            variant="contained"
            size="small"
            startIcon={<ArrowBackIcon sx={{ fontSize: 12 }} />}
            onClick={() => window.history.back()}
            sx={{
              minWidth: 61,
              minHeight: 25,
              px: 1.1,
              py: 0.4,
              borderRadius: 1.25,
              bgcolor: "#eb5b09",
              border: "1px solid #fff",
              boxShadow: "none",
              fontSize: 10,
              fontWeight: 700,
              lineHeight: 1,
              textTransform: "none",
              "&:hover": {
                bgcolor: "#d94f05",
                boxShadow: "none",
              },
              "& .MuiButton-startIcon": {
                mr: 0.35,
              },
            }}
          >
            Voltar
          </Button>
        </Stack>
      </Box>
      <Box
        component="main"
        sx={{
          display: "flex",
          justifyContent: "center",
          pt: { xs: 6, sm: 7.75 },
          px: 2,
        }}
      >
        <Paper
          component="section"
          elevation={3}
          aria-labelledby="login-title"
          sx={{
            width: "100%",
            maxWidth: 320,
            minHeight: 358,
            px: 3.25,
            py: 3.5,
            borderRadius: 0.75,
            boxSizing: "border-box",
          }}
        >
          <Stack spacing={3}>
            <Stack spacing={1.5} alignItems="center">
              <RestaurantIcon sx={{ color: "#1976d2", fontSize: 40 }} />
              <Stack spacing={0.5} alignItems="center">
                <Typography
                  id="login-title"
                  component="h1"
                  sx={{
                    color: "#242424",
                    fontSize: 20,
                    fontWeight: 700,
                    lineHeight: 1.6,
                  }}
                >
                  Restaurante Popular
                </Typography>
                <Typography
                  color="text.secondary"
                  sx={{ fontSize: 12, lineHeight: 1.5 }}
                >
                  Acesso restrito para funcionários
                </Typography>
              </Stack>
            </Stack>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={1.5}>
                <TextField
                  fullWidth
                  label="Usuário"
                  placeholder="Digite seu Usuário"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  variant="outlined"
                  size="small"
                  inputProps={{ "aria-label": "Usuário" }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 45,
                      fontSize: 13,
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: 11,
                    },
                    "& .MuiInputBase-input::placeholder": {
                      opacity: 1,
                      color: "#9e9e9e",
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Senha de acesso"
                  placeholder="* * * * * *"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  variant="outlined"
                  size="small"
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
                          sx={{ color: "#757575" }}
                        >
                          {showPassword ? (
                            <VisibilityOffIcon fontSize="small" />
                          ) : (
                            <VisibilityIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 46,
                      fontSize: 13,
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: 11,
                    },
                    "& .MuiInputBase-input::placeholder": {
                      opacity: 1,
                      color: "#9e9e9e",
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    height: 34,
                    mt: 0.25,
                    borderRadius: 0.5,
                    bgcolor: "#1976d2",
                    fontSize: 12,
                    fontWeight: 500,
                    boxShadow: "0 2px 3px rgba(0,0,0,0.28)",
                    "&:hover": {
                      bgcolor: "#1565c0",
                    },
                  }}
                >
                  ENTRAR
                </Button>
                <Button
                  type="button"
                  variant="text"
                  onClick={() => undefined}
                  sx={{
                    alignSelf: "center",
                    minWidth: 0,
                    mt: 0.25,
                    px: 0.5,
                    py: 0.5,
                    color: "#1976d2",
                    fontSize: 10,
                    fontWeight: 500,
                    lineHeight: 1.5,
                  }}
                >
                  RECUPERAR SENHA
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginDoRestaurante;