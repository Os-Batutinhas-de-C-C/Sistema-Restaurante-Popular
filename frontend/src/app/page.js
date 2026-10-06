import NavBar from "@/components/mainPage/navBar";
import Main from "@/components/mainPage/main"
import Fotter from "@/components/mainPage/fotter"

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

      <Main> </Main>

      <Fotter></Fotter>
      
    </main>
  );
}