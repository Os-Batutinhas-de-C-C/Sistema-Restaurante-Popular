'use client';

import { Paper, TextField, Button, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export default function Filtro({ 
  label = "Selecione o Período", 
  buttonLabel, 
  onButtonClick 
}) {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}
    >

      <TextField
        label={label}
        defaultValue="21/09/2026 – 24/09/2026"
        size="small"
        sx={{ width: 280 }}
      />

      
      {buttonLabel && (
        <Button
          variant="contained"
          onClick={onButtonClick}
          sx={{ backgroundColor: '#0288d1', textTransform: 'uppercase', fontWeight: 'bold' }}
          
        >
          {buttonLabel}
        </Button>
      )}
    </Paper>
  );
}