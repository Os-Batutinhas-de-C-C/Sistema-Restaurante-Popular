"use client";

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import './style.css';

export default function NavBar() {
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

                    <div id="statusBadge">
                        <Button id="voltar">Voltar</Button>
                    </div>
                </Toolbar>
            </Container>
        </AppBar>
    );
}