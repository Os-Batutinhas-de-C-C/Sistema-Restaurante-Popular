"use client";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useRef } from "react";

const FORM_ID = "recovery-form";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PasswordRecoveryDialog({ auth }) {
    const emailIsValid = EMAIL_PATTERN.test(auth.recoveryEmail.trim());
    const emailInputRef = useRef(null);

    useEffect(() => {
        if (auth.recoveryOpen) emailInputRef.current?.focus();
    }, [auth.recoveryOpen]);

    return (
        <Dialog open={auth.recoveryOpen} onClose={auth.closeRecovery} fullWidth maxWidth="xs" aria-labelledby="recovery-title">
            <DialogTitle id="recovery-title">Recuperação de Acesso</DialogTitle>
            <DialogContent>
                <Stack component="form" id={FORM_ID} onSubmit={auth.submitRecovery} noValidate spacing={2} sx={{ pt: 0, pb: 1, width: "100%" }}>
                    <Typography color="text.secondary" variant="body2">Informe o seu E-mail de recuperação.</Typography>
                    <TextField
                        required
                        fullWidth
                        placeholder="E-mail de Recuperação"
                        type="email"
                        value={auth.recoveryEmail}
                        inputRef={emailInputRef}
                        onChange={(event) => auth.setRecoveryEmail(event.target.value)}
                        slotProps={{ htmlInput: { "aria-label": "E-mail de Recuperação" } }}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button type="button" onClick={auth.closeRecovery} sx={{ minHeight: 44 }}>CANCELAR</Button>
                <Button type="submit" form={FORM_ID} variant="contained" disabled={!emailIsValid} sx={{ minHeight: 44 }}>ENVIAR LINK</Button>
            </DialogActions>
        </Dialog>
    );
}
