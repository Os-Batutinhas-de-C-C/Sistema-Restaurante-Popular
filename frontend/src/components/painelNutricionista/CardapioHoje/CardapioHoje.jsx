"use client";

import {
    Box,
    Button,
    Card,
    CardContent,
    Stack,
    Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import styles from "./cardapioHoje.module.css";

// Define a ordem, o campo de origem e a cor de cada item do cardápio.
const menuFields = [
    ["PRATO PROTEICO", "pratoProteico", "#1976D2"],
    ["OPÇÃO PROTEICA", "opcaoProteica", "#1976D2"],
    ["ACOMPANHAMENTO 1", "acompanhamento1", "#1976D2"],
    ["ACOMPANHAMENTO 2", "acompanhamento2", "#1976D2"],
    ["GUARNIÇÃO", "guarnicao", "#1976D2"],
    ["SALADA DO DIA", "saladaDoDia", "#1976D2"],
    ["SOBREMESA", "sobremesa", "#1976D2"],
    ["SUCO NATURAL", "sucoNatural", "#1976D2"],
];

/**
 * Cardápio do dia.
 *
 * Recebe os dados do cardápio diário já convertidos pelo serviço da API.
 */
export default function CardapioHoje({ dadosDashboard }) {
    const router = useRouter();
    // O fallback permite renderizar o card mesmo durante carregamentos parciais.
    const cardapio = dadosDashboard?.cardapio || {};

    return (
        <Card
            className={styles.card}
        >
            <CardContent className={styles.content}>
                <Stack
                    direction="row"
                    className={styles.header}
                    sx={{ justifyContent: "space-between", alignItems: "center" }}
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
                        onClick={() => router.push(dadosDashboard.dataIso ? `/painel-nutricionista-cardapio/gerenciar/${dadosDashboard.dataIso}` : "/painel-nutricionista-cardapio")}
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
                            {cardapio.valorCalorico ? `${cardapio.valorCalorico} kcal` : "Sem informação"}
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}
