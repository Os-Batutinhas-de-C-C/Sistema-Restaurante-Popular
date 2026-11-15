"use client";

import { Alert, Box, Snackbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import NavbarPainel from "../NavbarPainel/NavbarPainel";
import BarraNoticias from "./BarraNoticias/BarraNoticias";
import ListaNoticias from "./ListaNoticias/ListaNoticias";
import ModalPublicarNoticia from "./ModalPublicarNoticia/ModalPublicarNoticia";
import ModalRemoverNoticia from "./ModalRemoverNoticia/ModalRemoverNoticia";
import ModalVisualizarNoticia from "./ModalVisualizarNoticia/ModalVisualizarNoticia";
import { listarNoticiasPorPeriodo, obterPeriodoPadrao, publicarNoticia, removerNoticia } from "../../services/noticiasService";

export default function PainelNutricionistaNoticias() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [periodo, setPeriodo] = useState(obterPeriodoPadrao);
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalPublicarAberto, setModalPublicarAberto] = useState(false);
    const [noticiaVisualizada, setNoticiaVisualizada] = useState(null);
    const [noticiaParaRemover, setNoticiaParaRemover] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const loadSequence = useRef(0);

    const carregarNoticias = useCallback(async () => {
        const sequence = ++loadSequence.current;
        try {
            const resultado = await listarNoticiasPorPeriodo(periodo);
            if (sequence === loadSequence.current) setNoticias(resultado);
        } catch (erro) {
            if (sequence === loadSequence.current) {
                setError(erro?.message || "Não foi possível carregar as notícias.");
            }
        } finally {
            if (sequence === loadSequence.current) setLoading(false);
        }
    }, [periodo]);

    const recarregarNoticias = () => {
        setLoading(true);
        setError("");
        return carregarNoticias();
    };

    useEffect(() => {
        const sequence = ++loadSequence.current;
        let ativo = true;
        listarNoticiasPorPeriodo(periodo)
            .then((resultado) => {
                if (ativo && sequence === loadSequence.current) {
                    setNoticias(resultado);
                    setError("");
                }
            })
            .catch((erro) => {
                if (ativo && sequence === loadSequence.current) {
                    setError(erro?.message || "Não foi possível carregar as notícias.");
                }
            })
            .finally(() => {
                if (ativo && sequence === loadSequence.current) setLoading(false);
            });
        return () => {
            ativo = false;
            loadSequence.current += 1;
        };
    }, [periodo]);

    const publicar = async (dados) => {
        try {
            const noticia = await publicarNoticia({ ...dados, data: new Date(), hora: new Date() });
            setModalPublicarAberto(false);
            setError("");
            setSnackbar({ open: true, message: "Notícia publicada: " + noticia.titulo, severity: "success" });
            await recarregarNoticias();
            return true;
        } catch (erro) {
            setSnackbar({
                open: true,
                message: erro?.message || "Não foi possível publicar a notícia.",
                severity: "error",
            });
            return false;
        }
    };

    const confirmarRemocao = async () => {
        if (!noticiaParaRemover) return;
        try {
            await removerNoticia(noticiaParaRemover.id);
            setSnackbar({ open: true, message: "Notícia removida: " + noticiaParaRemover.titulo, severity: "success" });
            setNoticiaParaRemover(null);
            await recarregarNoticias();
        } catch (erro) {
            setSnackbar({ open: true, message: erro?.message || "Operação indisponível.", severity: "error" });
        }
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
                    Notícias e Avisos
                </Typography>
                <Box sx={{ display: "grid", gap: 1.5 }}>
                    <BarraNoticias
                        periodo={periodo}
                        onPeriodoChange={(value) => {
                            setLoading(true);
                            setError("");
                            setPeriodo(value || obterPeriodoPadrao());
                        }}
                        onPublicar={() => setModalPublicarAberto(true)}
                    />
                    <ListaNoticias
                        noticias={noticias}
                        loading={loading}
                        error={error}
                        onRetry={recarregarNoticias}
                        onVisualizar={setNoticiaVisualizada}
                        onExcluir={setNoticiaParaRemover}
                        isMobile={isMobile}
                    />
                </Box>
            </Box>

            <ModalPublicarNoticia
                open={modalPublicarAberto}
                onClose={() => setModalPublicarAberto(false)}
                onPublicar={publicar}
            />
            <ModalVisualizarNoticia
                noticia={noticiaVisualizada}
                onClose={() => setNoticiaVisualizada(null)}
            />
            <ModalRemoverNoticia
                noticia={noticiaParaRemover}
                onClose={() => setNoticiaParaRemover(null)}
                onConfirmar={confirmarRemocao}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar((atual) => ({ ...atual, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    onClose={() => setSnackbar((atual) => ({ ...atual, open: false }))}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}
