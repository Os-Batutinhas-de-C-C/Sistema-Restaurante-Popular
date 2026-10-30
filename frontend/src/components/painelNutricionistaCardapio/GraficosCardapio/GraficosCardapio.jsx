import { Box, Card, Stack, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import styles from "./graficosCardapio.module.css";

const diasDaSemana = ["Seg", "Ter", "Qua", "Qui", "Sex"];

function GraficoBarras({ titulo, valores, cor }) {
    const dataset = diasDaSemana.map((dia, index) => ({ dia, valor: valores[index] }));

    return (
        <Card component="section" variant="outlined" className={styles.card}>
            <Typography component="h2" variant="subtitle2" className={styles.title}>
                <Box component="span" className={styles.legend} sx={{ backgroundColor: cor }} />
                {titulo}
            </Typography>
            <BarChart
                dataset={dataset}
                xAxis={[{ scaleType: "band", dataKey: "dia" }]}
                yAxis={[{ min: 0, max: 100, width: 34 }]}
                series={[{ dataKey: "valor", label: titulo, color: cor }]}
                grid={{ horizontal: true }}
                hideLegend
                height={205}
                margin={{ top: 8, right: 8, bottom: 28, left: 4 }}
            />
        </Card>
    );
}

export default function GraficosCardapio({ graficos }) {
    return (
        <Stack component="section" aria-label="Gráficos semanais" className={styles.charts}>
            <GraficoBarras titulo="Fichas" valores={graficos.fichas} cor="#1565c0" />
            <GraficoBarras titulo="Desperdício" valores={graficos.desperdicio} cor="#ef6c00" />
        </Stack>
    );
}
