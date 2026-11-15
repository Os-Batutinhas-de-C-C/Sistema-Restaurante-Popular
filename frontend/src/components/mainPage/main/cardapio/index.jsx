"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert, Skeleton, Stack } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import { dataDeIsoLocal, dataIsoLocal, listarCardapiosPublicosApi, obterSegundaIso } from "../../../../services/cardapiosApiService";
import "./style.css";

const DIAS = [
    { sigla: "SEG", nome: "Segunda-feira" },
    { sigla: "TER", nome: "Terça-feira" },
    { sigla: "QUA", nome: "Quarta-feira" },
    { sigla: "QUI", nome: "Quinta-feira" },
    { sigla: "SEX", nome: "Sexta-feira" },
];

function montarItens(refeicao) {
    if (!refeicao) return [];
    return [
        { label: "Prato proteico", nome: refeicao.proteina },
        { label: "Opção proteica", nome: refeicao.opcaoProteica, tag: "Opção Proteica" },
        { label: "Acompanhamento 1", nome: refeicao.acompanhamento1 },
        { label: "Acompanhamento 2", nome: refeicao.acompanhamento2 },
        { label: "Guarnição", nome: refeicao.guarnicao },
        { label: "Salada do dia", nome: refeicao.saladaDoDia },
        { label: "Sobremesa", nome: refeicao.sobremesa },
        { label: "Bebida", nome: refeicao.suco },
    ].filter(({ nome }) => String(nome ?? "").trim());
}

export default function Cardapio() {
    const [semana, setSemana] = useState(null);
    const [selecionado, setSelecionado] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const segundaAtual = useMemo(() => obterSegundaIso(new Date()), []);

    useEffect(() => {
        let ativo = true;
        listarCardapiosPublicosApi()
            .then((semanas) => {
                if (ativo) setSemana(semanas.find((item) => item.data === segundaAtual) ?? null);
            })
            .catch((erro) => {
                if (ativo) setError(erro?.message || "Não foi possível carregar o cardápio.");
            })
            .finally(() => { if (ativo) setLoading(false); });
        return () => { ativo = false; };
    }, [segundaAtual]);

    const dias = useMemo(() => {
        if (!semana) return [];
        const monday = dataDeIsoLocal(semana.data);
        return DIAS.map((dia, index) => {
            const date = new Date(monday);
            date.setDate(date.getDate() + index);
            return { ...dia, data: dataIsoLocal(date), num: date.getDate() };
        });
    }, [semana]);

    if (loading) {
        return <Stack className="cardapio" spacing={1}><Skeleton variant="rounded" height={96} /><Skeleton variant="rounded" height={280} /></Stack>;
    }
    if (error) return <Alert severity="error" className="cardapio">{error}</Alert>;
    if (!semana) return <Alert severity="info" className="cardapio">O cardápio desta semana ainda não foi publicado.</Alert>;

    const dia = dias[selecionado];
    const refeicao = semana.cardapio[selecionado];
    const itens = montarItens(refeicao);

    return (
        <section className="cardapio">
            <div className="cardapioCard">
                <div className="cardapioHeader">
                    <p className="cardapioTag"><span className="cardapioDot" /> CARDÁPIO DA SEMANA</p>
                    <span className="cardapioBadge">
                        <EventNoteOutlinedIcon sx={{ fontSize: 16 }} /> Semana Atual
                    </span>
                    <p className="cardapioSub">Refeição balanceada elaborada e supervisionada por equipe nutricional técnica</p>
                </div>

                <div className="cardapioDias" role="tablist">
                    {dias.map((item, index) => (
                        <button
                            key={item.data}
                            role="tab"
                            aria-selected={index === selecionado}
                            className={"cardapioDia " + (index === selecionado ? "ativo" : "")}
                            onClick={() => setSelecionado(index)}
                        >
                            <span className="diaSigla">{item.sigla}</span>
                            <span className="diaNum">{item.num}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="cardapioPainel">
                <div className="painelTopo">
                    <p className="painelTag">{dia.nome.toUpperCase()} • ALMOÇO COMPLETO</p>
                    <h2 className="painelTitulo">Almoço</h2>
                </div>

                {refeicao && itens.length ? (
                    <>
                        <ul className="painelLista">
                            {itens.map((item) => (
                                <li key={item.label} className="painelItem">
                                    <div>
                                        <p className="itemLabel">{item.label}</p>
                                        <p className="itemNome">{item.nome}</p>
                                    </div>
                                    {item.tag && <span className="itemTag">{item.tag}</span>}
                                </li>
                            ))}
                        </ul>
                        <div className="painelRodape">
                            <span className="rodapeAviso">
                                <InfoOutlinedIcon sx={{ fontSize: "0.9rem" }} />
                                Cardápio sujeito a alterações conforme disponibilidade de insumos.
                            </span>
                            {refeicao.calorias != null && <span className="rodapeKcal">Estimativa: ~ {refeicao.calorias} kcal</span>}
                        </div>
                    </>
                ) : (
                    <Alert severity="info">O cardápio deste dia ainda não foi definido.</Alert>
                )}
            </div>
        </section>
    );
}
