"use client";

import { useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LockIcon from '@mui/icons-material/Lock';
import './style.css';

const pages = [
    { label: 'Notícias',    id: 'noticias' },
    { label: 'Fichas',      id: 'fichas' },   
    { label: 'Orientações', id: 'orientacao' },  
    { label: 'Cardápio',    id: 'cardapio' },
    { label: 'Localização', id: 'localizacao' },
];

const ABRE  = 10 * 60 + 30;
const FECHA = 13 * 60 + 30;   

function estaAberto(agora = new Date()) {
    const p = Object.fromEntries(
        new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Fortaleza',
            weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
        }).formatToParts(agora).map(x => [x.type, x.value])
    );
    const util = !['Sat', 'Sun'].includes(p.weekday);
    const min = Number(p.hour) * 60 + Number(p.minute);
    return util && min >= ABRE && min < FECHA;
}

export default function NavBar() {
    const [aberto, setAberto] = useState(null);

    useEffect(() => {
        const atualizar = () => setAberto(estaAberto());
        atualizar();
        const id = setInterval(atualizar, 60_000);
        return () => clearInterval(id);
    }, []);

    return (
        <AppBar id="navBar" position="static" elevation={0}>
            <Container className="container" maxWidth="xl">
                <Toolbar disableGutters className="toolbar">
                    <div id="brand">
                        <div id="symbol">
                            <RestaurantIcon />
                        </div>
                        <div className="brandText">
                            <strong>Restaurante Popular</strong>
                            <span>Prefeitura Municipal de Quixadá</span>
                        </div>
                    </div>

                    <nav id="navigation" aria-label="Seções da página">
                        {pages.map(({ label, id }) => (
                            <a key={id} href={`#${id}`}>{label}</a>
                        ))}
                    </nav>

                    <div id="statusBadge">
                        {aberto !== null && (
                            <span id="status" className={aberto ? '' : 'fechado'}>
                                <span className="dot" />
                                {aberto ? 'Aberto' : 'Fechado'}
                            </span>
                        )}
                        <Button id="entrar" startIcon={<LockIcon />}>Entrar</Button>
                    </div>
                </Toolbar>
            </Container>
        </AppBar>
    );
}