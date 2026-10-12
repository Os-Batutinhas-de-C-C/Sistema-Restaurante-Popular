import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import styles from "./acoesRapidas.module.css";

// Configuração visual das ações. O callback só é acionado para a ação que
// já possui comportamento implementado nesta tela.
const actions = [
    {
        label: "Publicar Nova Notícia",
        color: "#A5243D",
        icon: "/icons/action-news.svg",
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
    },
];

/**
 * Card de ações rápidas do dashboard.
 *
 * Mantém a apresentação dos botões independente das regras da página pai.
 */
export default function AcoesRapidas({ onWasteClick }) {
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
                    justifyContent="center"
                    className={styles.actions}
                >
                    {/* O layout muda para coluna em telas pequenas. */}
                    {/* As outras ações permanecem visuais até seus fluxos serem implementados. */}
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
                                action.label === "Registrar Desperdício do Dia"
                                    ? onWasteClick
                                    : undefined
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
