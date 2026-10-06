import "./style.css";

export default function NavBar()
{
    return(
        <header id='navBar'>
            <div className='container'>
                <div id='link'>
                    <div id='symbol'></div>
                        <div className='container'>
                            <div>
                                <strong> Restaurante Popular </strong>
                            </div>
                            <div>
                                <p> Prefeitura Municipal de Quixadá </p>
                            </div>
                        </div>
                </div>
                <div id='navigation'></div>
            </div>
        </header>
    );

}