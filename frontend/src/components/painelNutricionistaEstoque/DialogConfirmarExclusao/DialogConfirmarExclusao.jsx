import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

export default function DialogConfirmarExclusao({ item, onClose, onConfirm }) {
    return (
        <Dialog open={Boolean(item)} onClose={onClose} maxWidth="xs" fullWidth aria-labelledby="confirmar-exclusao-title">
            <DialogTitle id="confirmar-exclusao-title">Excluir insumo</DialogTitle>
            <DialogContent>
                <Typography>Deseja excluir <strong>{item?.nome}</strong> do estoque? Esta ação remove o item da lista.</Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                <Button onClick={onClose}>Cancelar</Button>
                <Button color="error" variant="contained" onClick={onConfirm}>Excluir</Button>
            </DialogActions>
        </Dialog>
    );
}
