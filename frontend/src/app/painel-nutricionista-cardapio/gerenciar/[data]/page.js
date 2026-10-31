import GerenciarCardapio from "../../../../components/painelNutricionistaGerenciarCardapio/GerenciarCardapio";

export default async function GerenciarCardapioPage({ params }) {
    const { data } = await params;
    return <GerenciarCardapio dataSolicitada={data} />;
}
