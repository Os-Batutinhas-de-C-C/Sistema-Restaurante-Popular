"use client";

import RestaurantIcon from "@mui/icons-material/Restaurant";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Box, Button, IconButton, InputAdornment, Paper, Snackbar, Stack, TextField, Typography } from "@mui/material";
import PasswordRecoveryDialog from "./PasswordRecoveryDialog.jsx";
import { useAuthService } from "../../services/authService";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const auth = useAuthService(useRouter());
    return (
        <>
            <Paper component="section" elevation={3} aria-labelledby="login-title" sx={{ width: "100%", maxWidth: 320, px: 3.25, py: 3.5, borderRadius: 0.75, boxSizing: "border-box" }}>
                <Stack spacing={2}>
                    <Stack spacing={1} sx={{ alignItems: "center" }}>
                        <RestaurantIcon color="primary" sx={{ fontSize: 33 }} />
                        <Stack spacing={0.25} sx={{ alignItems: "center" }}>
                            <Typography id="login-title" component="h1" sx={{ color: "text.primary", fontSize: 19, fontWeight: 700, lineHeight: 1.35 }}>Restaurante Popular</Typography>
                            <Typography color="text.secondary" sx={{ fontSize: 11.5 }}>Acesso restrito para funcionários</Typography>
                        </Stack>
                    </Stack>
                    <Box component="form" onSubmit={auth.submit}>
                        <Stack spacing={1.5}>
                            <TextField required fullWidth label="Usuário" placeholder="Digite seu Usuário" value={auth.username} onChange={(event) => auth.setUsername(event.target.value)} size="small" autoComplete="username" slotProps={{ htmlInput: { "aria-label": "Usuário" } }} />
                            <TextField required fullWidth label="Senha de acesso" type={auth.showPassword ? "text" : "password"} value={auth.password} onChange={(event) => auth.setPassword(event.target.value)} size="small" autoComplete="current-password" slotProps={{ htmlInput: { "aria-label": "Senha de acesso" }, input: { endAdornment: <InputAdornment position="end"><IconButton aria-label={auth.showPassword ? "Ocultar senha" : "Mostrar senha"} edge="end" type="button" onClick={auth.togglePassword} sx={{ width: 44, height: 44 }}>{auth.showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}</IconButton></InputAdornment> } }} />
                            <Button type="submit" variant="contained" fullWidth disabled={!auth.username.trim() || !auth.password} sx={{ minHeight: 44, borderRadius: 0.75, fontSize: 12, fontWeight: 500 }}>ENTRAR</Button>
                            <Button type="button" variant="text" fullWidth onClick={auth.openRecovery} sx={{ minHeight: 44, fontSize: 11, fontWeight: 500 }}>RECUPERAR SENHA</Button>
                        </Stack>
                    </Box>
                </Stack>
            </Paper>
            <PasswordRecoveryDialog auth={auth} />
            <Snackbar open={auth.snackbarOpen} autoHideDuration={6000} onClose={() => auth.setSnackbarOpen(false)} message="Se o e-mail estiver cadastrado, enviaremos o link de recuperação." />
        </>
    );
}
