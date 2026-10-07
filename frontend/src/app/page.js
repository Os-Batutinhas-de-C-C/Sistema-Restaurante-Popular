<<<<<<< HEAD
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <p>
                    Altere o arquivo <code>src/app/page.js</code>.
                </p>
            </main>
        </div>
    );
}
=======
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
>>>>>>> b90b8e321f8a6bbe8d8dbcb298cb274caaa0eed0
