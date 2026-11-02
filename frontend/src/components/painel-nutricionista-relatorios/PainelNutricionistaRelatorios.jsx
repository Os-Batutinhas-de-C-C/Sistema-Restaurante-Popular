"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Snackbar, Skeleton, Stack, Typography } from "@mui/material";
import NavbarPainel from "../NavbarPainel/NavbarPainel";
import { atualizarRelatorio, formatarDadosDoRelatorio, listarRelatoriosSemana, obterDadosDosGraficos, obterPeriodoInicial, obterRelatoriosIniciais } from "../../services/relatoriosService";
import DialogRelatorio from "./DialogRelatorio";
import FiltrosRelatorio from "./FiltrosRelatorio";
import GraficosRelatorio from "./GraficosRelatorio";
import TabelaRelatorio from "./TabelaRelatorio";
import styles from "./painelNutricionistaRelatorios.module.css";

export default function PainelNutricionistaRelatorios() {
    const [periodo, setPeriodo] = useState(obterPeriodoInicial);
    const [relatorios, setRelatorios] = useState(obterRelatoriosIniciais);
    const [relatorioSelecionado, setRelatorioSelecionado] = useState(null);
    const [estado, setEstado] = useState("carregando");
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");

    const carregar = useCallback(() => {
        setEstado("carregando");
        setErro("");
        try {
            setEstado("sucesso");
        } catch {
            setErro("Não foi possível carregar o relatório.");
            setEstado("erro");
        }
    }, []);

    useEffect(() => {
        carregar();
    }, [carregar]);

    const relatoriosDoPeriodo = useMemo(() => listarRelatoriosSemana(relatorios, periodo), [relatorios, periodo]);
    const dadosDoGrafico = useMemo(() => obterDadosDosGraficos(relatoriosDoPeriodo), [relatoriosDoPeriodo]);
    const relatoriosFormatados = useMemo(() => formatarDadosDoRelatorio(relatoriosDoPeriodo), [relatoriosDoPeriodo]);

    const salvarRelatorio = (id, valores) => {
        setRelatorios((atuais) => atualizarRelatorio(atuais, id, valores));
        setMensagem("Relatório atualizado");
    };

    const exportarRelatorio = async (formato) => {
        try {
            const { exportarCsv, exportarPdf } = await import("../../utils/exportarRelatorio");
            if (formato === "csv") exportarCsv(relatoriosDoPeriodo, periodo);
            else exportarPdf(relatoriosDoPeriodo, periodo);
            setErro("");
            setMensagem(`Relatório ${formato.toUpperCase()} exportado`);
        } catch {
            setErro("Não foi possível exportar o relatório.");
        }
    };

    return (
        <Box className={styles.page}>
            <NavbarPainel />
            <Box component="main" className={styles.main}>
                <Typography component="h1" className={styles.title}>Relatórios</Typography>
                <Stack className={styles.sections}>
                    <FiltrosRelatorio periodo={periodo} onPeriodoChange={setPeriodo} onExport={exportarRelatorio} />
                    {estado === "carregando" ? <>
                        <Skeleton variant="rounded" height={240} /><Skeleton variant="rounded" height={250} />
                    </> : estado === "erro" ? <Alert severity="error" action={<Button color="inherit" onClick={carregar}>Tentar novamente</Button>}>{erro}</Alert> : <>
                        <GraficosRelatorio dados={dadosDoGrafico} />
                        <TabelaRelatorio relatorios={relatoriosFormatados} onEditar={setRelatorioSelecionado} />
                    </>}
                </Stack>
            </Box>
            <DialogRelatorio relatorio={relatorioSelecionado} onClose={() => setRelatorioSelecionado(null)} onSave={salvarRelatorio} />
            <Snackbar open={Boolean(mensagem)} autoHideDuration={4000} onClose={() => setMensagem("")}><Alert severity="success" variant="filled" onClose={() => setMensagem("")}>{mensagem}</Alert></Snackbar>
            <Snackbar open={Boolean(erro) && estado !== "erro"} autoHideDuration={6000} onClose={() => setErro("")}><Alert severity="error" variant="filled" onClose={() => setErro("")}>{erro}</Alert></Snackbar>
        </Box>
    );
}
