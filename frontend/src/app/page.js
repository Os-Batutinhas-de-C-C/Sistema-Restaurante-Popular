"use client";

import styles from "./page.module.css";
import MeuPerfil from "@/components/meuPerfil/meuPerfil";

export default function Home() {
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <MeuPerfil></MeuPerfil>
            </main>
        </div>
    );
}
