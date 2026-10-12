"use client";

import styles from "./page.module.css";
import ContedoDoPainel from "@/components/painelCaixa/index"

export default function Home() {
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <ContedoDoPainel></ContedoDoPainel>
            </main>
        </div>
    );
}
