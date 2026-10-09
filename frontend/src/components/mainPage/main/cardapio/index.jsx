"use client";

import { useState } from "react";
import "./style.css";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";

const DIAS = [
    { sigla: "SEG", num: 21, nome: "Segunda-feira" },
    { sigla: "TER", num: 22, nome: "Terça-feira" },
    { sigla: "QUA", num: 23, nome: "Quarta-feira" },
    { sigla: "QUI", num: 24, nome: "Quinta-feira" },
    { sigla: "SEX", num: 25, nome: "Sexta-feira" },
];

// Só a quarta veio do print; os outros dias são placeholder, troca pelos dados reais.
const MENU = {
    21: { kcal: 920, itens: [
        { label: "Prato proteico", nome: "Frango Grelhado", tag: "Opção Proteica" },
        { label: "Opção proteica", nome: "Ovo Mexido", tag: "Opção Proteica" },
        { label: "Acompanhamento 1", nome: "Arroz Branco" },
        { label: "Acompanhamento 2", nome: "Feijão Preto" },
        { label: "Guarnição", nome: "Macarrão ao Alho e Óleo" },
        { label: "Salada do dia", nome: "Alface e Tomate" },
        { label: "Sobremesa", nome: "Fruta" },
        { label: "Bebida", nome: "Suco de Acerola" },
    ]},
    22: { kcal: 940, itens: [
        { label: "Prato proteico", nome: "Carne de Sol Desfiada", tag: "Opção Proteica" },
        { label: "Opção proteica", nome: "Soja Refogada", tag: "Opção Proteica" },
        { label: "Acompanhamento 1", nome: "Arroz Branco" },
        { label: "Acompanhamento 2", nome: "Feijão Carioca" },
        { label: "Guarnição", nome: "Baião de Dois" },
        { label: "Salada do dia", nome: "Repolho com Cenoura" },
        { label: "Sobremesa", nome: "Doce" },
        { label: "Bebida", nome: "Suco de Caju" },
    ]},
    23: { kcal: 950, itens: [
        { label: "Prato proteico", nome: "Suíno com Legumes", tag: "Opção Proteica" },
        { label: "Opção proteica", nome: "Omelete", tag: "Opção Proteica" },
        { label: "Acompanhamento 1", nome: "Arroz Branco" },
        { label: "Acompanhamento 2", nome: "Feijão Carioca" },
        { label: "Guarnição", nome: "Farofa de Cuscuz" },
        { label: "Salada do dia", nome: "Salada Crua" },
        { label: "Sobremesa", nome: "Doce" },
        { label: "Bebida", nome: "Suco de Polpa de Cajá" },
    ]},
    24: { kcal: 930, itens: [
        { label: "Prato proteico", nome: "Peixe Assado", tag: "Opção Proteica" },
        { label: "Opção proteica", nome: "Quibe de Soja", tag: "Opção Proteica" },
        { label: "Acompanhamento 1", nome: "Arroz Branco" },
        { label: "Acompanhamento 2", nome: "Feijão Carioca" },
        { label: "Guarnição", nome: "Purê de Batata" },
        { label: "Salada do dia", nome: "Beterraba Cozida" },
        { label: "Sobremesa", nome: "Fruta" },
        { label: "Bebida", nome: "Suco de Goiaba" },
    ]},
    25: { kcal: 960, itens: [
        { label: "Prato proteico", nome: "Galinhada", tag: "Opção Proteica" },
        { label: "Opção proteica", nome: "Ovo Cozido", tag: "Opção Proteica" },
        { label: "Acompanhamento 1", nome: "Arroz Branco" },
        { label: "Acompanhamento 2", nome: "Feijão Verde" },
        { label: "Guarnição", nome: "Vinagrete" },
        { label: "Salada do dia", nome: "Salada Mista" },
        { label: "Sobremesa", nome: "Doce" },
        { label: "Bebida", nome: "Suco de Maracujá" },
    ]},
};

export default function Cardapio() {
    const [selecionado, setSelecionado] = useState(23);
    const dia = DIAS.find(d => d.num === selecionado);
    const { itens, kcal } = MENU[selecionado];

    return (
        <section className="cardapio">
            <div className="cardapioCard">
                <div className="cardapioHeader">
                    <div>
                        <p className="cardapioTag"><span className="cardapioDot" /> CARDÁPIO DA SEMANA</p>
                        <p className="cardapioSub">Refeição balanceada elaborada e supervisionada por equipe nutricional técnica</p>
                    </div>
                    <span className="cardapioBadge">
                        <EventNoteOutlinedIcon sx={{ fontSize: 12 }} /> Semana Atual
                    </span>
                </div>

                <div className="cardapioDias" role="tablist">
                    {DIAS.map(d => (
                        <button
                            key={d.num}
                            role="tab"
                            aria-selected={d.num === selecionado}
                            className={`cardapioDia ${d.num === selecionado ? "ativo" : ""}`}
                            onClick={() => setSelecionado(d.num)}
                        >
                            <span className="diaSigla">{d.sigla}</span>
                            <span className="diaNum">{d.num}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="cardapioPainel">
                <div className="painelTopo">
                    <p className="painelTag">{dia.nome.toUpperCase()} • ALMOÇO COMPLETO</p>
                    <h2 className="painelTitulo">Almoço</h2>
                </div>

                <ul className="painelLista">
                    {itens.map(item => (
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
                        <InfoOutlinedIcon sx={{ fontSize: 13 }} />
                        Cardápio sujeito a alterações conforme disponibilidade de insumos.
                    </span>
                    <span className="rodapeKcal">Estimativa: ~ {kcal} kcal</span>
                </div>
            </div>
        </section>
    );
}