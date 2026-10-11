"use client";

import styles from "./page.module.css";

import NavBar from "@/components/mainPage/navBar";
import Main from "@/components/mainPage/main"
import Fotter from "@/components/mainPage/fotter"

export default function PaginaInicial() {
  
	return (
		<>
		<NavBar></NavBar>
		<div className={styles.page}>
			<main className={styles.main}>
				<Main></Main>
      		</main>
  		</div>
		<Fotter></Fotter>
		</>
	);
}