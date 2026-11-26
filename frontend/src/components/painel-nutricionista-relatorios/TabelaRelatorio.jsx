import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
    Box,
    Card,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import styles from "./painelNutricionistaRelatorios.module.css";

function obterDataAtual() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

export default function TabelaRelatorio({ relatorios, onEditar }) {
    const dataAtual = obterDataAtual();

    return (
        <Card
            component="section"
            aria-label="Detalhamento semanal"
            variant="outlined"
            className={styles.tableCard}
        >
            <Box className={styles.mobileReports}>
                {relatorios.map((relatorio) => (
                    <Box key={relatorio.id} className={styles.mobileReport}>
                        <Box className={styles.mobileReportHeader}>
                            <Box>
                                <Typography className={styles.dayName}>{relatorio.dia}</Typography>
                                <Typography className={styles.date}>{relatorio.dataFormatada}</Typography>
                            </Box>
                            {relatorio.editavel
                                && (
                                    relatorio.data === dataAtual
                                    || relatorio.fichas == null
                                    || relatorio.desperdicioKg == null
                                ) && (
                                <IconButton
                                    aria-label={`Editar dados de ${relatorio.dia}`}
                                    onClick={() => onEditar(relatorio)}
                                    className={styles.editButton}
                                >
                                    <EditOutlinedIcon />
                                </IconButton>
                            )}
                        </Box>
                        <Typography className={styles.meal}>{relatorio.refeicao}</Typography>
                        <Box className={styles.mobileMetrics}>
                            <Box className={styles.mobileMetric}>
                                <Typography className={styles.mobileMetricLabel}>Fichas</Typography>
                                <Typography className={styles.mobileMetricValue}>{relatorio.fichas ?? "—"}</Typography>
                            </Box>
                            <Box className={styles.mobileMetric}>
                                <Typography className={styles.mobileMetricLabel}>Desperdício</Typography>
                                <Typography className={styles.mobileMetricValue}>
                                    {relatorio.desperdicioKg == null ? "—" : `${relatorio.desperdicioKg} kg`}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                ))}
                {relatorios.length === 0 && (
                    <Typography className={styles.mobileEmptyState}>
                        Nenhum relatório no período selecionado.
                    </Typography>
                )}
            </Box>
            <TableContainer className={styles.tableContainer}>
                <Table
                    size="small"
                    aria-label="Detalhamento de fichas e desperdício por dia"
                    className={styles.table}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell className={styles.blankHeading} />
                            <TableCell className={styles.blankHeading} />
                            <TableCell align="center" className={styles.columnHeading}>
                                Fichas
                            </TableCell>
                            <TableCell align="center" className={styles.columnHeading}>
                                Desperdício (kg)
                            </TableCell>
                            <TableCell className={styles.blankHeading} />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {relatorios.map((relatorio) => (
                            <TableRow key={relatorio.id}>
                                <TableCell className={styles.dayCell}>
                                    <Typography className={styles.dayName}>
                                        {relatorio.dia}
                                    </Typography>
                                    <Typography className={styles.date}>
                                        {relatorio.dataFormatada}
                                    </Typography>
                                </TableCell>
                                <TableCell className={styles.mealCell}>
                                    <Typography noWrap className={styles.meal}>
                                        {relatorio.refeicao}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center" className={styles.metric}>
                                    {relatorio.fichas ?? "—"}
                                </TableCell>
                                <TableCell align="center" className={styles.metric}>
                                    {relatorio.desperdicioKg ?? "—"}
                                </TableCell>
                                <TableCell align="right" className={styles.editCell}>
                                    {relatorio.editavel
                                        && (
                                            relatorio.data === dataAtual
                                            || relatorio.fichas == null
                                            || relatorio.desperdicioKg == null
                                        ) && (
                                        <IconButton
                                            aria-label={`Editar dados de ${relatorio.dia}`}
                                            size="small"
                                            onClick={() => onEditar(relatorio)}
                                            className={styles.editButton}
                                        >
                                            <EditOutlinedIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {relatorios.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    Nenhum relatório no período selecionado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
    );
}
