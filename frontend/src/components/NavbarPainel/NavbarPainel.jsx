"use client";

import {
    AppBar,
    Avatar,
    Box,
    ButtonBase,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./navbarPainel.module.css";

// Itens do menu principal. Os ícones são assets do Figma para manter a
// fidelidade visual da referência.
const menuItems = [
    { label: "Início", icon: "/icons/li_house.svg", href: "/painel-nutricionista" },
    { label: "Cardápio", icon: "/icons/li_utensils.svg",  href: "/painel-nutricionista-cardapio" },
    { label: "Estoque", icon: "/icons/li_file-pen.svg", href: "/painel-nutricionista-estoque" },
    { label: "Relatórios", icon: "/icons/li_file-chart-line.svg" },
    { label: "Mensagens", icon: "/icons/li_message-square.svg", href: "/painel-nutricionista-mensagens" },
    { label: "Notícias", icon: "/icons/li_newspaper.svg", href: "/painel-nutricionista-noticias" },
    { label: "Sair", icon: "/icons/li_log-out.svg", href: "/mainPage" },
];

/**
 * Navbar compartilhada do painel da nutricionista.
 *
 * Responsabilidades:
 * - Exibir a identidade visual do painel.
 * - Controlar a abertura e o fechamento do menu.
 * - Redirecionar o item "Início" para o dashboard.
 */
export default function NavbarNutricionista({ onProfileClick }) {
    const router = useRouter();
    // Referência do botão que abriu o menu, usada pelo MUI para posicioná-lo.
    const [menuAnchor, setMenuAnchor] = useState(null);
    const isMenuOpen = Boolean(menuAnchor);

    // Abre o menu ancorado no botão hambúrguer.
    const handleMenuOpen = (event) => {
        setMenuAnchor(event.currentTarget);
    };

    // Fecha o menu após uma seleção ou quando o usuário clica fora dele.
    const handleMenuClose = () => {
        setMenuAnchor(null);
    };

    // Navega quando o item possui uma rota e sempre fecha o menu.
    const handleMenuItemClick = (href) => {
        handleMenuClose();
        if (href) {
            router.push(href);
        }
    };

    return (
        <Box>
            {/* Barra fixa com a identificação e as ações globais do painel. */}
            <AppBar
                position="fixed"
                elevation={0}
                className={styles.appBar}
            >
                <Toolbar className={styles.toolbar}>
                <IconButton
                    aria-label="Abrir menu"
                    aria-controls={isMenuOpen ? "menu-navegacao" : undefined}
                    aria-haspopup="true"
                    aria-expanded={isMenuOpen ? "true" : undefined}
                    onClick={handleMenuOpen}
                    className={styles.menuButton}
                >
                    <Box
                        component="img"
                        src="/icons/menu-filled.svg"
                        alt=""
                        className={styles.menuIcon}
                    />
                </IconButton>
                <Box
                    component="img"
                    src="/icons/symbol.svg"
                    alt=""
                    className={styles.restaurantIcon}
                />
                <Typography
                    variant="body1"
                    className={styles.title}
                >
                    Painel Nutricionista
                </Typography>
                    <Box className={styles.spacer} />
                    <ButtonBase
                        aria-label="Abrir perfil do usuário"
                        onClick={onProfileClick}
                        className={styles.profileButton}
                        href='/meuPerfil'
                    >
                        <Avatar className={styles.avatar}>
                            <Box
                                component="img"
                                src="/icons/person-filled.svg"
                                alt=""
                                className={styles.personIcon}
                            />
                        </Avatar>
                    </ButtonBase>
                </Toolbar>
            </AppBar>
            {/* Menu flutuante posicionado abaixo do botão de abertura. */}
            <Menu
                id="menu-navegacao"
                anchorEl={menuAnchor}
                open={isMenuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                }}
                slotProps={{
                    paper: {
                        sx: {
                            width: 180,
                            maxWidth: "calc(100vw - 32px)",
                            mt: 1,
                            borderRadius: 1,
                        },
                    },
                }}
            >
                {menuItems.map(({ label, icon, href }, index) => (
                    <MenuItem
                        key={label}
                        onClick={() => handleMenuItemClick(href)}
                        divider={index < menuItems.length - 1}
                        sx={{
                            minHeight: 48,
                            px: 2,
                            gap: 1.75,
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 0, color: "text.primary" }}>
                            <Box
                                component="img"
                                src={icon}
                                alt=""
                                sx={{ width: 22, height: 22, display: "block" }}
                            />
                        </ListItemIcon>
                        <ListItemText
                            primary={label}
                            slotProps={{
                                primary: {
                                    sx: {
                                        fontSize: "1rem",
                                        fontWeight: 400,
                                        lineHeight: 1.2,
                                    },
                                },
                            }}
                        />
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
}
