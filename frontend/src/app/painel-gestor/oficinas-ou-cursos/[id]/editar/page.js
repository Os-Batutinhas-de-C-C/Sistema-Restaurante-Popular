import FormularioOficina from "@/components/oficinas/FormularioOficina";

export default async function EditarOficinaPage({ params }) {
    const { id } = await params;
    return <FormularioOficina id={id} />;
}
