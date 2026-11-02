"use client";

import RestaurantIcon from "@mui/icons-material/Restaurant";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Alert, Box, Button, IconButton, InputAdornment, Paper, Stack, TextField, Typography } from "@mui/material";
import PasswordRecoveryDialog from "./PasswordRecoveryDialog";
import { useAuthService } from "../../services/authService";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const auth = useAuthService(useRouter());
    return (
        <>
            <Paper component="section" elevation={3} aria-labelledby="login-title" sx={{ width: "100%", maxWidth: 252, minHeight: 279, px: 2.5, py: 2.5, borderRadius: 0.75, boxSizing: "border-box" }}>
                <Stack spacing={2}>
                    <Stack spacing={1} sx={{ alignItems: "center" }}>
                        <RestaurantIcon sx={{ color: "#1976d2", fontSize: 27 }} />
                        <Stack spacing={0.25} sx={{ alignItems: "center" }}>
                            <Typography id="login-title" component="h1" sx={{ color: "#242424", fontSize: 15, fontWeight: 700, lineHeight: 1.5 }}>Restaurante Popular</Typography>
                            <Typography color="text.secondary" sx={{ fontSize: 9, lineHeight: 1.5 }}>Acesso restrito para funcionários</Typography>
                        </Stack>
                    </Stack>
                    <Box component="form" onSubmit={auth.submit}>
                        <Stack spacing={1.25}>
                            <TextField required fullWidth label="Usuário" placeholder="Digite seu Usuário" value={auth.username} onChange={(event) => auth.setUsername(event.target.value)} size="small" autoComplete="username" />
                            <TextField required fullWidth label="Senha de acesso" placeholder="* * * * * *" type={auth.showPassword ? "text" : "password"} value={auth.password} onChange={(event) => auth.setPassword(event.target.value)} size="small" autoComplete="current-password" slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton aria-label={auth.showPassword ? "Ocultar senha" : "Mostrar senha"} edge="end" size="small" type="button" onClick={auth.togglePassword}>{auth.showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}</IconButton></InputAdornment> } }} />
                            {auth.error && <Alert severity="error">{auth.error}</Alert>}
                            <Button type="submit" variant="contained" fullWidth sx={{ height: 27, borderRadius: 0.5, fontSize: 9, fontWeight: 500, boxShadow: "0 2px 3px #00000047" }}>ENTRAR</Button>
                            <Button type="button" variant="text" onClick={auth.openRecovery} sx={{ alignSelf: "center", minWidth: 0, px: 0.5, py: 0.25, fontSize: 8, fontWeight: 500 }}>RECUPERAR SENHA</Button>
                        </Stack>
                    </Box>
                </Stack>
            </Paper>
            <PasswordRecoveryDialog auth={auth} />
        </>
    );
}
