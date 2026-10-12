import { Box, Card, LinearProgress, Stack, Typography } from "@mui/material";
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
            <Stack direction="row" alignItems="baseline" spacing={0.75}>
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
    const fichasConsumidas = Number(dadosDashboard?.fichasConsumidas) || 0;
    const fichasTotais = Number(dadosDashboard?.fichasTotais) || 0;
    const progresso =
        fichasTotais > 0 ? (fichasConsumidas / fichasTotais) * 100 : 0;
    const desperdicioExiste =
        dadosDashboard?.desperdicioKg !== null &&
        dadosDashboard?.desperdicioKg !== undefined &&
        dadosDashboard?.desperdicioKg !== "";
    const desperdicio = desperdicioExiste ? dadosDashboard.desperdicioKg : "—";

    return (
        <Card
            className={styles.card}
        >
            <Box className={styles.metrics}>
                <Metric
                    title="FICHAS CONSUMIDAS"
                    value={fichasConsumidas}
                    suffix={`/ ${fichasTotais}`}
                >
                    {/* A barra e os textos auxiliares usam o mesmo percentual. */}
                    <Stack spacing={0.75} className={styles.details}>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption" className={styles.blueText}>
                                {Math.round(progresso)}% da capacidade diária
                            </Typography>
                            <Typography variant="caption" className={styles.grayText}>
                                Restam {Math.max(fichasTotais - fichasConsumidas, 0)}
                            </Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={progresso}
                            className={styles.progress}
                        />
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
