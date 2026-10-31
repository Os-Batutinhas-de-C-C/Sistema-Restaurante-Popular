import "./globals.css";
import "@daypicker/react/style.css";

export const metadata = {
    title: "Painel Nutricionista",
    description: "Painel de acompanhamento do Restaurante Popular",
};

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR">
            <body>{children}</body>
        </html>
    );
}
