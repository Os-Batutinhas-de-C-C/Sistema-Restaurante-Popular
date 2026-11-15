import GerenciarCardapio from "../../../../components/painelNutricionistaGerenciarCardapio/GerenciarCardapio";
import ProtectedRoute from "../../../../components/login/ProtectedRoute";

export default async function GerenciarCardapioPage({ params }) {
    const { data } = await params;
    return <ProtectedRoute><GerenciarCardapio dataSolicitada={data} /></ProtectedRoute>;
}
