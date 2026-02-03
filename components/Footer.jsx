import React from 'react';
import {
    FaLinkedin,
    FaEnvelope,
    FaBook,
    FaShieldAlt
} from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white mt-auto print:hidden border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid md:grid-cols-3 gap-10">

                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 bg-blue-600 rounded-lg">
                                <FaShieldAlt className="text-xl text-white" />
                            </div>
                            <h3 className="text-lg font-bold">Tabletop App</h3>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-3">
                            Plataforma de treinamentos em resposta a incidentes de segurança cibernética por meio de exercícios tabletop.
                        </p>
                        <p className="text-gray-500 text-xs leading-relaxed">
                            Desenvolvido durante a Residência Tecnológica em Cibersegurança da Rede Nacional de Ensino e Pesquisa (RNP).
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-4">Links Úteis</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a 
                                    href="https://rnp.br/cais" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-blue-400 transition-colors flex items-start gap-2 group"
                                >
                                    <FaBook className="text-xs mt-1 shrink-0" />
                                    <span className="group-hover:underline">CAIS/RNP - Centro de Atendimento a Incidentes de Segurança</span>
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="https://www.cert.br" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-blue-400 transition-colors flex items-start gap-2 group"
                                >
                                    <FaBook className="text-xs mt-1 shrink-0" />
                                    <span className="group-hover:underline">CERT.br - Centro de Estudos e Tratamento de Incidentes</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-4">Contato</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a 
                                    href="mailto:l.rayanguerra@gmail.com" 
                                    className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors group"
                                >
                                    <FaEnvelope className="shrink-0" />
                                    <span className="group-hover:underline">l.rayanguerra@gmail.com</span>
                                </a>
                            </li>

                            <li>
                                <a 
                                    href="https://www.linkedin.com/in/lucasrguerra" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors group"
                                >
                                    <FaLinkedin className="shrink-0" />
                                    <span className="group-hover:underline">LinkedIn - lucasrguerra</span>
                                </a>
                            </li>
                        </ul>

                        <p className="text-gray-500 text-xs mt-6">
                            © {new Date().getFullYear()} Tabletop App
                        </p>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        Desenvolvido por <span className="text-blue-400 font-semibold">Lucas Rayan Guerra</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
