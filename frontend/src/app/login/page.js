
"use client";

import { useEffect } from "react";
import { Box } from "@mui/material";
import LoginForm from "../../components/login/LoginForm";
import LoginHeader from "../../components/login/LoginHeader";
import { encerrarSessao } from "../../services/authService";

export default function LoginPage() {
    useEffect(() => {
        encerrarSessao();
    }, []);

    return (
        <Box sx={{ minHeight: "100dvh", bgcolor: "#f5f8fb", background: "linear-gradient(117deg, #f7f9fb 0%, #eef3f8 100%)" }}>
            <LoginHeader />
            <Box component="main" sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100dvh - 64px)", py: { xs: 4, sm: 5 }, px: 2 }}>
                <LoginForm />
            </Box>
        </Box>
    );
}
