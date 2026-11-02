import { BackspaceOutlined, EditOutlined } from "@mui/icons-material";
import { Box, Card, Chip, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import ItemEstoqueMobile from "../ItemEstoqueMobile/ItemEstoqueMobile";
import { formatarDataEstoque, formatarQuantidade } from "../../../services/estoqueService";
import styles from "./listaEstoque.module.css";

const chipColor = {
    "No prazo": "success",
    "Vence em breve": "warning",
    Vencido: "error",
};

export default function ListaEstoque({ itens, onEdit, onDelete }) {
    if (!itens.length) {
        return (
            <Card variant="outlined" className={styles.emptyState}>
                <Typography variant="body1" fontWeight={600}>Nenhum insumo encontrado</Typography>
                <Typography variant="body2" color="text.secondary">Tente outro termo de busca ou cadastre um novo insumo.</Typography>
            </Card>
        );
    }

    return (
        <Card component="section" aria-label="Lista de estoque de alimentos" variant="outlined" className={styles.listCard}>
            <Box className={styles.desktopList}>
                <Table size="small" aria-label="Estoque de alimentos" sx={{ tableLayout: "fixed", minWidth: 1140 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: "23%" }}>Insumo e Lote</TableCell>
                            <TableCell sx={{ width: "14%" }}>Estoque Atual</TableCell>
                            <TableCell sx={{ width: "19%", minWidth: 220 }}>Datas</TableCell>
                            <TableCell sx={{ width: "15%", minWidth: 160 }}>Status</TableCell>
                            <TableCell sx={{ width: "20%" }}>Observação</TableCell>
                            <TableCell sx={{ width: "9%", minWidth: 136, textAlign: "center" }} aria-label="Ações" />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {itens.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell sx={{ minWidth: 220 }}>
                                    <Typography variant="body2" fontWeight={700}>{item.nome}</Typography>
                                    <Typography variant="caption" color="text.secondary">Lote {item.lote}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={700}>{formatarQuantidade(item.quantidade)} {item.unidade}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Stack spacing={0.5}>
                                        <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>Entrega: {formatarDataEstoque(item.dataEntrega)}</Typography>
                                        <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>Validade: {formatarDataEstoque(item.dataValidade)}</Typography>
                                    </Stack>
                                </TableCell>
                                <TableCell sx={{ minWidth: 160 }}><Chip size="small" label={item.status} color={chipColor[item.status] ?? "default"} sx={{ maxWidth: "none", whiteSpace: "nowrap" }} /></TableCell>
                                <TableCell><Typography variant="caption">{item.observacao || "—"}</Typography></TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1} sx={{ width: "100%", justifyContent: "center", alignItems: "center" }}>
                                        <IconButton aria-label={`Editar ${item.nome}`} onClick={() => onEdit(item)} size="small" sx={{ width: 34, height: 34, bgcolor: "primary.main", color: "common.white", "&:hover": { bgcolor: "primary.dark" } }}><EditOutlined fontSize="small" /></IconButton>
                                        <IconButton aria-label={`Excluir ${item.nome}`} onClick={() => onDelete(item)} size="small" sx={{ width: 34, height: 34, bgcolor: "primary.main", color: "common.white", "&:hover": { bgcolor: "primary.dark" } }}><BackspaceOutlined fontSize="small" /></IconButton>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
            <Stack className={styles.mobileList} spacing={1.5}>
                {itens.map((item) => <ItemEstoqueMobile key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />)}
            </Stack>
        </Card>
    );
}
