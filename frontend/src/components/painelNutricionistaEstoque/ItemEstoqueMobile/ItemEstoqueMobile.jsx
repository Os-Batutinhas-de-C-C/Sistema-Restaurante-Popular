import { BackspaceOutlined, EditOutlined } from "@mui/icons-material";
import { Box, Chip, Divider, IconButton, Paper, Typography } from "@mui/material";
import { formatarDataEstoque, formatarQuantidade } from "../../../services/estoqueService";
import styles from "./itemEstoqueMobile.module.css";

const chipColor = {
    "No prazo": "success",
    "Vence em breve": "warning",
    Vencido: "error",
};

function Campo({ label, children }) {
    return (
        <Box className={styles.field}>
            <Typography variant="caption" className={styles.label}>{label}</Typography>
            <Box className={styles.value}>{children}</Box>
        </Box>
    );
}

export default function ItemEstoqueMobile({ item, onEdit, onDelete }) {
    return (
        <Paper variant="outlined" className={styles.card}>
            <Campo label="Insumo e Lote">
                <Typography variant="body2" className={styles.name}>{item.nome}</Typography>
                <Typography variant="caption" color="text.secondary">Lote {item.lote}</Typography>
            </Campo>
            <Divider className={styles.divider} />
            <Box className={styles.summary}>
                <Campo label="Estoque Atual">
                    <Typography variant="body2" className={styles.quantity}>{formatarQuantidade(item.quantidade)} {item.unidade}</Typography>
                </Campo>
                <Campo label="Status">
                    <Chip size="small" label={item.status} color={chipColor[item.status] ?? "default"} className={styles.status} />
                </Campo>
                <Box className={styles.observation}>
                    <Campo label="Observação">
                        <Typography variant="body2" className={styles.observationText}>{item.observacao || "—"}</Typography>
                    </Campo>
                </Box>
            </Box>
            <Divider className={styles.divider} />
            <Box className={styles.footer}>
                <Campo label="Datas">
                    <Typography variant="body2" className={styles.date}>Entrega: {formatarDataEstoque(item.dataEntrega)}</Typography>
                    <Typography variant="body2" className={styles.date}>Validade: {formatarDataEstoque(item.dataValidade)}</Typography>
                </Campo>
                <Box className={styles.actions}>
                    <IconButton aria-label={`Editar ${item.nome}`} onClick={() => onEdit(item)} sx={{ width: 48, height: 48, bgcolor: "primary.main", color: "common.white", "&:hover": { bgcolor: "primary.dark" } }}>
                        <EditOutlined />
                    </IconButton>
                    <IconButton aria-label={`Excluir ${item.nome}`} onClick={() => onDelete(item)} sx={{ width: 48, height: 48, bgcolor: "primary.main", color: "common.white", "&:hover": { bgcolor: "primary.dark" } }}>
                        <BackspaceOutlined />
                    </IconButton>
                </Box>
            </Box>
        </Paper>
    );
}
