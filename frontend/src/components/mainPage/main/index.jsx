    "use client";

    import "./style.css";
    import NewsCard from "./newsCard";
    import OrientacaoItem from "./orientacaoItem";
    import { ORIENTACOES } from "./orientacaoItem/orientacao";
    import Cardapio from "./cardapio";
    import Localizacao from "./localizacao";
    import FichasHoje from "./FichasHoje";

    export default function Main() {
        return (
        <div id="mainContainer">
            <section id="noticias" className="boxes">
                <NewsCard/>
            </section>
            <section className="boxes">
                <div className="boxBorder" id="indicadores">
                    <FichasHoje />
                    <div id="atendimento" className="holders">
                        <p className="tittle"> ATENDIMENTO </p>
                        <p className="subText"> Horários de Refeições </p>
                        <p className="mainText"> 11h00 <span className="mainSub"> às </span> 13h30 </p>
                        <span className="paddingTextLight"> Início da entrega de fichas às <span className="paddingTextBlack"> 10h30 </span> na bilheteria central. </span> 
                    </div>
                    <div id="acesso" className="holders">
                        <p className="tittle"> ACESSO POPULAR </p>
                        <p className="subText"> Tarifa ao Cidadão </p>
                        <p className="mainText"> R$3,00 <span className="paddingTextLight"> /refeição  </span> </p>
                        <span className="paddingTextLight"> Para famílias cadastradas no <span className="paddingTextBlack"> CadÚnico </span> </span> 
                    </div>
                </div>
            </section>

            <section className="boxes" >
                <div className="boxBorder" id="orientacao"> 
                    <div id="tittleWarning"> 
                        <span className="tag"><span className="dot" /> ORIENTAÇÕES AO CIDADÃO </span>
                        <span className="paddingTextLight"> Toque para Expandir </span>
                    </div>
                    <hr className="divider" />
                    
                    {ORIENTACOES.map((item) => (
                        <OrientacaoItem
                            key={item.id}
                            id={item.id}
                            symbolId={item.symbolId}
                            icon={item.icon}
                            titulo={item.titulo}
                            resumo={item.resumo}
                            detalhe={item.detalhe}
                        />
                    ))}
                </div>
            </section>

            <section id="cardapio" className="boxes">
                <Cardapio />
            </section>

            <section id="localizacao" className="boxes">
                <Localizacao />   
            </section>
        </div>
        );
    }
