"use client";

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
import { useState } from "react";

export default function LoginDoRestaurante() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    function handleSubmit(event) {
        event.preventDefault();
    }

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
                    sx={{
                        height: "100%",
                        maxWidth: "90%",
                        mx: "auto",
                        px: { xs: 2, sm: 0 },
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
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
                                flexShrink: 0,
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
                        //startIcon={<ArrowBackIcon sx={{ fontSize: 12 }} />}
                        onClick={() => window.history.back()}
                        sx={{
                            minWidth: 70,
                            minHeight: 32,
                            px: 1.1,
                            py: 0.4,
                            borderRadius: 2.5,
                            bgcolor: "#eb5b09",
                            border: "1px solid #fff",
                            boxShadow: "none",
                            fontSize: 10,
                            fontWeight: 700,
                            lineHeight: 1,
                            textTransform: "none",
                            flexShrink: 0,
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
                    pb: 6,
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
                        <Stack spacing={1.5} sx={{ alignItems: "center" }}>
                            <RestaurantIcon sx={{ color: "#1976d2", fontSize: 40 }} />
                            <Stack spacing={0.5} sx={{ alignItems: "center" }}>
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
                                    required
                                    fullWidth
                                    label="Usuário"
                                    placeholder="Digite seu Usuário"
                                    value={username}
                                    onChange={(event) => setUsername(event.target.value)}
                                    variant="outlined"
                                    size="small"
                                    autoComplete="username"
                                    slotProps={{
                                        htmlInput: { "aria-label": "Usuário" },
                                    }}
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
                                    required
                                    label="Senha de acesso"
                                    placeholder="* * * * * *"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    variant="outlined"
                                    size="small"
                                    autoComplete="current-password"
                                    slotProps={{
                                        htmlInput: { "aria-label": "Senha de acesso" },
                                        input: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label={
                                                            showPassword
                                                                ? "Ocultar senha"
                                                                : "Mostrar senha"
                                                        }
                                                        edge="end"
                                                        size="small"
                                                        type="button"
                                                        onClick={() =>
                                                            setShowPassword(
                                                                (visible) => !visible
                                                            )
                                                        }
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
                                        },
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
}