import "./globals.css";
import "@daypicker/react/style.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import AccessibilityTools from "@/components/AccessibilityTools/AccessibilityTools";

export const metadata = {
    title: "Painel Nutricionista",
    description: "Painel de acompanhamento do Restaurante Popular",
};

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR">
            <body>
                <AppRouterCacheProvider>
                    <AccessibilityTools />
                    {children}
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}
