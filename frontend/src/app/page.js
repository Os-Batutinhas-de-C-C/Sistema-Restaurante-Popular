"use client";

import styles from "./page.module.css";
import MeuPerfil from "@/components/meuPerfil/meuPerfil";

import NavBar from "@/components/painelCliente/navBar";
import Main from "@/components/painelCliente/main";

export default function PaginaInicial() {
	return (
		<>
		<NavBar></NavBar>
		<div className={styles.page}>
			<main className={styles.main}>
				<Main></Main>
      		</main>
  		</div>
		</>
	);
}
