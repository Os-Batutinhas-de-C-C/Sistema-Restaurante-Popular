"use client";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

export default function ModalRemoverNoticia({ noticia, onClose, onConfirmar }) {
    return (
        <Dialog open={Boolean(noticia)} onClose={onClose} aria-labelledby="dialog-remover-noticia">
            <DialogTitle id="dialog-remover-noticia">Remover notícia</DialogTitle>
            <DialogContent>
                <Typography>
                    Deseja remover a notícia <strong>{noticia?.titulo}</strong>? Esta ação não pode ser desfeita.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose}>Cancelar</Button>
                <Button color="error" variant="contained" onClick={onConfirmar}>Remover</Button>
            </DialogActions>
        </Dialog>
    );
}
