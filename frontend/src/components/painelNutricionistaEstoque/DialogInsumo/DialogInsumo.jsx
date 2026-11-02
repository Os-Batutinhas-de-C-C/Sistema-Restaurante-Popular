import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";
import { statusEstoque } from "../../../services/estoqueService";
import SeletorDataEstoque from "../SeletorDataEstoque/SeletorDataEstoque";

const emptyValues = {
    nome: "",
    quantidade: "",
    unidade: "",
    lote: "",
    dataEntrega: "",
    dataValidade: "",
    observacao: "",
    status: "No prazo",
};

export default function DialogInsumo({ open, item, onClose, onSave }) {
    const [values, setValues] = useState(() => item ? { ...item } : { ...emptyValues });

    const handleChange = (field) => (event) => {
        setValues((current) => ({ ...current, [field]: event.target.value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        onSave(values);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="dialog-insumo-title">
            <DialogTitle id="dialog-insumo-title" sx={{ px: { xs: 2.5, sm: 4 }, pt: 3, fontSize: "1.35rem", fontWeight: 700 }}>
                Insumo
            </DialogTitle>
            <DialogContent sx={{ px: { xs: 2.5, sm: 4 }, pt: "12px !important" }}>
                <Stack component="form" id="form-insumo" spacing={2} onSubmit={handleSubmit}>
                    <TextField label="Nome do insumo" value={values.nome} onChange={handleChange("nome")} required fullWidth />
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField label="Quantidade" type="number" value={values.quantidade} onChange={handleChange("quantidade")} required fullWidth slotProps={{ htmlInput: { min: 0, step: "any" } }} />
                        <TextField label="Unidade" value={values.unidade} onChange={handleChange("unidade")} required fullWidth />
                    </Stack>
                    <TextField label="Lote" value={values.lote} onChange={handleChange("lote")} required fullWidth />
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <SeletorDataEstoque label="Data de entrega" value={values.dataEntrega} onChange={(value) => setValues((current) => ({ ...current, dataEntrega: value }))} />
                        <SeletorDataEstoque label="Data de validade" value={values.dataValidade} onChange={(value) => setValues((current) => ({ ...current, dataValidade: value }))} />
                    </Stack>
                    <TextField label="Observações" value={values.observacao} onChange={handleChange("observacao")} multiline minRows={2} fullWidth />
                    <TextField select label="Status" value={values.status} onChange={handleChange("status")} fullWidth>
                        {statusEstoque.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                    </TextField>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: { xs: 2, sm: 4 }, pb: 3, pt: 2, gap: 1 }}>
                <Button onClick={onClose}>Cancelar</Button>
                <Button type="submit" form="form-insumo" variant="contained">Confirmar</Button>
            </DialogActions>
        </Dialog>
    );
}
