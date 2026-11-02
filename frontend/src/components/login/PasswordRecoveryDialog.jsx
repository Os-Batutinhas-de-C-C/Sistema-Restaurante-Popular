"use client";

import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";

export default function PasswordRecoveryDialog({ auth }) {
    return (
        <Dialog open={auth.recoveryOpen} onClose={auth.closeRecovery} fullWidth maxWidth="xs" aria-labelledby="recovery-title">
            <form onSubmit={auth.submitRecovery}>
                <DialogTitle id="recovery-title">Recuperar senha</DialogTitle>
                <DialogContent>
                    <TextField autoFocus required fullWidth type="email" label="E-mail cadastrado" value={auth.recoveryEmail} onChange={(event) => auth.setRecoveryEmail(event.target.value)} margin="dense" />
                    {auth.recoveryError && <Alert severity="error" sx={{ mt: 2 }}>{auth.recoveryError}</Alert>}
                    {auth.recoveryMessage && <Alert severity="success" sx={{ mt: 2 }}>{auth.recoveryMessage}</Alert>}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={auth.closeRecovery}>Fechar</Button>
                    <Button type="submit" variant="contained">Enviar instruções</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
