import { Alert, Box, Button, Card, Stack, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import styles from "./graficosCardapio.module.css";

const diasDaSemana = ["Seg", "Ter", "Qua", "Qui", "Sex"];

function GraficoBarras({ titulo, valores, cor, maximo = 100, aviso, erro, onRetry }) {
    const dataset = diasDaSemana.map((dia, index) => ({ dia, valor: valores[index] }));

    return (
        <Card component="section" variant="outlined" className={styles.card}
            aria-label={`${titulo} na semana: ${diasDaSemana.map((dia, index) => `${dia} ${valores[index] ?? "indisponível"}`).join(", ")}`}>
            <Typography component="h2" variant="subtitle2" className={styles.title}>
                <Box component="span" className={styles.legend} sx={{ backgroundColor: cor }} />
                {titulo}
            </Typography>
            {aviso && <Typography variant="caption">Atualizando fichas de hoje...</Typography>}
            {erro && <Alert severity="warning" icon={false} action={<Button color="inherit" size="small" onClick={onRetry}>Atualizar</Button>}>{erro}</Alert>}
            <BarChart
                dataset={dataset}
                xAxis={[{ scaleType: "band", dataKey: "dia" }]}
                yAxis={[{ min: 0, max: maximo, width: 34 }]}
                series={[{ dataKey: "valor", label: titulo, color: cor }]}
                grid={{ horizontal: true }}
                hideLegend
                height={205}
                margin={{ top: 8, right: 8, bottom: 28, left: 4 }}
            />
        </Card>
    );
}

export default function GraficosCardapio({ graficos, erroFichas, carregandoFichas, onRefreshFichas }) {
    const maximoFichas = Math.max(graficos.capacidadeFichas ?? 0, ...graficos.fichas.filter(Number.isFinite)) || undefined;
    return (
        <Stack component="section" aria-label="Gráficos semanais" className={styles.charts}>
            <GraficoBarras titulo="Fichas entregues" valores={graficos.fichas} cor="#1565c0"
                maximo={maximoFichas} aviso={carregandoFichas} erro={erroFichas} onRetry={onRefreshFichas} />
            <GraficoBarras titulo="Desperdício" valores={graficos.desperdicio} cor="#ef6c00" />
        </Stack>
    );
}
