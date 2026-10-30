import SeletorIntervaloDatas from "../../../SeletorIntervaloDatas/SeletorIntervaloDatas";
import { dataDeIsoLocal } from "../../../../services/gerenciamentoCardapioService";

function dataIso(data) {
    if (!data) return "";
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

export default function FiltroPeriodo({ dataInicial, dataFinal, onChange }) {
    const intervalo = {
        from: dataInicial ? dataDeIsoLocal(dataInicial) : undefined,
        to: dataFinal ? dataDeIsoLocal(dataFinal) : undefined,
    };

    return (
        <SeletorIntervaloDatas
            value={intervalo}
            onChange={(range) => onChange({ from: dataIso(range?.from), to: dataIso(range?.to) })}
            ariaLabel="Abrir período do histórico"
        />
    );
}
