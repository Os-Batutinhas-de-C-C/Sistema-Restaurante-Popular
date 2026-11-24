import PaginaFrequenciaOficina from "@/components/oficinas/FrequenciaOficina/PaginaFrequenciaOficina";

export default async function FrequenciaOficinaPage({ params }) {
    const { id } = await params;
    return <PaginaFrequenciaOficina id={id} />;
}
