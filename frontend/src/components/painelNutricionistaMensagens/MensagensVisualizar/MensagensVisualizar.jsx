import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Paper,
    Stack,
    Typography,
} from "@mui/material";

export default function MensagensVisualizar({ mensagem, onClose }) {
    return (
        <Dialog
            open={Boolean(mensagem)}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            aria-labelledby="mensagem-visualizar-titulo"
            slotProps={{
                paper: {
                    sx: {
                        maxWidth: 395,
                        borderRadius: 2,
                    },
                },
            }}
        >
            {mensagem && (
                <>
                    <DialogTitle id="mensagem-visualizar-titulo" sx={{ px: 2, pt: 2, pb: 1 }}>
                        <Typography component="span" variant="subtitle2" fontWeight={700}>
                            {mensagem.titulo}
                        </Typography>
                    </DialogTitle>
                    <DialogContent sx={{ px: 2, pt: "0 !important", pb: 2 }}>
                        <Stack
                            direction="row"
                            spacing={1.5}
                            divider={<Divider orientation="vertical" flexItem />}
                            sx={{ mb: 2, alignItems: "center" }}
                        >
                            <Typography variant="caption" color="text.secondary">{mensagem.dataExibicao}</Typography>
                            <Typography variant="caption" color="text.secondary">{mensagem.hora}</Typography>
                        </Stack>
                        <Paper
                            variant="outlined"
                            sx={{
                                minHeight: 69,
                                p: 1.5,
                                borderColor: "#e3e8ed",
                                borderRadius: 1.5,
                                bgcolor: "#f7f9fb",
                            }}
                        >
                            <Typography variant="caption" sx={{ lineHeight: 1.75, color: "text.primary" }}>
                                {mensagem.descricao}
                            </Typography>
                        </Paper>
                    </DialogContent>
                    <Divider />
                    <DialogActions sx={{ px: 2, py: 1.25 }}>
                        <Button onClick={onClose} size="small">Fechar</Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
}
