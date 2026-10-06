import NavBar from "@/components/navBar";

export default function PaginaInicial() {
  
  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'sans-serif'
    }}>

      <NavBar></NavBar>

    </main>
  );
}