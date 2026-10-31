"use client";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import {
    Box,
    Button,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { useState } from "react";
import NavbarPainel from "../../../components/NavbarPainel/NavbarPainel";
import SeletorIntervaloDatas from "../../../components/SeletorIntervaloDatas/SeletorIntervaloDatas";
import GraficosCardapio from "../../../components/painelNutricionistaCardapio/GraficosCardapio/GraficosCardapio";
import styles from "./relatorios.module.css";

const dadosIniciais = [
    {
        dia: "Segunda-feira",
        data: "21/09/2026",
        refeicao: "Gado com Legumes, Omelete, ...",
        fichas: "85",
        desperdicio: "10",
    },
    {
        dia: "Terça-feira",
        data: "22/09/2026",
        refeicao: "Suíno ao Molho, Dobradinha, ...",
        fichas: "80",
        desperdicio: "30",
    },
    {
        dia: "Quarta-feira",
        data: "23/09/2026",
        refeicao: "Suíno com Legumes, Omelete, ...",
        fichas: "60",
        desperdicio: "30",
        editavel: true,
    },
    {
        dia: "Quinta-feira",
        data: "24/09/2026",
        refeicao: "Pendente",
        fichas: "-",
        desperdicio: "-",
        editavel: true,
    },
    {
        dia: "Sexta-feira",
        data: "25/09/2026",
        refeicao: "Pendente",
        fichas: "-",
        desperdicio: "-",
        editavel: true,
    },
];

const periodoInicial = {
    from: new Date(2026, 8, 21),
    to: new Date(2026, 8, 25),
};

function escaparCsv(valor) {
    return `"${String(valor).replaceAll('"', '""')}"`;
}

export default function RelatoriosPage() {
    const [periodo, setPeriodo] = useState(periodoInicial);
    const [linhas, setLinhas] = useState(dadosIniciais);
    const [linhaEmEdicao, setLinhaEmEdicao] = useState(null);
    const [rascunho, setRascunho] = useState({ fichas: "", desperdicio: "" });
    const [erroEdicao, setErroEdicao] = useState("");

    const graficos = {
        fichas: linhas.map((linha) => Number(linha.fichas) || 0),
        desperdicio: linhas.map((linha) => Number(linha.desperdicio) || 0),
    };

    const exportarRelatorio = () => {
        const conteudo = [
            ["Dia", "Data", "Refeição", "Fichas", "Desperdício (kg)"],
            ...linhas.map((linha) => [
                linha.dia,
                linha.data,
                linha.refeicao,
                linha.fichas,
                linha.desperdicio,
            ]),
        ]
            .map((colunas) => colunas.map(escaparCsv).join(";"))
            .join("\r\n");
        const arquivo = new Blob(["\uFEFF", conteudo], {
            type: "text/csv;charset=utf-8",
        });
        const url = URL.createObjectURL(arquivo);
        const link = document.createElement("a");
        link.href = url;
        link.download = "relatorio-nutricionista.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    const abrirEdicao = (linha) => {
        setLinhaEmEdicao(linha);
        setRascunho({
            fichas: linha.fichas === "-" ? "" : linha.fichas,
            desperdicio: linha.desperdicio === "-" ? "" : linha.desperdicio,
        });
        setErroEdicao("");
    };

    const salvarEdicao = () => {
        const fichas = Number(rascunho.fichas);
        const desperdicio = Number(rascunho.desperdicio);
        if (
            rascunho.fichas.trim() === "" ||
            rascunho.desperdicio.trim() === "" ||
            !Number.isFinite(fichas) ||
            !Number.isFinite(desperdicio) ||
            fichas < 0 ||
            desperdicio < 0
        ) {
            setErroEdicao("Informe valores válidos e não negativos para os dois campos.");
            return;
        }

        setLinhas((atuais) =>
            atuais.map((linha) =>
                linha.data === linhaEmEdicao.data
                    ? {
                          ...linha,
                          fichas: String(fichas),
                          desperdicio: String(desperdicio),
                      }
                    : linha,
            ),
        );
        setLinhaEmEdicao(null);
    };

    return (
        <Box className={styles.page}>
            <NavbarPainel />
            <Box component="main" className={styles.main}>
                <Typography component="h1" className={styles.title}>
                    Relatórios
                </Typography>

                <Stack className={styles.sections}>
                    <Paper
                        component="section"
                        aria-label="Filtros do relatório"
                        variant="outlined"
                        className={styles.filterCard}
                    >
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            className={styles.filters}
                        >
                            <Box className={styles.datePicker}>
                                <SeletorIntervaloDatas
                                    value={periodo}
                                    onChange={setPeriodo}
                                    label="Selecione o Período"
                                    exibirIconeCalendario={false}
                                />
                            </Box>
                            <Button
                                variant="contained"
                                color="success"
                                endIcon={<DownloadIcon />}
                                onClick={exportarRelatorio}
                                className={styles.exportButton}
                            >
                                Exportar
                            </Button>
                        </Stack>
                    </Paper>

                    <GraficosCardapio graficos={graficos} cartaoCombinado />

                    <Card
                        component="section"
                        aria-label="Detalhamento semanal"
                        variant="outlined"
                        className={styles.tableCard}
                    >
                        <TableContainer>
                            <Table
                                size="small"
                                aria-label="Detalhamento de fichas e desperdício por dia"
                                className={styles.table}
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell className={styles.blankHeading} />
                                        <TableCell className={styles.blankHeading} />
                                        <TableCell align="center" className={styles.columnHeading}>
                                            Fichas
                                        </TableCell>
                                        <TableCell align="center" className={styles.columnHeading}>
                                            Desperdício (kg)
                                        </TableCell>
                                        <TableCell className={styles.blankHeading} />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {linhas.map((linha) => (
                                        <TableRow key={linha.data}>
                                            <TableCell className={styles.dayCell}>
                                                <Typography className={styles.dayName}>
                                                    {linha.dia}
                                                </Typography>
                                                <Typography className={styles.date}>
                                                    {linha.data}
                                                </Typography>
                                            </TableCell>
                                            <TableCell className={styles.mealCell}>
                                                <Typography noWrap className={styles.meal}>
                                                    {linha.refeicao}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center" className={styles.metric}>
                                                {linha.fichas}
                                            </TableCell>
                                            <TableCell align="center" className={styles.metric}>
                                                {linha.desperdicio}
                                            </TableCell>
                                            <TableCell align="right" className={styles.editCell}>
                                                {linha.editavel && (
                                                    <IconButton
                                                        aria-label={`Editar dados de ${linha.dia}`}
                                                        size="small"
                                                        onClick={() => abrirEdicao(linha)}
                                                        className={styles.editButton}
                                                    >
                                                        <EditOutlinedIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </Stack>
            </Box>

            <Dialog
                open={Boolean(linhaEmEdicao)}
                onClose={() => setLinhaEmEdicao(null)}
                fullWidth
                maxWidth="xs"
                aria-labelledby="editar-relatorio-titulo"
            >
                <DialogTitle id="editar-relatorio-titulo">
                    Editar dados de {linhaEmEdicao?.dia}
                </DialogTitle>
                <DialogContent className={styles.editDialogContent}>
                    <Typography variant="body2" color="text.secondary">
                        {linhaEmEdicao?.data}
                    </Typography>
                    <TextField
                        label="Fichas"
                        type="number"
                        value={rascunho.fichas}
                        onChange={(event) =>
                            setRascunho((atual) => ({
                                ...atual,
                                fichas: event.target.value,
                            }))
                        }
                        slotProps={{
                            htmlInput: { min: 0, step: 1 },
                        }}
                        fullWidth
                    />
                    <TextField
                        label="Desperdício (kg)"
                        type="number"
                        value={rascunho.desperdicio}
                        onChange={(event) =>
                            setRascunho((atual) => ({
                                ...atual,
                                desperdicio: event.target.value,
                            }))
                        }
                        slotProps={{
                            htmlInput: { min: 0, step: "any" },
                        }}
                        fullWidth
                    />
                    {erroEdicao && (
                        <Typography role="alert" color="error" variant="body2">
                            {erroEdicao}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLinhaEmEdicao(null)}>Cancelar</Button>
                    <Button variant="contained" onClick={salvarEdicao}>
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}