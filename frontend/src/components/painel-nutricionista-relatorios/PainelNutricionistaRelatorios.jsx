"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Snackbar, Stack, Typography } from "@mui/material";
import NavbarPainel from "../NavbarPainel/NavbarPainel";
import {
    calcularIndicadores,
    exportarRelatorioCsv,
    exportarRelatorioPdf,
    filtrarRelatoriosPorPeriodo,
    formatarDadosDoRelatorio,
    mapearSemanasParaRelatorios,
    obterDadosDosGraficos,
    obterPeriodoInicial,
} from "../../services/relatoriosService";
import {
    listarSemanasApi,
    salvarMetricasDiaApi,
} from "../../services/cardapiosApiService";
import DialogRelatorio from "./DialogRelatorio";
import FiltrosRelatorio from "./FiltrosRelatorio";
import GraficosRelatorio from "./GraficosRelatorio";
import TabelaRelatorio from "./TabelaRelatorio";
import styles from "./painelNutricionistaRelatorios.module.css";

export default function PainelNutricionistaRelatorios() {
    const [periodo, setPeriodo] = useState(obterPeriodoInicial);
    const [relatorios, setRelatorios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erroCarregamento, setErroCarregamento] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [relatorioSelecionado, setRelatorioSelecionado] = useState(null);
    const [erroExportacao, setErroExportacao] = useState("");

    useEffect(() => {
        let ativo = true;
        listarSemanasApi()
            .then((semanas) => {
                if (ativo) setRelatorios(mapearSemanasParaRelatorios(semanas));
            })
            .catch((erro) => {
                if (ativo) {
                    setErroCarregamento(erro?.message || "Não foi possível carregar os relatórios.");
                }
            })
            .finally(() => {
                if (ativo) setCarregando(false);
            });
        return () => { ativo = false; };
    }, [refreshKey]);

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

    const salvarRelatorio = async (id, valores) => {
        const relatorio = relatorios.find((item) => item.id === id);
        if (!relatorio) throw new Error("O registro selecionado não foi encontrado.");

        const fichasTexto = String(valores.fichasVendidas).trim();
        const fichasVendidas = Number(fichasTexto);
        if (
            !fichasTexto
            || !Number.isSafeInteger(fichasVendidas)
            || fichasVendidas < 0
            || fichasVendidas > 300
        ) {
            throw new Error("Informe uma quantidade de fichas entre 0 e 300.");
        }

        const desperdicioTexto = String(valores.desperdicioKg).trim();
        const desperdicioKg = Number(desperdicioTexto.replace(",", "."));
        if (!desperdicioTexto || !Number.isFinite(desperdicioKg) || desperdicioKg < 0) {
            throw new Error("Informe um valor válido e não negativo para desperdício.");
        }
        const metricas = { desperdicioKg };
        if (fichasVendidas !== relatorio.fichas) {
            metricas.fichasVendidas = fichasVendidas;
        }
        const semana = await salvarMetricasDiaApi(relatorio.data, metricas);
        const atualizados = new Map(
            mapearSemanasParaRelatorios([semana]).map((item) => [item.id, item]),
        );
        setRelatorios((atuais) => atuais.map((item) => atualizados.get(item.id) ?? item));
    };

    const recarregar = useCallback(() => {
        setCarregando(true);
        setErroCarregamento("");
        setRefreshKey((atual) => atual + 1);
    }, []);

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
                    {erroCarregamento && (
                        <Alert
                            severity="error"
                            action={<Button color="inherit" size="small" onClick={recarregar}>Tentar novamente</Button>}
                        >
                            {erroCarregamento}
                        </Alert>
                    )}
                    {carregando && (
                        <Typography role="status">Carregando relatórios...</Typography>
                    )}
                    {!carregando && !erroCarregamento && (
                        <>
                            <GraficosRelatorio dados={dadosDoGrafico} />
                            <TabelaRelatorio
                                relatorios={relatoriosFormatados}
                                onEditar={setRelatorioSelecionado}
                            />
                        </>
                    )}
                </Stack>
            </Box>
            <DialogRelatorio
                key={relatorioSelecionado?.id ?? "sem-relatorio"}
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
                {`Total de fichas: ${indicadores.totalFichas ?? "indisponível"}. Média de desperdício: ${Number.isFinite(indicadores.mediaDesperdicioKg) ? `${indicadores.mediaDesperdicioKg.toFixed(1)} kg` : "indisponível"}. Média de sobras: ${Number.isFinite(indicadores.mediaSobrasKg) ? `${indicadores.mediaSobrasKg.toFixed(1)} kg` : "indisponível"}. Satisfação média: ${Number.isFinite(indicadores.mediaSatisfacao) ? `${indicadores.mediaSatisfacao.toFixed(1)} de 5` : "indisponível"}.`}
            </Box>
        </Box>
    );
}
