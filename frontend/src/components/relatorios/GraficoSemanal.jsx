import { BarChart } from "@mui/x-charts/BarChart";
import { Box, Typography } from "@mui/material";

const diasDaSemana = ["Seg", "Ter", "Qua", "Qui", "Sex"];

export default function GraficoSemanal({ titulo, cor, rotulos = diasDaSemana, valores = [], altura = 184 }) {
    const dataset = rotulos.map((dia, indice) => ({ dia, valor: valores[indice] ?? 0 }));
    return (
        <Box component="section" aria-label={`${titulo} por dia da semana, em percentual`} sx={{ minWidth: 0 }}>
            <Typography component="h2" variant="subtitle2" sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 0.75, mb: 0.5, fontSize: 12 }}>
                <Box component="span" aria-hidden="true" sx={{ width: 10, height: 10, bgcolor: cor }} />
                {titulo}
            </Typography>
            <BarChart
                dataset={dataset}
                xAxis={[{ scaleType: "band", dataKey: "dia" }]}
                yAxis={[{ min: 0, max: 100, tickNumber: 6, width: 34, valueFormatter: (value) => `${value}%` }]}
                series={[{ dataKey: "valor", label: titulo, color: cor, valueFormatter: (value) => `${value}%` }]}
                grid={{ horizontal: true }}
                hideLegend
                height={altura}
                margin={{ top: 8, right: 8, bottom: 28, left: 4 }}
            />
        </Box>
    );
}
