"use client";

import { useState } from "react";
import { DIAS, MENU } from "./cardapioMock";
import "./style.css";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";

export default function Cardapio() {
    const [selecionado, setSelecionado] = useState(23);
    const dia = DIAS.find(d => d.num === selecionado);
    const { itens, kcal } = MENU[selecionado];
    
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
                        <InfoOutlinedIcon sx={{ fontSize: '0.9 rem'}} />
                        Cardápio sujeito a alterações conforme disponibilidade de insumos.
                    </span>
                    <span className="rodapeKcal">Estimativa: ~ {kcal} kcal</span>
                </div>
            </div>
        </section>
    );
}