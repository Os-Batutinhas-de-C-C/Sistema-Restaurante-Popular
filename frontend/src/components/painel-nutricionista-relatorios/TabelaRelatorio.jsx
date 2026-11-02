import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Box, Card, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import styles from "./painelNutricionistaRelatorios.module.css";

function BotaoEditar({ relatorio, onEditar, mobile = false }) {
    if (!relatorio.editavel) return null;
    return <IconButton aria-label={`Editar relatório de ${relatorio.dia}`} onClick={() => onEditar(relatorio)} className={`${styles.editButton} ${mobile ? styles.mobileEditButton : ""}`}><EditOutlinedIcon fontSize="small" /></IconButton>;
}

export default function TabelaRelatorio({ relatorios, onEditar }) {
    return (
        <Card component="section" aria-label="Relatório semanal" variant="outlined" className={styles.tableCard}>
            <TableContainer className={styles.desktopTable}>
                <Table size="small" aria-label="Relatório semanal" className={styles.table}>
                    <TableHead><TableRow>
                        <TableCell scope="col">Dia</TableCell><TableCell scope="col">Cardápio</TableCell>
                        <TableCell align="center" scope="col">Fichas</TableCell><TableCell align="center" scope="col">Desperdício (kg)</TableCell><TableCell scope="col"><span className={styles.visuallyHidden}>Ações</span></TableCell>
                    </TableRow></TableHead>
                    <TableBody>{relatorios.map((r) => (
                        <TableRow key={r.id}>
                            <TableCell className={styles.dayCell}><Typography className={styles.dayName}>{r.dia}</Typography><Typography className={styles.date}>{r.dataFormatada}</Typography></TableCell>
                            <TableCell className={styles.mealCell}><Typography noWrap className={styles.meal} title={r.refeicao}>{r.refeicao}</Typography></TableCell>
                            <TableCell align="center" className={styles.metric}>{r.fichas ?? "-"}</TableCell><TableCell align="center" className={styles.metric}>{r.desperdicioKg ?? "-"}</TableCell>
                            <TableCell align="right" className={styles.editCell}><BotaoEditar relatorio={r} onEditar={onEditar} /></TableCell>
                        </TableRow>
                    ))}</TableBody>
                </Table>
            </TableContainer>
            <Stack component="ul" aria-label="Relatório semanal por dia" className={styles.mobileList}>
                {relatorios.map((r) => <Card component="li" variant="outlined" key={r.id} className={styles.mobileDay}>
                    <Stack component="header" direction="row" alignItems="center" justifyContent="space-between" className={styles.mobileDayHeader}>
                        <Box className={styles.mobileDayHeading}><Typography className={styles.dayName}>{r.dia}</Typography><Typography className={styles.date}>{r.dataFormatada}</Typography></Box>
                        <BotaoEditar relatorio={r} onEditar={onEditar} mobile />
                    </Stack>
                    <Box><Typography className={styles.mobileLabel}>Descrição Cardápio</Typography><Typography className={styles.mobileMeal}>{r.refeicao}</Typography></Box>
                    <Stack direction="row" spacing={2}><Box sx={{ flex: 1 }}><Typography className={styles.mobileLabel}>Fichas</Typography><Typography className={styles.mobileValue}>{r.fichas ?? "-"}</Typography></Box><Box sx={{ flex: 1 }}><Typography className={styles.mobileLabel}>Desperdício (kg)</Typography><Typography className={styles.mobileValue}>{r.desperdicioKg ?? "-"}</Typography></Box></Stack>
                </Card>)}
            </Stack>
        </Card>
    );
}
