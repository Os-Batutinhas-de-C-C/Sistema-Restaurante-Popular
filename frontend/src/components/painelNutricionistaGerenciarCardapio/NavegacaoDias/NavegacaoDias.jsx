import { ArrowBack, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Box, Button, ButtonBase, Card, Stack, Typography } from "@mui/material";
import styles from "./navegacaoDias.module.css";

const nomesCurtos = {
    "Segunda-feira": "Seg",
    "Terça-feira": "Ter",
    "Quarta-feira": "Qua",
    "Quinta-feira": "Qui",
    "Sexta-feira": "Sex",
};

export default function NavegacaoDias({ dias, dataSelecionada, intervalo, onSelectDay, onNavigateWeek, onBack }) {
    return (
        <Stack spacing={1.5}>
            <Stack className={styles.heading} direction={{ xs: "column", md: "row" }}>
                <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
                    <ButtonBase aria-label="Voltar ao painel" onClick={onBack} className={styles.backButton}>
                        <ArrowBack fontSize="small" />
                    </ButtonBase>
                    <Box minWidth={0}>
                        <Typography component="h1" variant="h4" className={styles.title}>Gerenciamento de Cardápio</Typography>
                        <Typography variant="body2" color="text.secondary">{intervalo}</Typography>
                    </Box>
                </Stack>
                <Stack direction="row" spacing={1} className={styles.weekActions}>
                    <Button size="small" variant="contained" startIcon={<ChevronLeft />} onClick={() => onNavigateWeek(-1)} sx={{ textTransform: "none" }}>
                        Semana Anterior
                    </Button>
                    <Button size="small" variant="contained" endIcon={<ChevronRight />} onClick={() => onNavigateWeek(1)} sx={{ textTransform: "none" }}>
                        Próxima Semana
                    </Button>
                </Stack>
            </Stack>
            <Card component="nav" aria-label="Dias da semana" variant="outlined" className={styles.daysCard}>
                <Box className={styles.daysGrid}>
                    {dias.map(({ nome, data }) => (
                        <ButtonBase
                            key={data}
                            aria-label={`${nome}, ${new Intl.DateTimeFormat("pt-BR").format(new Date(`${data}T12:00:00`))}`}
                            aria-pressed={data === dataSelecionada}
                            onClick={() => onSelectDay(data)}
                            className={`${styles.dayButton} ${data === dataSelecionada ? styles.selected : ""}`}
                        >
                            <Typography component="span" variant="body2" className={styles.dayName}>
                                <span className={styles.fullDayName}>{nome}</span>
                                <span className={styles.shortDayName}>{nomesCurtos[nome]}</span>
                            </Typography>
                            <Typography component="span" variant="body2" className={styles.dayDate}>
                                <span className={styles.fullDate}>{new Intl.DateTimeFormat("pt-BR").format(new Date(`${data}T12:00:00`))}</span>
                                <span className={styles.shortDate}>{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(`${data}T12:00:00`))}</span>
                            </Typography>
                        </ButtonBase>
                    ))}
                </Box>
            </Card>
        </Stack>
    );
}
