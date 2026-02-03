import "./globals.css";
import Footer from "@/components/Footer";
import { Montserrat } from "next/font/google";
import SessionWrapper from "@/components/SessionWrapper";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: "Exercícios Tabletop",
  description: "Plataforma para treinamento de exercícios tabletop de segurança cibernética.",
  author: "Lucas Rayan Guerra",
};

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR">
            <body className={`${montserrat.className} flex flex-col min-h-screen`}>
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
