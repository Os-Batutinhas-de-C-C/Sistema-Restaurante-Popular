import { ContentCopy, AutoAwesome } from "@mui/icons-material";
import { Box, Button, Card, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { camposCardapio } from "../../../services/gerenciamentoCardapioService";
import styles from "./formularioCardapio.module.css";

export default function FormularioCardapio({ dia, data, valores, onChange, onSave, onOpenHistory, saving }) {
    const dataFormatada = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(`${data}T12:00:00`));
    const diaFormatado = dia.charAt(0).toUpperCase() + dia.slice(1);
    return (
        <Card component="section" aria-labelledby="formulario-cardapio-titulo" variant="outlined" className={styles.card}>
            <Stack className={styles.cardHeader} direction={{ xs: "column", md: "row" }}>
                <Box className={styles.headingCopy}>
                    <Typography id="formulario-cardapio-titulo" component="h2" variant="h6" className={styles.title}>
                        Cardápio: {diaFormatado}, {dataFormatada}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Defina a composição nutricional para o almoço.</Typography>
                </Box>
                <Stack direction={{ xs: "column", md: "row" }} className={styles.actions}>
                    <Button variant="contained" size="small" startIcon={<AutoAwesome />} onClick={() => {}} sx={{ textTransform: "none" }}>
                        Gerar Cardápio
                    </Button>
                    <Button variant="contained" size="small" startIcon={<ContentCopy />} onClick={onOpenHistory} sx={{ textTransform: "none" }}>
                        Copiar Do Histórico
                    </Button>
                </Stack>
            </Stack>
            <Box component="form" onSubmit={onSave} className={styles.form}>
                <Grid container columnSpacing={{ xs: 0, sm: 2.5 }} rowSpacing={{ xs: 2, sm: 3 }}>
                    {camposCardapio.map(({ key, label }) => (
                        <Grid key={key} size={{ xs: 12, sm: 6 }}>
                            <TextField
                                name={key}
                                label={label}
                                value={valores[key] ?? ""}
                                onChange={(event) => onChange(key, event.target.value)}
                                variant="standard"
                                fullWidth
                                size="small"
                                type={key === "valorCalorico" ? "number" : "text"}
                                slotProps={{ inputLabel: { shrink: true }, ...(key === "valorCalorico" ? { htmlInput: { min: 0, step: 1 } } : {}) }}
                            />
                        </Grid>
                    ))}
                </Grid>
                <Button type="submit" variant="contained" color="success" size="large" fullWidth disabled={saving} className={styles.saveButton}>
                    {saving ? <><CircularProgress size={18} color="inherit" /> Salvando...</> : "Salvar Cardápio"}
                </Button>
            </Box>
        </Card>
    );
}
