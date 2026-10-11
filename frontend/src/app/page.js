"use client";

import styles from "./page.module.css";
import NavBar from "@/components/painelCliente/navBar";

export default function Home() {
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <NavBar></NavBar>
            </main>
        </div>
    );
}
