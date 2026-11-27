import {
    Alert,
    Box,
    Button,
    Card,
    CircularProgress,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SeletorSemana from "../../SeletorSemana/SeletorSemana";
import { resumirCardapio } from "../../../services/gerenciamentoCardapioService";
import styles from "./listaCardapios.module.css";

function formatarData(iso) {
    const [ano, mes, dia] = iso.split("-").map(Number);
    return new Intl.DateTimeFormat("pt-BR").format(new Date(ano, mes - 1, dia));
}

export default function ListaCardapios({
    cardapios,
    intervaloSelecionado,
    onSelectRange,
    onPreviousRange,
    onNextRange,
    onEdit,
    onView,
    semanaValida,
    feedbackGeracao,
    gerandoSemana,
    controlesDesabilitados,
    onGenerateWeek,
}) {
    const renderizarDia = (cardapio) => (
        <Box component="li" className={styles.row} key={cardapio.dia}>
            <Box className={styles.day}>
                <Typography className={styles.dayName}>{cardapio.nome}</Typography>
                <Typography className={styles.dayDate}>{formatarData(cardapio.dia)}</Typography>
            </Box>
            <Typography className={`${styles.summary} ${!cardapio.refeicao ? styles.pending : ""}`}>
                {cardapio.refeicao ? resumirCardapio(cardapio.refeicao) : "Pendente"}
            </Typography>
            <Stack direction="row" className={styles.actions}>
                <IconButton
                    className={styles.actionButton}
                    aria-label={`Editar cardápio de ${cardapio.nome}`}
                    onClick={() => onEdit(cardapio.dia)}
                >
                    <EditOutlinedIcon />
                </IconButton>
                <IconButton
                    className={styles.actionButton}
                    aria-label={`Visualizar cardápio de ${cardapio.nome}`}
                    onClick={() => cardapio.refeicao && onView(cardapio)}
                >
                    <VisibilityOutlinedIcon />
                </IconButton>
            </Stack>
        </Box>
    );

    return (
        <Card component="section" aria-busy={gerandoSemana} variant="outlined" className={styles.card}>
            <Box className={styles.header}>
                <Typography component="h1" variant="h5" className={styles.title}>Cardápios</Typography>
                <Stack className={styles.headerControls}>
                    <SeletorSemana
                        intervaloSelecionado={intervaloSelecionado}
                        onSelectRange={onSelectRange}
                        onPreviousRange={onPreviousRange}
                        onNextRange={onNextRange}
                        disabled={controlesDesabilitados}
                    />
                    <Button
                        variant="contained"
                        startIcon={gerandoSemana ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
                        onClick={onGenerateWeek}
                        disabled={!semanaValida || gerandoSemana}
                        sx={{ textTransform: "none", alignSelf: "flex-end" }}
                    >
                        {gerandoSemana ? "Gerando e salvando..." : "Gerar cardápio da semana"}
                    </Button>
                </Stack>
            </Box>
            {!semanaValida && (
                <Alert severity="info" className={styles.feedback}>
                    Selecione um período completo de segunda a domingo para gerar uma semana.
                </Alert>
            )}
            {feedbackGeracao && (
                <Alert severity={feedbackGeracao.severity} className={styles.feedback}>
                    {feedbackGeracao.message}
                </Alert>
            )}
            <Stack component="ul" className={styles.list}>
                {cardapios.length > 0 ? cardapios.map(renderizarDia) : (
                    <Typography component="li" className={styles.empty}>
                        {intervaloSelecionado?.from && !intervaloSelecionado?.to
                            ? "Selecione a data final do período."
                            : "Nenhum cardápio encontrado neste período."}
                    </Typography>
                )}
            </Stack>
        </Card>
    );
}
