import { Box, Card, Stack, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import styles from "./graficosCardapio.module.css";

const diasDaSemana = ["Seg", "Ter", "Qua", "Qui", "Sex"];

function GraficoBarras({ titulo, valores, cor, emCartao = true }) {
    const dataset = diasDaSemana.map((dia, index) => ({ dia, valor: valores[index] }));

    const conteudo = (
        <>
            <Typography component="h2" variant="subtitle2" className={styles.title}>
                <Box component="span" className={styles.legend} sx={{ backgroundColor: cor }} />
                {titulo}
            </Typography>
            <BarChart
                dataset={dataset}
                xAxis={[{ scaleType: "band", dataKey: "dia" }]}
                yAxis={[{ min: 0, max: 100, tickNumber: 11, width: 34 }]}
                series={[{ dataKey: "valor", label: titulo, color: cor }]}
                grid={{ horizontal: true }}
                hideLegend
                height={205}
                margin={{ top: 8, right: 8, bottom: 28, left: 4 }}
            />
        </>
    );

    if (!emCartao) {
        return (
            <Box component="section" className={styles.chart}>
                {conteudo}
            </Box>
        );
    }

    return (
        <Card component="section" variant="outlined" className={styles.card}>
            {conteudo}
        </Card>
    );
}

export default function GraficosCardapio({ graficos, cartaoCombinado = false }) {
    if (cartaoCombinado) {
        return (
            <Card
                component="section"
                aria-label="Gráficos do relatório"
                variant="outlined"
                className={styles.combinedCard}
            >
                <Box className={styles.combinedCharts}>
                    <GraficoBarras
                        titulo="Fichas"
                        valores={graficos.fichas}
                        cor="#075b9d"
                        emCartao={false}
                    />
                    <GraficoBarras
                        titulo="Desperdício"
                        valores={graficos.desperdicio}
                        cor="#ef6c00"
                        emCartao={false}
                    />
                </Box>
            </Card>
        );
    }

    return (
        <Stack component="section" aria-label="Gráficos semanais" className={styles.charts}>
            <GraficoBarras titulo="Fichas" valores={graficos.fichas} cor="#1565c0" />
            <GraficoBarras titulo="Desperdício" valores={graficos.desperdicio} cor="#ef6c00" />
        </Stack>
    );
}
