"use client";

import Main from "@/components/painelCliente/main";
import NavBar from "@/components/painelCliente/navBar";
import { enviarMensagemPublica } from "@/services/mensagensService";

export default function painelClientePage() {
    return <>
    <NavBar></NavBar>
    <Main onEnviar={enviarMensagemPublica}></Main>
    </>;
}
