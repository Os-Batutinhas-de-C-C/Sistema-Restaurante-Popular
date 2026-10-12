import {
    Box,
    Button,
    Card,
    CardContent,
    Stack,
    Typography,
} from "@mui/material";
import styles from "./cardapioHoje.module.css";

// Define a ordem, o campo de origem e a cor de cada item do cardápio.
const menuFields = [
    ["PRATO PROTEICO", "pratoProteico", "#A5243D"],
    ["OPÇÃO PROTEICA", "opcaoProteica", "#A5243D"],
    ["ACOMPANHAMENTO 1", "acompanhamento1", "#0288D1"],
    ["ACOMPANHAMENTO 2", "acompanhamento2", "#0288D1"],
    ["GUARNIÇÃO", "guarnicao", "#0288D1"],
    ["SALADA DO DIA", "saladaDoDia", "#0288D1"],
    ["SOBREMESA", "sobremesa", "#0288D1"],
    ["SUCO NATURAL", "sucoNatural", "#0288D1"],
];

/**
 * Cardápio do dia.
 *
 * Recebe o cardápio por props e não conhece a origem dos dados, facilitando
 * a substituição do mock por uma resposta da API.
 */
export default function CardapioHoje({ dadosDashboard }) {
    // O fallback permite renderizar o card mesmo durante carregamentos parciais.
    const cardapio = dadosDashboard?.cardapio || {};

    return (
        <Card
            className={styles.card}
        >
            {/* A ação de edição fica pronta para receber um callback futuro. */}
            <CardContent className={styles.content}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    className={styles.header}
                >
                    <Typography variant="h6" className={styles.title}>
                        Cardápio de Hoje
                    </Typography>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={
                            <Box
                                component="img"
                                src="/icons/action-edit.svg"
                                alt=""
                                className={styles.editIcon}
                            />
                        }
                        className={styles.editButton}
                    >
                        Editar Cardápio
                    </Button>
                </Stack>
                <Stack spacing={1.5} className={styles.items}>
                    <Box className={styles.itemGrid}>
                        {/* A grade é gerada a partir da configuração acima. */}
                        {menuFields.map(([category, field, color]) => (
                            <Stack
                                key={field}
                                spacing={0.25}
                                className={styles.item}
                            >
                                <Typography
                                    variant="caption"
                                    className={styles.category}
                                    sx={{ color }}
                                >
                                    {category}
                                </Typography>
                                <Typography variant="body2" className={styles.meal}>
                                    {cardapio[field] || "Sem informação"}
                                </Typography>
                            </Stack>
                        ))}
                    </Box>
                    <Box
                        className={styles.calories}
                    >
                        <Typography variant="caption" className={styles.caloriesLabel}>
                            Valor Calórico Estimado:
                        </Typography>
                        <Typography variant="caption" className={styles.caloriesValue}>
                            {cardapio.valorCaloricoEstimado || "Sem informação"}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}
