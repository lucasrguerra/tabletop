"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/utils/useAuth';
import {
	FaShieldAlt,
	FaTachometerAlt,
	FaBook,
	FaGraduationCap,
	FaSignOutAlt,
	FaBars,
	FaTimes,
	FaLock,
	FaPlus,
	FaChevronRight,
	FaArrowRight,
	FaCrown
} from 'react-icons/fa';
import NotificationBell from '@/components/Dashboard/NotificationBell';
import ThemeToggle from '@/components/ThemeToggle';

export default function DashboardLayout({ children }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const { data: session } = useSession();
	const { logout } = useAuth();
	const pathname = usePathname();

	// Handle scroll for header effects
	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 10);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// Close sidebar on escape key
	useEffect(() => {
		const handleEscape = (e) => {
			if (e.key === 'Escape' && sidebarOpen) {
				setSidebarOpen(false);
			}
		};
		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [sidebarOpen]);

	// Prevent body scroll when sidebar is open
	useEffect(() => {
		if (sidebarOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [sidebarOpen]);

	const menuItems = [
		{
			name: 'Dashboard',
			href: '/dashboard',
			icon: FaTachometerAlt,
			exact: true
		},
		{
			name: 'Treinamentos',
			href: '/dashboard/trainings',
			icon: FaBook,
			exact: false
		},
		{
			name: 'Estudos',
			href: '/dashboard/studies',
			icon: FaGraduationCap,
			exact: false
		},
		{
			name: 'Sessões Ativas',
			href: '/dashboard/sessions',
			icon: FaLock,
			exact: false
		}
	];

	if (session?.user?.admin) {
		menuItems.push({
			name: 'Administração',
			href: '/dashboard/admin',
			icon: FaCrown,
			exact: false
		});
	}

	const handleLogout = async () => {
		if (confirm('Tem certeza que deseja sair?')) {
			await logout();
		}
	};

	const isActive = (item) => {
		if (item.exact) {
			return pathname === item.href;
		}
		return pathname.startsWith(item.href);
	};

	return (
		<div className="min-h-screen bg-linear-to-br from-slate-50 via-gray-50 to-zinc-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
			{/* Sidebar Backdrop with blur effect */}
			<div 
				className={`
					fixed inset-0 z-40 transition-all duration-300
					${sidebarOpen 
						? 'opacity-100 pointer-events-auto' 
						: 'opacity-0 pointer-events-none'
					}
				`}
				onClick={() => setSidebarOpen(false)}
			>
				<div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" />
			</div>

			{/* Sidebar - Collapsible on ALL screens */}
			<aside
				className={`
					fixed top-0 left-0 z-50 h-screen w-80 sm:w-72
					bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
					border-r border-slate-200/80 dark:border-slate-800
					shadow-2xl shadow-slate-900/10 dark:shadow-slate-950/50
					transform transition-all duration-300 ease-out flex flex-col
					${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
				`}
			>
				{/* Sidebar Header */}
				<div className="flex items-center justify-between h-16 px-5 border-b border-slate-100 dark:border-slate-800">
					<div className="flex items-center gap-3">
						<div className="relative">
							<div className="absolute inset-0 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl blur opacity-40" />
							<div className="relative p-2.5 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
								<FaShieldAlt className="text-lg text-white" />
							</div>
						</div>
						<div>
							<h2 className="text-base font-bold text-slate-900 dark:text-white">Tabletop</h2>
							<p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">Plataforma</p>
						</div>
					</div>
					<button
						onClick={() => setSidebarOpen(false)}
						className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
						aria-label="Fechar menu"
					>
						<FaTimes className="text-lg" />
					</button>
				</div>

				{/* User Profile Section */}
				<div className="px-4 py-5 border-b border-slate-100 dark:border-slate-800">
					<div className="flex items-center gap-3">
						<div className="relative">
							<div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
								<span className="text-lg font-bold text-white">
									{session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
								</span>
							</div>
							<div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
								{session?.user?.name}
							</p>
							<p className="text-xs text-slate-500 dark:text-slate-400 truncate">
								@{session?.user?.nickname}
							</p>
						</div>
					</div>
				</div>

				{/* Navigation Menu */}
				<div className="flex-1 overflow-y-auto custom-scrollbar">
					<div className="px-3 py-5">
						<p className="px-3 mb-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
							Menu Principal
						</p>
						<nav className="space-y-1">
							{menuItems.map((item) => {
								const Icon = item.icon;
								const active = isActive(item);

								return (
									<Link
										key={item.href}
										href={item.href}
										className={`
											group relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium
											transition-all duration-200 overflow-hidden
											${active
												? 'text-white'
												: 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
											}
										`}
										onClick={() => setSidebarOpen(false)}
									>
										{/* Active background with gradient */}
										{active && (
											<div className="absolute inset-0 bg-linear-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30" />
										)}
										
										<div className={`
											relative z-10 p-2 rounded-lg transition-all duration-200
											${active 
												? 'bg-white/20 dark:bg-slate-900/20' 
												: 'bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
											}
										`}>
											<Icon className={`text-base ${active ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`} />
										</div>
										<span className="relative z-10 flex-1">{item.name}</span>
										<FaChevronRight className={`
											relative z-10 text-xs transition-all duration-200 opacity-0 -translate-x-2
											${active ? 'opacity-100 translate-x-0' : 'group-hover:opacity-60 group-hover:translate-x-0'}
										`} />
									</Link>
								);
							})}
						</nav>
					</div>

					{/* Quick Actions */}
				{session?.user?.facilitator && (
					<div className="px-3 pb-5">
						<p className="px-3 mb-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
							Ações Rápidas
						</p>
						<Link
							href="/dashboard/trainings/new"
							className="group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/50 dark:hover:to-teal-900/50 border border-emerald-200/60 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700 text-emerald-700 dark:text-emerald-300 transition-all duration-200"
							onClick={() => setSidebarOpen(false)}
						>
							<div className="p-2 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
								<FaPlus className="text-sm text-white" />
							</div>
							<span className="flex-1">Novo Treinamento</span>
							<FaArrowRight className="text-xs opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
						</Link>
					</div>
				)}

				{/* Admin Quick Action */}
				{session?.user?.admin && (
					<div className="px-3 pb-5">
						<p className="px-3 mb-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
							Administração
						</p>
						<Link
							href="/dashboard/admin"
							className="group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium bg-linear-to-r from-rose-50 to-red-50 dark:from-rose-950/40 dark:to-red-950/40 hover:from-rose-100 hover:to-red-100 dark:hover:from-rose-900/50 dark:hover:to-red-900/50 border border-rose-200/60 dark:border-rose-800/60 hover:border-rose-300 dark:hover:border-rose-700 text-rose-700 dark:text-rose-300 transition-all duration-200"
							onClick={() => setSidebarOpen(false)}
						>
							<div className="p-2 rounded-lg bg-linear-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/25">
								<FaCrown className="text-sm text-white" />
							</div>
							<span className="flex-1">Painel Admin</span>
							<FaArrowRight className="text-xs opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
						</Link>
					</div>
				)}
				</div>
				
				{/* Bottom Section - Theme & Logout */}
				<div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
					<div className="flex items-center justify-between px-1">
						<span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tema Visual</span>
						<ThemeToggle />
					</div>
					<button
						onClick={handleLogout}
						className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
							text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400
							bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30
							border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800
							shadow-xs hover:shadow-sm
							transition-all duration-200"
					>
						<FaSignOutAlt className="text-sm" />
						<span>Encerrar Sessão</span>
					</button>
				</div>
			</aside>

			{/* Main Content Area */}
			<div className="min-h-screen flex flex-col">
				{/* Top Header - Refined & Professional */}
				<header 
					className={`
						sticky top-0 z-30 transition-all duration-300
						${scrolled 
							? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 shadow-lg shadow-slate-900/5 dark:shadow-slate-950/30' 
							: 'bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800'
						}
					`}
				>
					<div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 mx-auto max-w-7xl">
						<div className="flex items-center justify-between gap-4">
							{/* Left Section */}
							<div className="flex items-center gap-3 sm:gap-4">
								<button
									onClick={() => setSidebarOpen(true)}
									className="group p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
									aria-label="Abrir menu"
								>
									<FaBars className="text-lg group-hover:scale-110 transition-transform duration-200" />
								</button>

								<div className="hidden sm:flex items-center gap-3">
									<div className="relative">
										<div className="absolute inset-0 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl blur-xs opacity-40" />
										<div className="relative p-2 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
											<FaShieldAlt className="text-base text-white" />
										</div>
									</div>
									<div className="flex flex-col">
										<h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
											Tabletop App
										</h1>
										<p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase hidden lg:block">
											Resposta a Incidentes
										</p>
									</div>
								</div>

								{/* Mobile Logo */}
								<div className="sm:hidden flex items-center gap-2">
									<div className="p-1.5 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
										<FaShieldAlt className="text-sm text-white" />
									</div>
									<span className="text-base font-bold text-slate-900 dark:text-white">Tabletop</span>
								</div>
							</div>

							{/* Right Section */}
							<div className="flex items-center gap-2 sm:gap-3">
								{/* Theme Toggle Button */}
								<ThemeToggle />

								{/* Notification Bell */}
								<NotificationBell />

								{/* User Avatar & Info */}
								<div className="flex items-center gap-3">
									<div className="hidden md:flex flex-col items-end">
										<p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
											{session?.user?.name}
										</p>
										<p className="text-xs text-slate-500 dark:text-slate-400">
											@{session?.user?.nickname}
										</p>
									</div>
									<button 
										onClick={() => setSidebarOpen(true)}
										className="relative"
									>
										<div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-shadow duration-200">
											<span className="text-sm font-bold text-white">
												{session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
											</span>
										</div>
										<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
									</button>
								</div>
							</div>
						</div>
					</div>
				</header>

				{/* Page Content */}
				<main className="flex-1 p-4 sm:p-6 lg:p-8 mx-auto w-full max-w-7xl">
					{children}
				</main>
			</div>
		</div>
	);
}
