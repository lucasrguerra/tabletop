import "./globals.css";
import Footer from "@/components/Footer";
import { Montserrat, JetBrains_Mono } from "next/font/google";
import SessionWrapper from "@/components/SessionWrapper";

const montserrat = Montserrat({ subsets: ["latin"] });

// Telemetry face: clocks, counters and round positions. Tabular figures keep
// the console from shifting as digits change during a live exercise.
const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    display: "swap",
});

export const metadata = {
  title: "Exercícios Tabletop",
  description: "Plataforma para treinamento de exercícios tabletop de segurança cibernética.",
  author: "Lucas Rayan Guerra",
};

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR">
            <body className={`${montserrat.className} ${jetbrainsMono.variable} flex flex-col min-h-screen zoom-125`}>
                <SessionWrapper>
                    <div className="flex-1">
                        {children}
                    </div>
                </SessionWrapper>
                <Footer />
            </body>
        </html>
    );
}
