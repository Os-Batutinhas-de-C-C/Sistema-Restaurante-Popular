import Link from "next/link";
import { Box, Button, Stack, Typography } from "@mui/material";
import NavbarPainel from "../NavbarPainel/NavbarPainel";
import styles from "./paginaOficinasGestor.module.css";

export default function PaginaOficinasGestor({ titulo, voltar, labelVoltar, acao, children }) {
    return (
        <Box className={styles.page}>
            <NavbarPainel variant="gestor" />
            <Stack component="main" className={styles.main} spacing={3}>
                <Stack spacing={1}>
                    <Button component={Link} href={voltar} sx={{ alignSelf: "flex-start", pl: 0 }}>{labelVoltar}</Button>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}
                        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
                        <Typography id="titulo-pagina-oficinas" component="h1" variant="h4" className={styles.title} tabIndex={-1}>{titulo}</Typography>
                        {acao}
                    </Stack>
                </Stack>
                {children}
            </Stack>
        </Box>
    );
}
