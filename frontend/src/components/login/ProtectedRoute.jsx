"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import { encerrarSessao, obterSessao } from "../../services/authService";

export default function ProtectedRoute({ children, allowedProfiles }) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const allowedProfilesKey = allowedProfiles?.join("|") ?? "";

    useEffect(() => {
        const session = obterSessao();
        if (!session) {
            router.replace("/login");
            return;
        }
        const allowed = allowedProfilesKey ? allowedProfilesKey.split("|") : [];
        if (allowed.length && !allowed.includes(session.usuario.perfil)) {
            router.replace("/mainPage");
            return;
        }
        const authorizationTimeout = window.setTimeout(() => setAuthorized(true), 0);
        const timeout = window.setTimeout(() => {
            encerrarSessao();
            router.replace("/login");
        }, Math.max(0, session.expiresAt - Date.now()));
        return () => {
            window.clearTimeout(authorizationTimeout);
            window.clearTimeout(timeout);
        };
    }, [router, allowedProfilesKey]);

    if (!authorized) {
        return <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}><CircularProgress aria-label="Verificando acesso" /></Box>;
    }

    return children;
}
