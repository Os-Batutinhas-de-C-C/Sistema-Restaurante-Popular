import "./style.css";

export default function FotterSection()
{
    return(
        <footer id="footer">
            <div id="container">
                <div id="horizontalBorder">
                    <div id="tittle">
                        <strong style={{color:'white', fontSize:'small'}}> Restaurante Popular de Quixadá </strong>
                        <p>
                            Política pública de Segurança Alimentar e Nutricional que
                            assegura refeições balanceadas e de alto valor nutricional à
                            população quixadaense.
                        </p>
                    </div>
                    <div id="contato">
                        <strong style={{color:'white', fontSize:'small'}}> Atendimento e Plantão </strong>
                        <p>
                            Central do Cidadão: (88) 3412-0000
                        </p>
                        <p>
                            Horário: 08h às 14h (dias úteis)
                        </p>
                    </div>
                </div>
                <hr style={{color:'#a7bfe24f'}}/>
                <div id="containerText">
                    <p style={{fontSize:'x-small'}}> © 2025 Prefeitura Municipal de Quixadá • Todos os direitos reservados. </p>
                </div>
            </div>
        </footer>
    );
}