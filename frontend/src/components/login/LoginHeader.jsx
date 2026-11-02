"use client";

import RestaurantIcon from "@mui/icons-material/Restaurant";
import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function LoginHeader() {
    const router = useRouter();
    return (
        <AppBar
            component="header"
            position="static"
            elevation={0}
            sx={{ bgcolor: "rgba(255,255,255,0.95)", color: "#0f172a", borderBottom: "1px solid rgba(226,232,240,0.9)", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
        >
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ minHeight: "64px !important", width: "100%", maxWidth: 1100, mx: "auto", justifyContent: "space-between", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                        <Box sx={{ width: 44, height: 44, flexShrink: 0, display: "grid", placeItems: "center", bgcolor: "primary.main", color: "common.white", borderRadius: 1.5, border: "1px solid rgba(254,215,170,0.8)" }}>
                            <RestaurantIcon sx={{ fontSize: 25 }} />
                        </Box>
                        <Stack spacing={0} sx={{ minWidth: 0 }}>
                            <Typography component="p" sx={{ color: "#0f172a", fontSize: 16, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.3px" }}>
                                Restaurante Popular
                            </Typography>
                            <Typography sx={{ color: "#64748b", fontSize: 9, fontWeight: 700, lineHeight: 1.2, letterSpacing: "0.2px", maxWidth: 150 }}>
                                PREFEITURA MUNICIPAL DE QUIXADÁ
                            </Typography>
                        </Stack>
                    </Box>
                    <Button
                        type="button"
                        variant="contained"
                        onClick={() => router.push("/mainPage")}
                        sx={{ minWidth: 64, minHeight: 44, px: 1.5, borderRadius: 1.25, bgcolor: "#ed5c0a", boxShadow: "none", fontSize: 11, fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#d94f00", boxShadow: "none" } }}
                    >
                        Voltar
                    </Button>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
