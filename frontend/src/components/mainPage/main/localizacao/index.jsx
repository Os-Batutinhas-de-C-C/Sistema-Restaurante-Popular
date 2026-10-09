import "./style.css";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import DirectionsIcon from "@mui/icons-material/Directions";

const ENDERECO = "Rua José de Alencar, Centro, nº 420, Quixadá - CE";
const TELEFONE = "(88) 3412-0000";
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ENDERECO)}`;
const TEL_URL = `tel:+55${TELEFONE.replace(/\D/g, "")}`;

export default function Localizacao() {
    return (
        <section className="loc">
            <div className="locCard">
                <div className="locHeader">
                    <span className="locTitulo"><span className="locDot" /> LOCALIZAÇÃO & ATENDIMENTO</span>
                    <span className="locSede">Sede Centro • Quixadá</span>
                </div>
                <hr className="locDivider" />

                <div className="locLinha">
                    <div className="locIcone azul"><LocationOnIcon sx={{ fontSize: 14 }} /></div>
                    <div>
                        <p className="locForte">Rua José de Alencar, Centro, nº 420</p>
                        <p className="locFraco">Quixadá - CE (Próximo à Praça da Catedral do Leão)</p>
                    </div>
                </div>

                <div className="locLinha">
                    <div className="locIcone laranja"><PhoneIcon sx={{ fontSize: 14 }} /></div>
                    <p className="locFraco">Central Telefônica: <strong>{TELEFONE}</strong></p>
                </div>

                <div className="locLinha">
                    <div className="locIcone verde"><AccessTimeIcon sx={{ fontSize: 14 }} /></div>
                    <p className="locFraco">Funcionamento: <strong>Segunda a Sexta, 10h30 às 13h30</strong></p>
                </div>

                <div className="locBotoes">
                    <a className="locBtn primario" href={TEL_URL}>
                        <ChatBubbleIcon sx={{ fontSize: 13 }} /> FALE CONOSCO
                    </a>
                    <a className="locBtn secundario" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                        <DirectionsIcon sx={{ fontSize: 15 }} /> ABRIR NO GOOGLE MAPS
                    </a>
                </div>

                <p className="locRodape">
                    Secretaria Municipal de Desenvolvimento Social • Prefeitura de Quixadá
                </p>
            </div>
        </section>
    );
}