import "./style.css";
import {UtensilsCrossed} from "lucide-react";
import Box from '@mui/material/Box';
import { Button } from "@mui/material";
import { Lock } from "lucide-react";
import { Dot } from "lucide-react";

export default function NavBar()
{
    return(
        <header id='navBar'>
            <div className='container'>
                <div id='brand'>
                    <Box id='symbol'>
                        <UtensilsCrossed style={{color:  'white'}}/>
                    </Box>
                    <div className='containerNames'>
                        <div>
                            <strong> Restaurante Popular </strong>
                        </div>
                        <div>
                            <p style={{color: '#64748B'}}> Prefeitura Municipal de Quixadá </p>
                        </div>
                    </div>
                </div>
                <div id='navigation'> 
                    <div> 
                        <p> Notícias </p>
                    </div>
                    <div> 
                        <p> Fichas </p>
                    </div>
                    <div> 
                        <p> Orientações </p>
                    </div>
                    <div> 
                        <p> Cardápio </p>
                    </div>
                    <div> 
                        <p> Localização </p>
                    </div>
                </div>
                <div id="statusBadge">
                    <div id="status"> 
                        <Dot></Dot>
                        <strong style={{fontSize:'small'}}> Aberto </strong>  
                    </div>
                    <Button id="entrar"> 
                        <Lock style={{scale: '0.8'}}></Lock>
                        <p> Entrar </p>
                    </Button>
                </div>
            </div>
        </header>
    );
}