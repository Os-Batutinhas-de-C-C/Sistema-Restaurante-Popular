// Esta é a página PRINCIPAL (Home). Ela responde pela rota raiz: localhost:3000/

// 1. IMPORTAÇÕES
// O 'Link' é a ferramenta oficial do Next.js para navegar entre as páginas de forma super rápida.
import Link from 'next/link';
// Importando um botão do MUI para deixar o link(mudança de paginas) mais bonito
import Button from '@mui/material/Button';

export default function PaginaInicial() {
  
  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'sans-serif'
    }}>
      
      <div id='navBar' style={{
        height: '10vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div className='container' style={{
          width:'90vw',
          alignContent: 'center'
        }}> <div id='link' style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <div id='symbol' style={{
            height: '3rem',
            width: '3rem',
            backgroundColor: '#1D4ED8',
            borderRadius: '0.8rem',
            border: '1px solid #FED7AACC'
          }}>
          </div>
          <div className='container' style={{
            display: 'flex',
            flexDirection: 'column',
            width: '14vw'
          }}>
            <div className='container'>
              <b style={{
              fontSize: 'large'
            }}> Restaurante Popular </b>
            </div>
            <div className='container' >
              <p style={{
              fontSize: 'small'
            }}> Prefeitura Municipal de Quixadá </p>
            </div>
          </div>
        </div>
          <div id='Navigation'>
            
          </div>
        </div>
      </div>
    
    </main>
  );
}