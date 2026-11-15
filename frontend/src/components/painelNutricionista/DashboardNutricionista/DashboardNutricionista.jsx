import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import NavbarPainel from "../../NavbarPainel/NavbarPainel";
import AcoesRapidas from "../AcoesRapidas/AcoesRapidas";
import CardapioHoje from "../CardapioHoje/CardapioHoje";
import ResumoMetricas from "../ResumoMetricas/ResumoMetricas";
import styles from "./dashboardNutricionista.module.css";

/**
 * Composição visual principal do painel.
 *
 * Este componente é deliberadamente "dumb": recebe dados e callbacks da
 * página, sem conhecer regras de persistência ou integração com a API.
 */
export default function DashboardNutricionista({
    dadosDashboard,
    onWasteClick,
    onRefresh,
    error,
    loading,
}) {
    return (
        <Box className={styles.page}>
            <NavbarPainel />
            <Box component="main" className={styles.main}>
                {/* Cabeçalho com período exibido e ação de atualização dos dados. */}
                <Stack className={styles.heading}>
                    <Box className={styles.headingRow}>
                        <Box>
                            <Typography variant="h4" className={styles.title}>
                                {dadosDashboard.titulo}
                            </Typography>
                            <Typography variant="body2" className={styles.date}>
                                {dadosDashboard.data}
                            </Typography>
                        </Box>
                        <Box
                            component="button"
                            type="button"
                            className={styles.updated}
                            onClick={onRefresh}
                            aria-label="Atualizar dados do dashboard"
                        >
                            <Box
                                component="img"
                                src="/icons/clock.svg"
                                alt=""
                                className={styles.updatedIcon}
                            />
                            <Typography variant="caption" className={styles.updatedText}>
                                {dadosDashboard.atualizadoEm}
                            </Typography>
                        </Box>
                    </Box>
                </Stack>
                {/* Seções independentes que compõem o conteúdo do dashboard. */}
                <Stack className={styles.sections}>
                    {error && <Alert severity="error">{error}</Alert>}
                    {loading && <CircularProgress size={24} aria-label="Carregando dados do painel" />}
                    <AcoesRapidas onWasteClick={onWasteClick} />
                    <ResumoMetricas dadosDashboard={dadosDashboard} />
                    <CardapioHoje dadosDashboard={dadosDashboard} />
                </Stack>
            </Box>
        </Box>
    );
}
