'use client';

import {AppBar, Toolbar, Container, Typography, IconButton, Box, Avatar} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'

export default function nutriHeader() {
  return (
    <Box sx={{ flexGrow: 1, backgroundColor: "#f5f5f5" }}>
        <AppBar position="static" sx={{backgroundColor: "#1565c0"}}>
            <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <RestaurantIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            Painel Nutricionista
          </Typography>
          <IconButton size="small" sx={{ ml: 1 }}>
                <Avatar sx={{ bgcolor: '#ffff', width: 24, height: 24 }}>
                    <AccountCircleIcon sx={{ color: '#9c27b0', fontSize: 30}} />
                </Avatar>
            </IconButton>
        </Toolbar>
        </AppBar>
    </Box>
  );
}