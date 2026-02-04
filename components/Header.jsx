"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FaShieldAlt,
    FaUser,
    FaUserPlus,
    FaBookOpen,
    FaBars,
    FaTimes
} from 'react-icons/fa';
import { useSession } from 'next-auth/react';

const Header = () => {
    const { data: session } = useSession();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && mobileMenuOpen) {
                setMobileMenuOpen(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [mobileMenuOpen]);

    return (
        <header 
            className={`
                sticky top-0 z-50 print:hidden transition-all duration-300
                ${scrolled 
                    ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-900/5 border-b border-slate-200/80' 
                    : 'bg-white border-b border-slate-100'
                }
            `}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 md:h-18">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
                            <div className="relative p-2.5 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-200">
                                <FaShieldAlt className="text-xl text-white" />
                            </div>
                        </div>
                        
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                Tabletop App
                            </h1>
                            <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                                Resposta a Incidentes
                            </p>
                        </div>
                        <span className="sm:hidden text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            Tabletop
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex justify-center items-center gap-3">
                        {session ? (
                            <Link
                                href="/dashboard"
                                className="group flex items-center gap-2 px-5 py-2.5 text-white font-semibold 
                                    bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                                    rounded-xl transition-all duration-200 
                                    shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 
                                    hover:scale-[1.02]"
                            >
                                <FaBookOpen className="text-sm group-hover:scale-110 transition-transform" />
                                <span>Dashboard</span>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="flex items-center gap-2 px-5 py-2.5 text-slate-700 font-semibold 
                                        bg-slate-100 hover:bg-slate-200 
                                        rounded-xl transition-all duration-200 hover:scale-[1.02]"
                                >
                                    <FaUser className="text-sm" />
                                    <span>Entrar</span>
                                </Link>

                                <Link
                                    href="/register"
                                    className="group flex items-center gap-2 px-5 py-2.5 text-white font-semibold 
                                        bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                                        rounded-xl transition-all duration-200 
                                        shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 
                                        hover:scale-[1.02]"
                                >
                                    <FaUserPlus className="text-sm group-hover:scale-110 transition-transform" />
                                    <span>Cadastrar</span>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                        aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                    >
                        {mobileMenuOpen ? (
                            <FaTimes className="text-xl" />
                        ) : (
                            <FaBars className="text-xl" />
                        )}
                    </button>
                </div>

                {/* Mobile Navigation */}
                <div 
                    className={`
                        md:hidden overflow-hidden transition-all duration-300 ease-out
                        ${mobileMenuOpen ? 'max-h-64 pb-4' : 'max-h-0'}
                    `}
                >
                    <nav className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                        {session ? (
                            <Link
                                href="/dashboard"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center justify-center gap-2 px-4 py-3 text-white font-semibold 
                                    bg-linear-to-r from-blue-600 to-indigo-600 
                                    rounded-xl transition-all"
                            >
                                <FaBookOpen className="text-sm" />
                                <span>Dashboard</span>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 px-4 py-3 text-slate-700 font-semibold 
                                        bg-slate-100 hover:bg-slate-200 
                                        rounded-xl transition-all"
                                >
                                    <FaUser className="text-sm" />
                                    <span>Entrar</span>
                                </Link>

                                <Link
                                    href="/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 px-4 py-3 text-white font-semibold 
                                        bg-linear-to-r from-blue-600 to-indigo-600 
                                        rounded-xl transition-all"
                                >
                                    <FaUserPlus className="text-sm" />
                                    <span>Cadastrar</span>
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
