export const estoqueMockData = [
    {
        id: "2409-AB",
        nome: "Arroz branco parboilizado",
        quantidade: "1240",
        unidade: "kg",
        lote: "2409-AB",
        dataEntrega: "2026-09-10",
        dataValidade: "2026-10-10",
        observacao: "Recebimento completo. Produto para uso rápido",
        status: "No prazo",
    },
    {
        id: "2410-TC",
        nome: "Tomate cereja",
        quantidade: "48",
        unidade: "caixas",
        lote: "2410-TC",
        dataEntrega: "2026-09-12",
        dataValidade: "2026-09-18",
        observacao: "Recebimento completo. Lote armazenado em paletes fechados.",
        status: "Vence em breve",
    },
    {
        id: "2411-FT",
        nome: "Farinha de trigo tipo 1",
        quantidade: "860",
        unidade: "kg",
        lote: "2411-FT",
        dataEntrega: "2026-09-14",
        dataValidade: "2026-10-14",
        observacao: "Envio parcial, solicitar o restante no próximo pedido",
        status: "No prazo",
    },
    {
        id: "2412-LI",
        nome: "Leite integral UHT",
        quantidade: "96",
        unidade: "caixas",
        lote: "2412-LI",
        dataEntrega: "2026-09-15",
        dataValidade: "2026-12-15",
        observacao: "Recebimento completo. Produto de uso rápido",
        status: "No prazo",
    },
];

export const statusEstoque = ["No prazo", "Vence em breve", "Vencido"];

export function formatarDataEstoque(data) {
    if (!data) return "—";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

export function formatarQuantidade(quantidade) {
    const numero = Number(quantidade);
    return Number.isFinite(numero)
        ? new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(numero)
        : quantidade;
}
