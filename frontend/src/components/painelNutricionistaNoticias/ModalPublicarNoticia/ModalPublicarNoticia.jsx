"use client";

import AddIcon from "@mui/icons-material/Add";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { useState } from "react";

const FORMULARIO_INICIAL = { titulo: "", texto: "", duracaoHoras: "12" };

export default function ModalPublicarNoticia({ open, onClose, onPublicar }) {
    const [form, setForm] = useState(FORMULARIO_INICIAL);
    const [erros, setErros] = useState({});

    const fechar = () => {
        setForm(FORMULARIO_INICIAL);
        setErros({});
        onClose();
    };


    const atualizar = (campo) => (event) => {
        setForm((atual) => ({ ...atual, [campo]: event.target.value }));
        setErros((atual) => ({ ...atual, [campo]: "" }));
    };

    const validar = () => {
        const duracao = Number(form.duracaoHoras);
        const novosErros = {};
        if (!form.titulo.trim()) novosErros.titulo = "O título do aviso é obrigatório.";
        if (!form.texto.trim()) novosErros.texto = "O texto do aviso é obrigatório.";
        if (!Number.isInteger(duracao) || duracao < 1 || duracao > 72) {
            novosErros.duracaoHoras = "Informe um número inteiro entre 1 e 72 horas.";
        }
        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const enviar = (event) => {
        event.preventDefault();
        if (!validar()) return;
        const publicado = onPublicar({ ...form, duracaoHoras: Number(form.duracaoHoras) });
        if (publicado) {
            setForm(FORMULARIO_INICIAL);
            setErros({});
        }
    };

    const duracaoValida = Number.isInteger(Number(form.duracaoHoras))
        && Number(form.duracaoHoras) >= 1
        && Number(form.duracaoHoras) <= 72;

    return (
        <Dialog open={open} onClose={fechar} fullWidth maxWidth="sm" aria-labelledby="dialog-publicar-noticia">
            <DialogTitle id="dialog-publicar-noticia">Nova notícia</DialogTitle>
            <DialogContent>
                <Stack component="form" id="form-publicar-noticia" onSubmit={enviar} spacing={2} sx={{ pt: 1 }}>
                    <TextField
                        autoFocus
                        label="Título do aviso"
                        fullWidth
                        value={form.titulo}
                        onChange={atualizar("titulo")}
                        error={Boolean(erros.titulo)}
                        helperText={erros.titulo || (form.titulo.length + "/120")}
                        slotProps={{ htmlInput: { maxLength: 120 } }}
                    />
                    <TextField
                        label="Texto do aviso"
                        fullWidth
                        multiline
                        minRows={3}
                        value={form.texto}
                        onChange={atualizar("texto")}
                        error={Boolean(erros.texto)}
                        helperText={erros.texto || (form.texto.length + "/500")}
                        slotProps={{ htmlInput: { maxLength: 500 } }}
                    />
                    <TextField
                        label="Duração (horas)"
                        type="number"
                        fullWidth
                        value={form.duracaoHoras}
                        onChange={atualizar("duracaoHoras")}
                        error={Boolean(erros.duracaoHoras)}
                        helperText={erros.duracaoHoras}
                        slotProps={{ htmlInput: { min: 1, max: 72, step: 1, inputMode: "numeric" } }}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={fechar}>Cancelar</Button>
                <Button
                    form="form-publicar-noticia"
                    type="submit"
                    variant="contained"
                    startIcon={<AddIcon />}
                    disabled={!form.titulo.trim() || !form.texto.trim() || !duracaoValida}
                    sx={{ bgcolor: "#008fd3", "&:hover": { bgcolor: "#007fbc" } }}
                >
                    Publicar notícia
                </Button>
            </DialogActions>
        </Dialog>
    );
}
