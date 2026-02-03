"use client";

import Link from 'next/link';
import {
    FaShieldAlt,
    FaUser,
    FaUserPlus,
    FaBookOpen
} from 'react-icons/fa';
import { useSession } from 'next-auth/react';

const Header = () => {
    const { data: session } = useSession();

    return (
        <header className="bg-white border-b border-gray-100 print:hidden shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="md:flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="p-2 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
                            <FaShieldAlt className="text-2xl text-white" />
                        </div>
                        
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                Tabletop App
                            </h1>
                            <p className="text-xs text-gray-500">
                                Treinamentos em Resposta a Incidentes
                            </p>
                        </div>
                    </Link>

                    <div className="hidden md:flex justify-center items-center gap-2">
                        {session ? (
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 px-5 py-2.5 text-white font-medium bg-blue-600 hover:bg-blue-800 rounded-lg transition-all shadow-sm hover:shadow-md"
                            >
                                <FaBookOpen className="text-sm" />
                                <span className="">Dashboard</span>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="flex items-center gap-2 px-5 py-2.5 text-blue-600 font-medium bg-white hover:bg-blue-50 rounded-lg transition-all shadow-sm hover:shadow-md"
                                >
                                    <FaUser className="text-sm" />
                                    <span className="">Entrar</span>
                                </Link>

                                <Link
                                    href="/register"
                                    className="flex items-center gap-2 px-5 py-2.5 text-white font-medium bg-blue-600 hover:bg-blue-800 rounded-lg transition-all shadow-sm hover:shadow-md"
                                >
                                    <FaUserPlus className="text-sm" />
                                    <span className="">Cadastrar</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
