import "./globals.css";
import Footer from "@/components/Footer";
import { Montserrat, JetBrains_Mono } from "next/font/google";
import SessionWrapper from "@/components/SessionWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";

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

const themeScript = `
  (function() {
    try {
      var stored = localStorage.getItem('tabletop-theme');
      var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (stored === 'dark' || (!stored && systemDark) || (stored === 'system' && systemDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
            </head>
            <body className={`${montserrat.className} ${jetbrainsMono.variable} flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200`}>
                <ThemeProvider>
                    <SessionWrapper>
                        <div className="flex-1">
                            {children}
                        </div>
                    </SessionWrapper>
                    <Footer />
                </ThemeProvider>
            </body>
        </html>
    );
}
