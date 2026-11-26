"use client";

import RestaurantIcon from "@mui/icons-material/Restaurant";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Alert, Box, Button, IconButton, InputAdornment, Paper, Snackbar, Stack, TextField, Typography } from "@mui/material";
import PasswordRecoveryDialog from "./PasswordRecoveryDialog.jsx";
import { useAuthService } from "../../services/authService";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import LoginNotice from "./LoginNotice";

export default function LoginForm() {
    const auth = useAuthService(useRouter());
    return (
        <>
            <Paper component="section" elevation={1} aria-labelledby="login-title" sx={{ width: "100%", maxWidth: 440, px: { xs: 2.5, sm: 4 }, py: { xs: 3, sm: 4 }, borderRadius: 2, border: "1px solid", borderColor: "divider", boxSizing: "border-box" }}>
                <Stack spacing={2.5}>
                    <Stack spacing={1} sx={{ alignItems: "center" }}>
                        <RestaurantIcon color="primary" sx={{ fontSize: 40 }} />
                        <Stack spacing={0.25} sx={{ alignItems: "center" }}>
                            <Typography id="login-title" component="h1" sx={{ color: "text.primary", fontSize: { xs: 22, sm: 24 }, fontWeight: 700, lineHeight: 1.3 }}>Restaurante Popular</Typography>
                            <Typography color="text.secondary" sx={{ fontSize: 14 }}>Acesso restrito para funcionários</Typography>
                        </Stack>
                    </Stack>
                    <Suspense fallback={null}><LoginNotice /></Suspense>
                    <Box component="form" onSubmit={auth.submit}>
                        <Stack spacing={2}>
                            <TextField required fullWidth type="email" label="E-mail" placeholder="Digite seu e-mail" value={auth.email} onChange={(event) => { auth.setEmail(event.target.value); }} autoComplete="username" slotProps={{ htmlInput: { "aria-label": "E-mail" } }} />
                            <TextField required fullWidth label="Senha de acesso" type={auth.showPassword ? "text" : "password"} value={auth.password} onChange={(event) => auth.setPassword(event.target.value)} autoComplete="current-password" slotProps={{ htmlInput: { "aria-label": "Senha de acesso" }, input: { endAdornment: <InputAdornment position="end"><IconButton aria-label={auth.showPassword ? "Ocultar senha" : "Mostrar senha"} edge="end" type="button" onClick={auth.togglePassword} sx={{ width: 44, height: 44 }}>{auth.showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}</IconButton></InputAdornment> } }} />
                            {auth.error && <Alert severity="error">{auth.error}</Alert>}
                            <Button type="submit" variant="contained" fullWidth disabled={!auth.email.trim() || !auth.password || auth.submitting} sx={{ minHeight: 48, borderRadius: 1, fontSize: 14, fontWeight: 600 }}>{auth.submitting ? "ENTRANDO..." : "ENTRAR"}</Button>
                            <Button type="button" variant="text" fullWidth onClick={auth.openRecovery} sx={{ minHeight: 44, fontSize: 13, fontWeight: 600 }}>RECUPERAR SENHA</Button>
                        </Stack>
                    </Box>
                </Stack>
            </Paper>
            <PasswordRecoveryDialog auth={auth} />
            <Snackbar open={auth.snackbarOpen} autoHideDuration={6000} onClose={() => auth.setSnackbarOpen(false)} message="A recuperação de senha ainda não está disponível. Procure o administrador." />
        </>
    );
}
