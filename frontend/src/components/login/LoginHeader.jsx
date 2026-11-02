"use client";

import RestaurantIcon from "@mui/icons-material/Restaurant";
import { Box, Button, Stack, Typography } from "@mui/material";

export default function LoginHeader() {
    return (
        <Box component="header" sx={{ height: 50, bgcolor: "#fff", borderBottom: "1px solid #e2e8f0", boxShadow: "0 1px 3px #0000000d" }}>
            <Stack direction="row" sx={{ height: "100%", maxWidth: "95%", mx: "auto", px: { xs: 2, sm: 7 }, alignItems: "center", justifyContent: "space-between" }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Box sx={{ width: 35, height: 35, display: "grid", placeItems: "center", bgcolor: "#2458d3", color: "white", borderRadius: 1.5 }}><RestaurantIcon sx={{ fontSize: 21 }} /></Box>
                    <Stack spacing={0}>
                        <Typography sx={{ color: "#172033", fontSize: 15, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.3px" }}>Restaurante Popular</Typography>
                        <Typography sx={{ color: "#64748b", fontSize: 8, fontWeight: 700, lineHeight: 1.2, letterSpacing: "0.2px", maxWidth: 120 }}>PREFEITURA MUNICIPAL DE QUIXADÁ</Typography>
                    </Stack>
                </Stack>
                <Button size="small" variant="contained" onClick={() => window.history.back()} sx={{ minWidth: 47, minHeight: 20, px: 1, borderRadius: 2, bgcolor: "#eb5b09", boxShadow: "none", fontSize: 8, fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#d94f05", boxShadow: "none" } }}>Voltar</Button>
            </Stack>
        </Box>
    );
}
