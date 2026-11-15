"use client";

import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import styles from "./acoesRapidas.module.css";

// Configuração visual e destinos das ações rápidas do dashboard.
const actions = [
    {
        label: "Publicar Nova Notícia",
        color: "#A5243D",
        icon: "/icons/action-news.svg",
        path: "/painel-nutricionista-noticias",
    },
    {
        label: "Registrar Desperdício do Dia",
        color: "#4A0D67",
        icon: "/icons/calendar.svg",
    },
    {
        label: "Atualizar Estoque",
        color: "#0288D1",
        icon: "/icons/action-stock.svg",
        path: "/painel-nutricionista-estoque",
    },
];

/**
 * Card de ações rápidas do dashboard.
 *
 * Mantém a apresentação dos botões independente das regras da página pai.
 */
export default function AcoesRapidas({ onWasteClick }) {
    const router = useRouter();

    return (
        <Card
            className={styles.card}
        >
            <CardContent className={styles.content}>
                <Typography
                    variant="h6"
                    className={styles.title}
                >
                    Ações Rápidas
                </Typography>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    className={styles.actions}
                    sx={{ justifyContent: "center" }}
                >
                    {/* O layout muda para coluna em telas pequenas. */}
                    {actions.map((action) => (
                        <Button
                            key={action.label}
                            variant="contained"
                            startIcon={
                                <Box
                                    component="img"
                                    src={action.icon}
                                    alt=""
                                    className={styles.buttonIcon}
                                />
                            }
                            onClick={
                                action.path
                                    ? () => router.push(action.path)
                                    : onWasteClick
                            }
                            className={styles.button}
                            sx={{ backgroundColor: action.color, "&:hover": { backgroundColor: action.color } }}
                        >
                            {action.label}
                        </Button>
                    ))}
                </Stack>
            </CardContent>
        </Card>
    );
}
