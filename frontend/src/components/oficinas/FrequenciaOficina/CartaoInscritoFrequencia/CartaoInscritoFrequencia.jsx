import { Box, Checkbox, FormControlLabel, Paper, Stack, Typography } from "@mui/material";
import { formatarCpf, formatarDataOficina } from "../../../../services/oficinasService";

export default function CartaoInscritoFrequencia({ inscrito, disabled, onChange }) {
    return (
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
                <Box sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
                    <Typography><strong>CPF:</strong> {formatarCpf(inscrito.cpf)}</Typography>
                    <Typography><strong>Data de nascimento:</strong> {formatarDataOficina(inscrito.dataNascimento)}</Typography>
                    <Typography><strong>E-mail:</strong> {inscrito.email || "Não informado"}</Typography>
                </Box>
                <FormControlLabel control={<Checkbox checked={inscrito.presente} disabled={disabled}
                    onChange={(event) => onChange(inscrito.id, event.target.checked)} />}
                label="Presente" />
            </Stack>
        </Paper>
    );
}
