"use client";

import { useState } from "react";

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export default function OrientacaoItem({ id, symbolId, icon, titulo, resumo, detalhe }) {
    const [aberto, setAberto] = useState(false);

    return (
        <div id={id} className={`orientacaoHolders ${aberto ? "aberto" : ""}`}>
            <div className="mainBrand">
                <div id={symbolId} className="symbol">{icon}</div>
            </div>
            <div className="orientacaoText">
                <p className="subText">{titulo}</p>
                <span className="paddingTextLight">{resumo}</span>

                <div className="detalhe">
                    <p className="orientacaoTittle">{detalhe}</p>
                </div>
            </div>

            <button
                className="arrow"
                onClick={() => setAberto(a => !a)}
                aria-expanded={aberto}
                aria-label={aberto ? "Recolher" : "Expandir"}
            >
                <KeyboardArrowDownIcon fontSize="small" />
            </button>
        </div>
    );
}