"use client";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

export default function ModalRemoverMensagem({ mensagem, onClose, onConfirmar }) {
    return (
        <Dialog open={Boolean(mensagem)} onClose={onClose} aria-labelledby="dialog-remover-mensagem">
            <DialogTitle id="dialog-remover-mensagem">Apagar mensagem</DialogTitle>
            <DialogContent>
                <Typography>
                    Deseja apagar a mensagem <strong>{mensagem?.titulo}</strong>? Esta ação não pode ser desfeita.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose}>Cancelar</Button>
                <Button color="error" variant="contained" onClick={onConfirmar}>Apagar</Button>
            </DialogActions>
        </Dialog>
    );
}
