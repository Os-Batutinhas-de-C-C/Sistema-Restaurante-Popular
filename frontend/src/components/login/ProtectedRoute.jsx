"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import { obterSessao } from "../../services/authService";

export default function ProtectedRoute({ children }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (obterSessao()) {
            setAuthorized(true);
        } else {
            router.replace("/login");
        }
    }, [router]);

    if (!authorized) {
        return <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}><CircularProgress aria-label="Verificando acesso" /></Box>;
    }

    return children;
}
