
"use client";

import { Box } from "@mui/material";
import LoginForm from "../../components/login/LoginForm";
import LoginHeader from "../../components/login/LoginHeader";

export default function LoginPage() {
    return (
        <Box data-palette-mode="light" sx={{ minHeight: "100vh", bgcolor: "#f5f8fb", background: "linear-gradient(117deg, #f7f9fb 0%, #eef3f8 100%)" }}>
            <LoginHeader />
            <Box component="main" sx={{ display: "flex", justifyContent: "center", pt: { xs: 6, sm: 6.25 }, px: 2, pb: 6 }}>
                <LoginForm />
            </Box>
        </Box>
    );
}
