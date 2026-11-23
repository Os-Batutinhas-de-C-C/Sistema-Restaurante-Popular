"use client";

import { useEffect, useState } from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import NavbarPainel from "../NavbarPainel/NavbarPainel";
import ResumoMetricas from "../painelNutricionista/ResumoMetricas/ResumoMetricas";
import styles from "../painelNutricionista/DashboardNutricionista/dashboardNutricionista.module.css";
import { consultarDesperdicioHoje } from "../../services/desperdicioService";
import { formatarDataFichas } from "../../services/fichasService";
import useFichasDia from "../../services/useFichasDia";

export default function PainelGestor() {
    const fichas = useFichasDia();
    const dataFichas = fichas.dataReferencia;
    const recarregarFichas = fichas.recarregar;
    const [ciclo, setCiclo] = useState(0);
    const [desperdicio, setDesperdicio] = useState({
        dados: null, dataReferencia: null, dataFichas: null, ciclo: -1, erro: "",
    });

    useEffect(() => {
        const controller = new AbortController();
        let ativo = true;
        const timeout = setTimeout(() => controller.abort(), 12000);

        consultarDesperdicioHoje({ signal: controller.signal })
            .then((dados) => {
                if (ativo) {
                    setDesperdicio({ dados, dataReferencia: dados.data, dataFichas, ciclo, erro: "" });
                }
            })
            .catch((erro) => {
                if (ativo) {
                    setDesperdicio((anterior) => ({
                        dados: null, dataReferencia: anterior.dataReferencia, dataFichas, ciclo,
                        erro: erro.message || "Não foi possível consultar o desperdício do dia.",
                    }));
                }
            })
            .finally(() => clearTimeout(timeout));

        return () => {
            ativo = false;
            controller.abort();
            clearTimeout(timeout);
        };
    }, [ciclo, dataFichas]);

    const dataDesperdicio = desperdicio.dataReferencia;
    useEffect(() => {
        if (dataFichas && dataDesperdicio && dataDesperdicio > dataFichas) recarregarFichas();
    }, [dataDesperdicio, dataFichas, recarregarFichas]);

    const data = (dataDesperdicio ?? "") > (dataFichas ?? "") ? dataDesperdicio : dataFichas;
    const fichasDoDia = fichas.dados?.data === data ? fichas.dados : null;
    const desperdicioDoDia = desperdicio.dados?.data === data ? desperdicio.dados : null;
    const consultaAtual = desperdicio.ciclo === ciclo && desperdicio.dataFichas === dataFichas;
    const erroDesperdicio = consultaAtual ? desperdicio.erro : "";
    const dadosDashboard = {
        fichasEntregues: fichasDoDia?.entregues,
        fichasTotais: fichasDoDia?.capacidade,
        fichasCarregando: fichas.loading || Boolean(fichas.dados && !fichasDoDia && !fichas.error),
        desperdicioKg: desperdicioDoDia?.desperdicioKg,
        desperdicioCarregando: !consultaAtual && !desperdicioDoDia,
        desperdicioErro: erroDesperdicio,
    };

    const recarregarDesperdicio = () => setCiclo((anterior) => anterior + 1);
    const atualizarIndicadores = () => {
        recarregarFichas();
        recarregarDesperdicio();
    };

    return (
        <Box className={styles.page}>
            <NavbarPainel variant="gestor" />
            <Box component="main" className={styles.main}>
                <Stack className={styles.heading}>
                    <Box className={styles.headingRow}>
                        <Box>
                            <Typography variant="h4" component="h1" className={styles.title}>Painel Gestor</Typography>
                            <Typography variant="body2" className={styles.date}>{formatarDataFichas(data)}</Typography>
                        </Box>
                        <Button variant="outlined" onClick={atualizarIndicadores}>Atualizar indicadores</Button>
                    </Box>
                </Stack>
                <Stack className={styles.sections}>
                    {fichas.error && (
                        <Alert severity="error" action={<Button color="inherit" size="small" onClick={recarregarFichas}>Tentar novamente</Button>}>
                            Fichas entregues. {fichas.error}
                        </Alert>
                    )}
                    {erroDesperdicio && (
                        <Alert severity="error" action={<Button color="inherit" size="small" onClick={recarregarDesperdicio}>Tentar novamente</Button>}>
                            Desperdício do dia. {erroDesperdicio}
                        </Alert>
                    )}
                    <ResumoMetricas dadosDashboard={dadosDashboard} somenteLeitura />
                </Stack>
            </Box>
        </Box>
    );
}
