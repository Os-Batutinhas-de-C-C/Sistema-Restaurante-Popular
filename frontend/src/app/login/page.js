"use client";

import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Stack,
    Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const handleLogin = (perfil) => {
        localStorage.setItem(
            "usuarioRestaurantePopular",
            JSON.stringify({
                perfil,
                nome: perfil === "Nutricionista" ? "Nutricionista" : "Gestor",
            }),
        );

        router.push("/painel-nutricionista-noticias");
    };

    return (
        <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Card sx={{ width: "100%", borderRadius: 3, p: 1 }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textAlign: "center" }}>
                        Login
                    </Typography>
                    <Typography variant="body1" sx={{ color: "text.secondary", mb: 3, textAlign: "center" }}>
                        Escolha o perfil para acessar o painel.
                    </Typography>
                    <Stack spacing={2}>
                        <Button variant="contained" size="large" onClick={() => handleLogin("Nutricionista")}>
                            Entrar como Nutricionista
                        </Button>
                        <Button variant="outlined" size="large" onClick={() => handleLogin("Gestor")}>
                            Entrar como Gestor
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Container>
    );
}
