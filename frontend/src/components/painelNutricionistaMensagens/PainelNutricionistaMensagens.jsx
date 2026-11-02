"use client";

import { Alert, Box, Snackbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavbarPainel from "../NavbarPainel/NavbarPainel";
import FiltroPeriodoPainel from "../painelCompartilhado/FiltroPeriodoPainel";
import ListaMensagens from "./ListaMensagens/ListaMensagens";
import ModalRemoverMensagem from "./ModalRemoverMensagem/ModalRemoverMensagem";
import ModalVisualizarMensagem from "./ModalVisualizarMensagem/ModalVisualizarMensagem";
import { listarMensagensPorPeriodo, obterPeriodoPadrao, removerMensagem } from "../../services/mensagensService";

export default function PainelNutricionistaMensagens() {
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [periodo, setPeriodo] = useState(obterPeriodoPadrao);
    const [mensagens, setMensagens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [acessoVerificado, setAcessoVerificado] = useState(false);
    const [mensagemVisualizada, setMensagemVisualizada] = useState(null);
    const [mensagemParaRemover, setMensagemParaRemover] = useState(null);
    const [snackbar, setSnackbar] = useState("");

    useEffect(() => {
        let autorizado = false;
        try {
            const usuario = JSON.parse(window.localStorage.getItem("usuarioRestaurantePopular") || "null");
            autorizado = Boolean(usuario && ["Nutricionista", "Gestor"].includes(usuario.perfil));
        } catch {
            autorizado = false;
        }

        if (!autorizado) {
            router.replace("/login");
            return;
        }

        setAcessoVerificado(true);
    }, [router]);

    const carregarMensagens = useCallback(() => {
        setLoading(true);
        setError("");
        try {
            setMensagens(listarMensagensPorPeriodo(periodo));
        } catch {
            setMensagens([]);
            setError("Não foi possível carregar as mensagens.");
        } finally {
            setLoading(false);
        }
    }, [periodo]);

    useEffect(() => {
        if (acessoVerificado) carregarMensagens();
    }, [acessoVerificado, carregarMensagens]);

    const confirmarRemocao = () => {
        if (!mensagemParaRemover) return;
        removerMensagem(mensagemParaRemover.id);
        setMensagens(listarMensagensPorPeriodo(periodo));
        setSnackbar("Mensagem apagada.");
        setMensagemParaRemover(null);
    };

    return (
        <>
            <NavbarPainel />
            <Box
                component="main"
                sx={{
                    width: "100%",
                    maxWidth: 1180,
                    mx: "auto",
                    px: { xs: 2, sm: 3 },
                    pt: { xs: "76px", sm: "84px" },
                    pb: 6,
                }}
            >
                <Typography component="h1" variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
                    Mensagens
                </Typography>
                <Box sx={{ display: "grid", gap: 1.5 }}>
                    <FiltroPeriodoPainel
                        value={periodo}
                        onChange={(value) => setPeriodo(value || obterPeriodoPadrao())}
                        label="Filtro de período"
                    />
                    <ListaMensagens
                        mensagens={mensagens}
                        loading={loading || !acessoVerificado}
                        error={error}
                        onRetry={carregarMensagens}
                        onVisualizar={setMensagemVisualizada}
                        onExcluir={setMensagemParaRemover}
                        isMobile={isMobile}
                    />
                </Box>
            </Box>

            <ModalVisualizarMensagem
                mensagem={mensagemVisualizada}
                onClose={() => setMensagemVisualizada(null)}
            />
            <ModalRemoverMensagem
                mensagem={mensagemParaRemover}
                onClose={() => setMensagemParaRemover(null)}
                onConfirmar={confirmarRemocao}
            />

            <Snackbar
                open={Boolean(snackbar)}
                autoHideDuration={3000}
                onClose={() => setSnackbar("")}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity="success" variant="filled" onClose={() => setSnackbar("")}>
                    {snackbar}
                </Alert>
            </Snackbar>
        </>
    );
}
