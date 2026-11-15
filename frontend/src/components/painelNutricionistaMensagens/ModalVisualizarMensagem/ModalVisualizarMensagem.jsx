"use client";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Paper, Stack, Typography } from "@mui/material";
import { formatarData } from "../../../utils/painelFormatadores";

function obterNome(mensagem) {
    return mensagem?.nome && mensagem.nome.trim() ? mensagem.nome.trim() : "Não informado";
}

export default function ModalVisualizarMensagem({ mensagem, onClose }) {
    return (
        <Dialog open={Boolean(mensagem)} onClose={onClose} fullWidth maxWidth="md" aria-labelledby="dialog-visualizar-mensagem">
            <DialogTitle id="dialog-visualizar-mensagem">Visualizar mensagem</DialogTitle>
            <DialogContent>
                {mensagem && (
                    <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                            <Typography component="time" variant="body2" color="text.secondary">
                                {formatarData(mensagem.data)}
                            </Typography>
                            <Divider orientation="vertical" flexItem />
                            <Typography component="time" variant="body2" color="text.secondary">{mensagem.hora}</Typography>
                        </Stack>
                        <Typography variant="h6" fontWeight={700}>{mensagem.titulo}</Typography>
                        <Typography variant="body2" color="text.secondary">Remetente: {obterNome(mensagem)}</Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f7f9fb", borderColor: "#e4e8eb", borderRadius: 2 }}>
                            <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", lineHeight: 1.7 }}>
                                {mensagem.texto}
                            </Typography>
                        </Paper>
                    </Stack>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button variant="contained" onClick={onClose} sx={{ bgcolor: "#008fd3" }}>Fechar</Button>
            </DialogActions>
        </Dialog>
    );
}
