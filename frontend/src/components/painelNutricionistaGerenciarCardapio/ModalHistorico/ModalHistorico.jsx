import { useEffect, useMemo, useState } from "react";
import {
    Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControlLabel, List, ListItem, Radio, RadioGroup, Stack, TextField, Typography,
} from "@mui/material";
import { filtrarHistoricoCardapios, formatarDataCardapio, listarHistoricoCardapios, resumirCardapio } from "../../../services/gerenciamentoCardapioService";
import FiltroPeriodo from "./FiltroPeriodo/FiltroPeriodo";
import styles from "./modalHistorico.module.css";

function criarFiltrosIniciais() {
    const hoje = new Date();
    const primeiro = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimo = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    const iso = (data) => [data.getFullYear(), String(data.getMonth() + 1).padStart(2, "0"), String(data.getDate()).padStart(2, "0")].join("-");
    return { dataInicial: iso(primeiro), dataFinal: iso(ultimo), pesquisa: "" };
}

export default function ModalHistorico({ open, onClose, onSelect }) {
    const [filtros, setFiltros] = useState(criarFiltrosIniciais);
    const [filtrosAplicados, setFiltrosAplicados] = useState(criarFiltrosIniciais);
    const [historico, setHistorico] = useState([]);
    const [historicoCarregado, setHistoricoCarregado] = useState(false);
    const [error, setError] = useState("");
    const [dataSelecionada, setDataSelecionada] = useState("");
    const loading = open && !historicoCarregado;
    const resultados = useMemo(() => filtrarHistoricoCardapios(historico, filtrosAplicados), [historico, filtrosAplicados]);
    const cardapioSelecionado = resultados.find(({ data }) => data === dataSelecionada);

    useEffect(() => {
        if (!open) return undefined;
        let ativo = true;
        listarHistoricoCardapios()
            .then((itens) => { if (ativo) setHistorico(itens); })
            .catch((erro) => { if (ativo) setError(erro?.message || "Não foi possível carregar o histórico."); })
            .finally(() => { if (ativo) setHistoricoCarregado(true); });
        return () => { ativo = false; };
    }, [open]);

    const atualizarFiltro = (campo) => (event) => setFiltros((atual) => ({ ...atual, [campo]: event.target.value }));
    const pesquisar = (event) => {
        event.preventDefault();
        setFiltrosAplicados({ ...filtros });
        setDataSelecionada("");
    };

    const fechar = () => {
        setDataSelecionada("");
        setError("");
        setHistoricoCarregado(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={fechar} fullWidth maxWidth="md" aria-labelledby="historico-titulo" scroll="paper">
            <DialogTitle id="historico-titulo" className={styles.title}>
                <Stack spacing={0.75}>
                    <Typography variant="subtitle2" color="info.dark">Copiar do Histórico</Typography>
                    <Typography component="span" variant="h6">Histórico de Cardápios</Typography>
                </Stack>
            </DialogTitle>
            <DialogContent className={styles.dialogContent}>
                <Typography variant="body2" color="text.secondary" className={styles.description}>
                    Selecione um cardápio para copiar para o dia em edição.
                </Typography>
                <Typography component="h2" variant="subtitle1" className={styles.filtersTitle}>Filtros</Typography>
                <Box component="form" onSubmit={pesquisar} className={styles.filterForm}>
                    <FiltroPeriodo
                        dataInicial={filtros.dataInicial}
                        dataFinal={filtros.dataFinal}
                        onChange={({ from, to }) => setFiltros((atual) => ({ ...atual, dataInicial: from, dataFinal: to }))}
                    />
                    <TextField label="Pesquisar" placeholder="Ex.: prato principal" value={filtros.pesquisa} onChange={atualizarFiltro("pesquisa")} variant="standard" fullWidth />
                    <Button type="submit" variant="contained" className={styles.searchButton}>Pesquisar</Button>
                </Box>
                <RadioGroup aria-label="Selecione um cardápio do histórico" value={dataSelecionada} onChange={(event) => setDataSelecionada(event.target.value)}>
                    <List className={styles.results}>
                        {resultados.map((cardapio) => (
                            <ListItem key={cardapio.data} disablePadding className={`${styles.resultItem} ${dataSelecionada === cardapio.data ? styles.selected : ""}`}>
                                <FormControlLabel
                                    value={cardapio.data}
                                    control={<Radio />}
                                    className={styles.resultLabel}
                                    label={
                                        <Stack className={styles.resultContent}>
                                            <Stack direction="row" className={styles.resultHeading} sx={{ justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                                                <Typography variant="subtitle1" fontWeight={600}>{cardapio.dia}</Typography>
                                                <Typography variant="body2" color="text.secondary" className={styles.resultDate}>{formatarDataCardapio(cardapio.data)}</Typography>
                                            </Stack>
                                            <Typography variant="body2" color="text.secondary" className={styles.summary}>{resumirCardapio(cardapio)}</Typography>
                                            {dataSelecionada === cardapio.data && (
                                                <Typography variant="caption" color="primary.main">Valor Calórico Estimado (kcal): {cardapio.valorCalorico}</Typography>
                                            )}
                                        </Stack>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </RadioGroup>
                {loading && <Alert severity="info" className={styles.empty}>Carregando histórico...</Alert>}
                {error && <Alert severity="error" className={styles.empty}>{error}</Alert>}
                {!loading && !error && resultados.length === 0 && <Alert severity="info" className={styles.empty}>Nenhum cardápio encontrado com esses filtros.</Alert>}
            </DialogContent>
            <DialogActions className={styles.actions}>
                <Button onClick={fechar}>Fechar</Button>
                <Button variant="contained" disabled={!cardapioSelecionado} onClick={() => { onSelect(cardapioSelecionado); fechar(); }}>
                    Selecionar Cardápio
                </Button>
            </DialogActions>
        </Dialog>
    );
}
