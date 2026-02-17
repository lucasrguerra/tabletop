import Link from 'next/link';
import {
    FaLinkedin,
    FaEnvelope,
    FaBook,
    FaShieldAlt,
    FaExternalLinkAlt,
    FaHeart
} from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-linear-to-b from-slate-900 to-slate-950 text-white mt-auto print:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid md:grid-cols-3 gap-10 lg:gap-16">
                    {/* Brand Section */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl blur opacity-50" />
                                <div className="relative p-2.5 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                    <FaShieldAlt className="text-xl text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Tabletop App</h3>
                                <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                                    Resposta a Incidentes
                                </p>
                            </div>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Plataforma de treinamentos em resposta a incidentes de seguranca cibernetica por meio de exercicios tabletop.
                        </p>
                        <div className="pt-2">
                            <p className="inline-flex items-center gap-2 text-xs text-slate-500 bg-slate-800/50 px-3 py-2 rounded-lg">
                                <FaBook className="text-blue-400" />
                                <span>Residencia Tecnologica RNP</span>
                            </p>
                        </div>
                    </div>

                    {/* Links Section */}
                    <div className="space-y-5">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            Links Uteis
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <a 
                                    href="https://rnp.br/cais" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="group flex items-start gap-3 text-slate-400 hover:text-white transition-colors duration-200"
                                >
                                    <div className="p-1.5 bg-slate-800 rounded-lg group-hover:bg-blue-600/20 transition-colors">
                                        <FaExternalLinkAlt className="text-xs text-slate-500 group-hover:text-blue-400" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium block group-hover:translate-x-0.5 transition-transform">
                                            CAIS/RNP
                                        </span>
                                        <span className="text-xs text-slate-500">Centro de Atendimento a Incidentes</span>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="https://www.cert.br" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="group flex items-start gap-3 text-slate-400 hover:text-white transition-colors duration-200"
                                >
                                    <div className="p-1.5 bg-slate-800 rounded-lg group-hover:bg-blue-600/20 transition-colors">
                                        <FaExternalLinkAlt className="text-xs text-slate-500 group-hover:text-blue-400" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium block group-hover:translate-x-0.5 transition-transform">
                                            CERT.br
                                        </span>
                                        <span className="text-xs text-slate-500">Centro de Estudos e Tratamento</span>
                                    </div>
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div className="space-y-5">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            Contato
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <a 
                                    href="mailto:l.rayanguerra@gmail.com" 
                                    className="group flex items-center gap-3 text-slate-400 hover:text-white transition-colors duration-200"
                                >
                                    <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-emerald-600/20 transition-colors">
                                        <FaEnvelope className="text-sm text-slate-500 group-hover:text-emerald-400" />
                                    </div>
                                    <span className="text-sm group-hover:translate-x-0.5 transition-transform">
                                        l.rayanguerra@gmail.com
                                    </span>
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="https://www.linkedin.com/in/lucasrguerra" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-3 text-slate-400 hover:text-white transition-colors duration-200"
                                >
                                    <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-blue-600/20 transition-colors">
                                        <FaLinkedin className="text-sm text-slate-500 group-hover:text-blue-400" />
                                    </div>
                                    <span className="text-sm group-hover:translate-x-0.5 transition-transform">
                                        linkedin.com/in/lucasrguerra
                                    </span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-800 mt-10 pt-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-slate-500 text-sm">
                            &copy; {currentYear} Tabletop App. Todos os direitos reservados.
                        </p>
                        <p className="flex items-center gap-2 text-sm text-slate-500">
                            <span>Desenvolvido com</span>
                            <FaHeart className="text-red-500 animate-pulse" />
                            <span>por</span>
                            <a 
                                href="https://www.linkedin.com/in/lucasrguerra"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                            >
                                Lucas Rayan Guerra
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
