import "./style.css";

export default function FooterSection() {
    const ano = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footerContainer">
                <div className="footerColunas">
                    <section>
                        <h2 className="footerTitulo">Restaurante Popular de Quixadá</h2>
                        <p>
                            Política pública de Segurança Alimentar e Nutricional que
                            assegura refeições balanceadas e de alto valor nutricional à
                            população quixadaense.
                        </p>
                    </section>

                    <section>
                        <h2 className="footerTitulo caixaAlta">Atendimento e Plantão</h2>
                        <address className="footerContato">
                            <p>
                                Central do Cidadão: <a href="tel:+558834120000">(88) 3412-0000</a>
                            </p>
                            <p>Horário: 08h às 14h (dias úteis)</p>
                        </address>
                    </section>
                </div>

                <p className="footerCopy">
                    © {ano} Prefeitura Municipal de Quixadá • Todos os direitos reservados.
                </p>
            </div>
        </footer>
    );
}