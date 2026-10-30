import { Box, Stack, Typography } from "@mui/material";
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
                    <AcoesRapidas onWasteClick={onWasteClick} />
                    <ResumoMetricas dadosDashboard={dadosDashboard} />
                    <CardapioHoje dadosDashboard={dadosDashboard} />
                </Stack>
            </Box>
        </Box>
    );
}

// Mock temporário para validar o layout enquanto a API ainda não está disponível.
export const mockDadosDashboard = {
    titulo: "Resumo de Hoje",
    data: "Quarta-Feira, 23 de Setembro",
    atualizadoEm: "Atualizado às 11:42",
    fichasConsumidas: 155,
    fichasTotais: 300,
    desperdicioKg: null,
    cardapio: {
        pratoProteico: "Suíno com Legumes",
        opcaoProteica: "Omelete",
        acompanhamento1: "Arroz Branco",
        acompanhamento2: "Feijão Carioca",
        guarnicao: "Farofa de Cuscuz",
        saladaDoDia: "Salada Crua",
        sobremesa: "Doce",
        sucoNatural: "Suco de Polpa de Cajá",
        valorCaloricoEstimado: "~ 950 kcal",
    },
};
