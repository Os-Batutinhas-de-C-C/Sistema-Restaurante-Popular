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
            <Paper component="section" elevation={3} aria-labelledby="login-title" sx={{ width: "100%", maxWidth: 320, px: 3.25, py: 3.5, borderRadius: 0.75, boxSizing: "border-box" }}>
                <Stack spacing={2}>
                    <Stack spacing={1} sx={{ alignItems: "center" }}>
                        <RestaurantIcon color="primary" sx={{ fontSize: 33 }} />
                        <Stack spacing={0.25} sx={{ alignItems: "center" }}>
                            <Typography id="login-title" component="h1" sx={{ color: "text.primary", fontSize: 19, fontWeight: 700, lineHeight: 1.35 }}>Restaurante Popular</Typography>
                            <Typography color="text.secondary" sx={{ fontSize: 11.5 }}>Acesso restrito para funcionários</Typography>
                        </Stack>
                    </Stack>
                    <Suspense fallback={null}><LoginNotice /></Suspense>
                    <Box component="form" onSubmit={auth.submit}>
                        <Stack spacing={1.5}>
                            <TextField required fullWidth type="email" label="E-mail" placeholder="Digite seu e-mail" value={auth.email} onChange={(event) => { auth.setEmail(event.target.value); }} size="small" autoComplete="username" slotProps={{ htmlInput: { "aria-label": "E-mail" } }} />
                            <TextField required fullWidth label="Senha de acesso" type={auth.showPassword ? "text" : "password"} value={auth.password} onChange={(event) => auth.setPassword(event.target.value)} size="small" autoComplete="current-password" slotProps={{ htmlInput: { "aria-label": "Senha de acesso" }, input: { endAdornment: <InputAdornment position="end"><IconButton aria-label={auth.showPassword ? "Ocultar senha" : "Mostrar senha"} edge="end" type="button" onClick={auth.togglePassword} sx={{ width: 44, height: 44 }}>{auth.showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}</IconButton></InputAdornment> } }} />
                            {auth.error && <Alert severity="error">{auth.error}</Alert>}
                            <Button type="submit" variant="contained" fullWidth disabled={!auth.email.trim() || !auth.password || auth.submitting} sx={{ minHeight: 44, borderRadius: 0.75, fontSize: 12, fontWeight: 500 }}>{auth.submitting ? "ENTRANDO..." : "ENTRAR"}</Button>
                            <Button type="button" variant="text" fullWidth onClick={auth.openRecovery} sx={{ minHeight: 44, fontSize: 11, fontWeight: 500 }}>RECUPERAR SENHA</Button>
                        </Stack>
                    </Box>
                </Stack>
            </Paper>
            <PasswordRecoveryDialog auth={auth} />
            <Snackbar open={auth.snackbarOpen} autoHideDuration={6000} onClose={() => auth.setSnackbarOpen(false)} message="A recuperação de senha ainda não está disponível. Procure o administrador." />
        </>
    );
}
