import { Box, Card, LinearProgress, Stack, Typography } from "@mui/material";
import { percentualFichas } from "../../../services/fichasService";
import styles from "./resumoMetricas.module.css";

// Subcomponente de apresentação usado para manter o padrão entre as métricas.
function Metric({ title, value, suffix, children, borderLeft = false }) {
    return (
        <Box
            className={`${styles.metric} ${borderLeft ? styles.secondaryMetric : ""}`}
        >
            <Typography
                variant="overline"
                className={styles.label}
            >
                {title}
            </Typography>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "baseline" }}>
                <Typography
                    variant="h4"
                    className={styles.value}
                >
                    {value}
                </Typography>
                <Typography variant="body1" className={styles.suffix}>
                    {suffix}
                </Typography>
            </Stack>
            {children}
        </Box>
    );
}

/**
 * Exibe os indicadores resumidos do dia.
 *
 * Os cálculos ficam aqui para que o componente continue "dumb": ele recebe
 * dados simples e apenas transforma esses dados em uma representação visual.
 */
export default function ResumoMetricas({ dadosDashboard }) {
    // Normaliza valores ausentes para evitar resultados inválidos na interface.
    const fichasDisponiveis = Number.isSafeInteger(dadosDashboard?.fichasEntregues);
    const fichasEntregues = fichasDisponiveis ? dadosDashboard.fichasEntregues : "—";
    const capacidadeDisponivel = Number.isSafeInteger(dadosDashboard?.fichasTotais);
    const percentual = fichasDisponiveis && capacidadeDisponivel
        ? percentualFichas({
            entregues: dadosDashboard.fichasEntregues,
            capacidade: dadosDashboard.fichasTotais,
        })
        : 0;
    const desperdicioExiste =
        dadosDashboard?.desperdicioKg !== null &&
        dadosDashboard?.desperdicioKg !== undefined &&
        dadosDashboard?.desperdicioKg !== "";
    const desperdicio = desperdicioExiste ? dadosDashboard.desperdicioKg : "—";
    const fichasComCapacidade = (
        <>
            <span data-testid="fichas-entregues">{fichasEntregues}</span>
            {capacidadeDisponivel && (
                <span className={styles.capacity}>
                    {" / "}
                    <span data-testid="fichas-capacidade">{dadosDashboard.fichasTotais}</span>
                </span>
            )}
        </>
    );

    return (
        <Card
            className={styles.card}
        >
            <Box className={styles.metrics}>
                <Metric
                    title="FICHAS ENTREGUES"
                    value={fichasComCapacidade}
                    suffix=""
                >
                    <Stack spacing={0.75} className={styles.details}>
                        {fichasDisponiveis && capacidadeDisponivel && (
                            <>
                                <Typography variant="caption" className={styles.grayText}>
                                    {Math.round(percentual)}% da capacidade diária
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={percentual}
                                    aria-label="Capacidade diária de fichas entregues"
                                    className={styles.progress}
                                />
                            </>
                        )}
                        {!fichasDisponiveis && (
                            <Typography variant="caption" className={styles.blueText}>
                                {dadosDashboard?.fichasCarregando ? "Carregando contagem..." : "Sem dado disponível"}
                            </Typography>
                        )}
                    </Stack>
                </Metric>
                <Metric
                    title="DESPERDÍCIO DO DIA"
                    value={desperdicio}
                    suffix="kg"
                    borderLeft
                >
                    <Stack spacing={0.25} className={styles.details}>
                        <Typography variant="caption" className={styles.blueText}>
                            {desperdicioExiste
                                ? "Dado registrado"
                                : "Sem dado disponível"}
                        </Typography>
                        <Typography variant="caption" className={styles.grayText}>
                            {desperdicioExiste
                                ? "Registro salvo hoje"
                                : "Registre os dados do dia"}
                        </Typography>
                    </Stack>
                </Metric>
            </Box>
        </Card>
    );
}
