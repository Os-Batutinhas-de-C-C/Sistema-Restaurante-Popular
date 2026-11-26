"use client";

import { useEffect, useRef, useState } from 'react';
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
    const [secaoAtiva, setSecaoAtiva] = useState('noticias');
    const secaoPendente = useRef(null);
    const timeoutSecao = useRef(null);
    const atualizarSecaoRef = useRef(null);

    const selecionarSecao = (id) => {
        secaoPendente.current = id;
        setSecaoAtiva(id);
        clearTimeout(timeoutSecao.current);
        timeoutSecao.current = setTimeout(() => {
            secaoPendente.current = null;
            atualizarSecaoRef.current?.();
        }, 2500);
    };

    useEffect(() => {
        const atualizar = () => setAberto(estaAberto());
        atualizar();
        const id = setInterval(atualizar, 60_000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        let frame;
        const atualizarSecaoAtiva = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const chegouAoFim = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
                const limite = (document.getElementById('navBar')?.getBoundingClientRect().bottom ?? 120) + 24;
                const idPendente = secaoPendente.current;
                const alvoPendente = idPendente && document.getElementById(idPendente);
                const alvoAlcancado = chegouAoFim && idPendente === pages[pages.length - 1].id
                    || alvoPendente && alvoPendente.getBoundingClientRect().top <= limite;

                if (idPendente && !alvoAlcancado) return;
                if (alvoAlcancado) {
                    secaoPendente.current = null;
                    clearTimeout(timeoutSecao.current);
                    setSecaoAtiva(idPendente);
                    return;
                }

                if (chegouAoFim) {
                    setSecaoAtiva(pages[pages.length - 1].id);
                    return;
                }
                const secaoVisivel = [...pages].reverse().find(({ id }) => {
                    const elemento = document.getElementById(id);
                    return elemento && elemento.getBoundingClientRect().top <= limite;
                });
                if (secaoVisivel) setSecaoAtiva(secaoVisivel.id);
            });
        };

        atualizarSecaoRef.current = atualizarSecaoAtiva;
        atualizarSecaoAtiva();
        window.addEventListener('scroll', atualizarSecaoAtiva, { passive: true });
        window.addEventListener('resize', atualizarSecaoAtiva);
        window.addEventListener('hashchange', atualizarSecaoAtiva);
        return () => {
            cancelAnimationFrame(frame);
            clearTimeout(timeoutSecao.current);
            atualizarSecaoRef.current = null;
            window.removeEventListener('scroll', atualizarSecaoAtiva);
            window.removeEventListener('resize', atualizarSecaoAtiva);
            window.removeEventListener('hashchange', atualizarSecaoAtiva);
        };
    }, []);

    return (
        <AppBar id="navBar" position="fixed" elevation={0}>
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
                            <a
                                key={id}
                                href={`#${id}`}
                                aria-current={secaoAtiva === id ? 'location' : undefined}
                                onClick={() => selecionarSecao(id)}
                            >
                                {label}
                            </a>
                        ))}
                    </nav>

                    <div id="statusBadge">
                        {aberto !== null && (
                            <span id="status" className={aberto ? '' : 'fechado'}>
                                <span className="dot" />
                                {aberto ? 'Aberto' : 'Fechado'}
                            </span>
                        )}
                        <Button id="entrar" startIcon={<LockIcon />} href='/login'>Entrar</Button>
                    </div>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
