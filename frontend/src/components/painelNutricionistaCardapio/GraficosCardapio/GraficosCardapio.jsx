import { Box, Card, Stack } from "@mui/material";
import GraficoSemanal from "../../relatorios/GraficoSemanal";
import styles from "./graficosCardapio.module.css";

export default function GraficosCardapio({ graficos, cartaoCombinado = false }) {
    const charts = (
        <>
            <GraficoSemanal titulo="Fichas" valores={graficos.fichas} cor="#075d9e" />
            <GraficoSemanal titulo="Desperdício" valores={graficos.desperdicio} cor="#ef7000" />
        </>
    );

    if (cartaoCombinado) {
        return (
            <Card component="section" aria-label="Gráficos do relatório" variant="outlined" className={styles.combinedCard}>
                <Box className={styles.combinedCharts}>{charts}</Box>
            </Card>
        );
    }
    return <Stack component="section" aria-label="Gráficos semanais" className={styles.charts}>{charts}</Stack>;
}
