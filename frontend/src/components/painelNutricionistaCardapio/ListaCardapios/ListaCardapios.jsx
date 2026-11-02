import {
    Box,
    Card,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SeletorSemana from "../../SeletorSemana/SeletorSemana";
import styles from "./listaCardapios.module.css";

export default function ListaCardapios({
    cardapios,
    intervaloSelecionado,
    onSelectRange,
    onPreviousRange,
    onNextRange,
    onEdit,
    onView,
}) {
    return (
        <Card component="section" variant="outlined" className={styles.card}>
            <Box className={styles.header}>
                <Typography component="h1" variant="h5" className={styles.title}>Cardápios</Typography>
                <SeletorSemana
                    intervaloSelecionado={intervaloSelecionado}
                    onSelectRange={onSelectRange}
                    onPreviousRange={onPreviousRange}
                    onNextRange={onNextRange}
                />
            </Box>
            <Stack component="ul" className={styles.list}>
                {cardapios.length > 0 ? cardapios.map((cardapio) => (
                    <Box component="li" className={styles.row} key={cardapio.dia}>
                        <Box className={styles.day}>
                            <Typography className={styles.dayName}>{cardapio.nome}</Typography>
                            <Typography className={styles.dayDate}>{cardapio.data}</Typography>
                        </Box>
                        <Typography className={`${styles.summary} ${!cardapio.refeicao ? styles.pending : ""}`}>
                            {cardapio.refeicao?.resumo ?? "Pendente"}
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
                )) : (
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
