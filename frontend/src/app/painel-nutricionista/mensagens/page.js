"use client";

import { useMemo, useState } from "react";
import MailOutlineIcon from "@mui/icons-material/MailOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
    Box,
    Card,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import NavbarPainel from "../../../components/NavbarPainel/NavbarPainel";
import SeletorIntervaloDatas from "../../../components/SeletorIntervaloDatas/SeletorIntervaloDatas";
import MensagensVisualizar from "../../../components/painelNutricionistaMensagens/MensagensVisualizar/MensagensVisualizar";

const mensagens = [
    {
        id: 1,
        data: "2026-09-21",
        dataExibicao: "21/09/2026",
        hora: "08:12",
        titulo: "Sobre o almoço de segunda-feira",
        descricao: "Gostaria de expressar minha satisfação com o almoço servido nesta segunda-feira.",
    },
    {
        id: 2,
        data: "2026-09-22",
        dataExibicao: "22/09/2026",
        hora: "09:45",
        titulo: "Sugestão de cardápio",
        descricao: "Venho por meio desta mensagem sugerir a inclusão de novas opções no cardápio.",
    },
    {
        id: 3,
        data: "2026-09-23",
        dataExibicao: "23/09/2026",
        hora: "11:20",
        titulo: "Opinião sobre o restaurante",
        descricao: "Gosto muito das opções de refeições do restaurante.",
    },
    {
        id: 4,
        data: "2026-09-24",
        dataExibicao: "24/09/2026",
        hora: "14:05",
        titulo: "Solicitação de ajuste no cardápio",
        descricao: "Requerimento para trocar o acompanhamento do almoço da quinta-feira.",
    },
];

const intervaloInicial = {
    from: new Date(2026, 8, 21),
    to: new Date(2026, 8, 24),
};

function dataParaIso(data) {
    if (!data) return "";
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

export default function MensagensPage() {
    const [intervalo, setIntervalo] = useState(intervaloInicial);
    const [mensagemSelecionada, setMensagemSelecionada] = useState(null);

    const mensagensFiltradas = useMemo(() => {
        const dataInicial = dataParaIso(intervalo?.from);
        const dataFinal = dataParaIso(intervalo?.to ?? intervalo?.from);

        return mensagens.filter((mensagem) => (
            (!dataInicial || mensagem.data >= dataInicial)
            && (!dataFinal || mensagem.data <= dataFinal)
        ));
    }, [intervalo]);

    return (
        <Box component="main" sx={{ minHeight: "100vh", bgcolor: "#f7f9fb" }}>
            <NavbarPainel />
            <Box
                component="section"
                aria-labelledby="messages-title"
                sx={{
                    width: "100%",
                    maxWidth: 616,
                    mx: "auto",
                    pt: "88px",
                    pb: 4,
                    px: { xs: 2, sm: 0 },
                }}
            >
                <Typography
                    id="messages-title"
                    component="h1"
                    variant="h5"
                    sx={{ fontWeight: 600, mb: 3 }}
                >
                    Mensagens
                </Typography>
                <Card
                    component="section"
                    variant="outlined"
                    sx={{
                        minHeight: 94,
                        px: 3,
                        py: 2.75,
                        borderColor: "#e3e8ed",
                        borderRadius: 1.25,
                    }}
                >
                    <Box sx={{ width: "100%", maxWidth: 270 }}>
                        <SeletorIntervaloDatas
                            label="Selecione o período"
                            value={intervalo}
                            onChange={setIntervalo}
                        />
                    </Box>
                </Card>
                <TableContainer
                    component={Card}
                    variant="outlined"
                    sx={{
                        mt: 1,
                        borderColor: "#e3e8ed",
                        borderRadius: 1.25,
                        overflowX: "auto",
                    }}
                >
                    <Table
                        aria-label="Lista de mensagens"
                        size="small"
                        sx={{
                            tableLayout: "fixed",
                            width: "100%",
                            minWidth: { xs: 616, sm: 0 },
                        }}
                    >
                        <colgroup>
                            <col style={{ width: 128 }} />
                            <col style={{ width: 206 }} />
                            <col style={{ width: 171 }} />
                            <col style={{ width: 109 }} />
                        </colgroup>
                        <TableHead>
                            <TableRow sx={{ height: 43 }}>
                                {["Data", "Título", "Descrição", ""].map((cabecalho, indice) => (
                                    <TableCell
                                        key={cabecalho || `acoes-${indice}`}
                                        aria-label={cabecalho ? undefined : "Ações"}
                                        sx={{
                                            px: 1.75,
                                            py: 1,
                                            borderBottom: 0,
                                            color: "text.primary",
                                            fontSize: 10,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {cabecalho}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {mensagensFiltradas.map((mensagem) => (
                                <TableRow key={mensagem.id} sx={{ height: 53 }}>
                                    <TableCell sx={{ px: 1.75, py: 0.75, borderColor: "#edf0f3" }}>
                                        <Typography
                                            component="div"
                                            sx={{ fontSize: 12, fontWeight: 700, lineHeight: 1.25 }}
                                        >
                                            {mensagem.dataExibicao}
                                        </Typography>
                                        <Typography component="div" sx={{ fontSize: 10, lineHeight: 1.25 }}>
                                            {mensagem.hora}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ px: 1.75, py: 0.75, borderColor: "#edf0f3" }}>
                                        <Typography
                                            noWrap
                                            sx={{
                                                fontSize: 12,
                                                fontWeight: 600,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {mensagem.titulo}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ px: 1.75, py: 0.75, borderColor: "#edf0f3" }}>
                                        <Typography
                                            noWrap
                                            sx={{
                                                color: "#4f5968",
                                                fontSize: 12,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {mensagem.descricao}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ px: 1.75, py: 0.75, borderColor: "#edf0f3" }}>
                                        <Stack
                                            direction="row"
                                            spacing={0.75}
                                            sx={{
                                                alignItems: "center",
                                                justifyContent: "flex-end",
                                            }}
                                        >
                                            <IconButton
                                                aria-label={`Visualizar mensagem ${mensagem.titulo}`}
                                                onClick={() => setMensagemSelecionada(mensagem)}
                                                size="small"
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    color: "common.white",
                                                    bgcolor: "#039be5",
                                                    boxShadow: 2,
                                                    "&:hover": { bgcolor: "#0288d1" },
                                                }}
                                            >
                                                <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                            <IconButton
                                                aria-label={`Responder mensagem ${mensagem.titulo}`}
                                                size="small"
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    color: "common.white",
                                                    bgcolor: "#039be5",
                                                    boxShadow: 2,
                                                    "&:hover": { bgcolor: "#0288d1" },
                                                }}
                                            >
                                                <MailOutlineIcon sx={{ fontSize: 17 }} />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {mensagensFiltradas.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        align="center"
                                        sx={{ height: 80, color: "text.secondary" }}
                                    >
                                        Nenhuma mensagem encontrada neste período.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            <MensagensVisualizar
                mensagem={mensagemSelecionada}
                onClose={() => setMensagemSelecionada(null)}
            />
        </Box>
    );
}
