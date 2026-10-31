import { Add } from "@mui/icons-material";
import { Button, Card, Stack, TextField } from "@mui/material";

export default function BarraAcoesEstoque({ pesquisa, onSearch, onAdd }) {
    return (
        <Card
            component="form"
            variant="outlined"
            onSubmit={(event) => event.preventDefault()}
            sx={{ p: { xs: 2, sm: 3 }, borderRadius: "10px" }}
        >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField
                    value={pesquisa}
                    onChange={(event) => onSearch(event.target.value)}
                    placeholder="Buscar insumo pelo nome..."
                    size="small"
                    fullWidth
                    slotProps={{ htmlInput: { "aria-label": "Buscar insumo pelo nome" } }}
                />
                <Button
                    type="button"
                    variant="contained"
                    startIcon={<Add />}
                    onClick={onAdd}
                    sx={{ minWidth: { sm: 204 }, minHeight: 40, whiteSpace: "nowrap" }}
                >
                    Adicionar insumo
                </Button>
            </Stack>
        </Card>
    );
}
