'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import NutriHeader from '@/components/nutripages/nutriHeader';
import Filtro from '@/components/nutripages/nutriFiltro'

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton 
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';


const mockData = [
  {
    id: 1,
    data: '21/09/2026',
    hora: '08:12',
    titulo: 'Atualização do Cardápio',
    descricao: 'Atenção: o cardápi...',
    duracao: '24h',
  },
];


export default function MensagensNutri() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh", width: "100%", flexDirection: "column"}}>
      <NutriHeader />
      <Container maxWidth="md" sx={{ mt: 4, pb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", color: "#111111", mb: 3 }}>
          Mensagens
        </Typography>
        <Filtro buttonLabel="buscar"/>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, p: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label="tabela de notícias">
          {/* Cabeçalho das Colunas */}
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: '#444' }}>Data</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#444' }}>Título</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#444' }}>Descrição</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#444' }}>Duração</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#444' }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockData.map((row) => (
                <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  
                  {/* Coluna 1: Data e Hora empilhados */}
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#222' }}>
                      {row.data}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#777' }}>
                      {row.hora}
                    </Typography>
                  </TableCell>

                  {/* Coluna 2: Título */}
                  <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>
                    {row.titulo}
                  </TableCell>

                  {/* Coluna 3: Descrição */}
                  <TableCell sx={{ color: '#666' }}>
                    {row.descricao}
                  </TableCell>

                  {/* Coluna 4: Duração */}
                  <TableCell sx={{ color: '#444' }}>
                    {row.duracao}
                  </TableCell>

                  {/* Coluna 5: Botões de Ação (Olho e Excluir) */}
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <IconButton 
                        sx={{ 
                          backgroundColor: '#0288d1', 
                          color: '#fff', 
                          '&:hover': { backgroundColor: '#01579b' },
                          width: 36,
                          height: 36
                        }}
                        size="small"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>

                      <IconButton 
                        sx={{ 
                          backgroundColor: '#0288d1', 
                          color: '#fff', 
                          '&:hover': { backgroundColor: '#01579b' },
                          width: 36,
                          height: 36
                        }}
                        size="small"
                      >
                        <DisabledByDefaultIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
</TableContainer>
      </Container>
    </Box>
  );
}