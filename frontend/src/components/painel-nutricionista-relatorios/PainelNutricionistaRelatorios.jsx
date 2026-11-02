"use client";

import { useMemo, useState } from "react";
import { Alert, Box, Snackbar, Stack, Typography } from "@mui/material";
import NavbarPainel from "../NavbarPainel/NavbarPainel";
import {
    atualizarRelatorio,
    calcularIndicadores,
    exportarRelatorioCsv,
    exportarRelatorioPdf,
    filtrarRelatoriosPorPeriodo,
    formatarDadosDoRelatorio,
    obterDadosDosGraficos,
    obterPeriodoInicial,
    obterRelatoriosIniciais,
} from "../../services/relatoriosService";
import DialogRelatorio from "./DialogRelatorio";
import FiltrosRelatorio from "./FiltrosRelatorio";
import GraficosRelatorio from "./GraficosRelatorio";
import TabelaRelatorio from "./TabelaRelatorio";
import styles from "./painelNutricionistaRelatorios.module.css";

export default function PainelNutricionistaRelatorios() {
    const [periodo, setPeriodo] = useState(obterPeriodoInicial);
    const [relatorios, setRelatorios] = useState(obterRelatoriosIniciais);
    const [relatorioSelecionado, setRelatorioSelecionado] = useState(null);
    const [erroExportacao, setErroExportacao] = useState("");

    const relatoriosDoPeriodo = useMemo(
        () => filtrarRelatoriosPorPeriodo(relatorios, periodo),
        [relatorios, periodo],
    );
    const dadosDoGrafico = useMemo(
        () => obterDadosDosGraficos(relatoriosDoPeriodo),
        [relatoriosDoPeriodo],
    );
    const relatoriosFormatados = useMemo(
        () => formatarDadosDoRelatorio(relatoriosDoPeriodo),
        [relatoriosDoPeriodo],
    );
    const indicadores = useMemo(
        () => calcularIndicadores(relatoriosDoPeriodo),
        [relatoriosDoPeriodo],
    );

    const salvarRelatorio = (id, valores) => {
        setRelatorios(atualizarRelatorio(relatorios, id, valores));
    };

    const exportarRelatorio = (formato) => {
        try {
            if (formato === "pdf") {
                exportarRelatorioPdf(relatoriosDoPeriodo, periodo);
            } else {
                exportarRelatorioCsv(relatoriosDoPeriodo);
            }
            setErroExportacao("");
        } catch (erro) {
            setErroExportacao(erro.message);
        }
    };

    return (
        <Box className={styles.page}>
            <NavbarPainel />
            <Box component="main" className={styles.main}>
                <Typography component="h1" className={styles.title}>
                    Relatórios
                </Typography>
                <Stack className={styles.sections}>
                    <FiltrosRelatorio
                        periodo={periodo}
                        onPeriodoChange={setPeriodo}
                        onExport={exportarRelatorio}
                    />
                    <GraficosRelatorio dados={dadosDoGrafico} />
                    <TabelaRelatorio
                        relatorios={relatoriosFormatados}
                        onEditar={setRelatorioSelecionado}
                    />
                </Stack>
            </Box>
            <DialogRelatorio
                relatorio={relatorioSelecionado}
                onClose={() => setRelatorioSelecionado(null)}
                onSave={salvarRelatorio}
            />
            <Snackbar
                open={Boolean(erroExportacao)}
                autoHideDuration={6000}
                onClose={() => setErroExportacao("")}
            >
                <Alert
                    severity="error"
                    variant="filled"
                    onClose={() => setErroExportacao("")}
                >
                    {erroExportacao}
                </Alert>
            </Snackbar>
            <Box
                component="span"
                className={styles.screenReaderSummary}
                aria-live="polite"
            >
                {`Total de fichas: ${indicadores.totalFichas}. Média de desperdício: ${indicadores.mediaDesperdicioKg.toFixed(1)} kg. Média de sobras: ${indicadores.mediaSobrasKg.toFixed(1)} kg. Satisfação média: ${indicadores.mediaSatisfacao.toFixed(1)} de 5.`}
            </Box>
        </Box>
    );
}
