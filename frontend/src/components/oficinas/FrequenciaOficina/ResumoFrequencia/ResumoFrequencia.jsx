import { Box, Paper, Stack, Typography } from "@mui/material";

export default function ResumoFrequencia({ totais }) {
    return (
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between" }}>
                {[["Inscritos", totais.inscritos], ["Presentes", totais.presentes], ["Ausentes", totais.ausentes]].map(([label, valor]) => (
                    <Box key={label}>
                        <Typography variant="body2" color="text.secondary">{label}</Typography>
                        <Typography variant="h6">{valor}</Typography>
                    </Box>
                ))}
            </Stack>
        </Paper>
    );
}
