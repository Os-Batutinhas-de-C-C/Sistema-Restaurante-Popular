"use client";

import Button from '@mui/material/Button';

export default function BotaoPedidoExemplo({ nomeDoPrato }) {

  function lidarComClique() {
    alert(`Você adicionou o prato: ${nomeDoPrato}`);
  }

  return (
    <Button 
      variant="contained" 
      color="success" 
      onClick={lidarComClique}
    >
      Adicionar {nomeDoPrato}
    </Button>
  );
}