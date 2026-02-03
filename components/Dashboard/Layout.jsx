"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/utils/useAuth';
import {
	FaShieldAlt,
	FaTachometerAlt,
	FaBook,
	FaCog,
	FaSignOutAlt,
	FaBars,
	FaTimes,
	FaUserCircle,
	FaLock
} from 'react-icons/fa';

export default function DashboardLayout({ children }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const { data: session } = useSession();
	const { logout } = useAuth();
	const pathname = usePathname();

	const menuItems = [
		{
			name: 'Dashboard',
			href: '/dashboard',
			icon: FaTachometerAlt
		},
		{
			name: 'Treinamentos',
			href: '/dashboard/trainings',
			icon: FaBook
		},
		{
			name: 'Configurações',
			href: '/dashboard/settings',
			icon: FaCog
		},
		{
			name: 'Sessões',
			href: '/dashboard/sessions',
			icon: FaLock
		}
	];

	const handleLogout = async () => {
		if (confirm('Tem certeza que deseja sair?')) {
			await logout();
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Sidebar backdrop */}
			<div className="fixed inset-0 bg-gray-900 opacity-50 z-40"
				style={{ display: sidebarOpen ? 'block' : 'none' }}
				onClick={() => setSidebarOpen(false)}
			></div>

			{/* Sidebar */}
			<aside
				className={`
					fixed top-0 left-0 z-50 h-screen w-70 sm:w-64 bg-white border-r border-gray-200 shadow-sm
					transform transition-transform duration-300 ease-in-out
					${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
				`}
			>
				{/* Close Button */}
				<div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200">
					<h2 className="text-sm font-semibold text-gray-700">Menu</h2>
					<button
						onClick={() => setSidebarOpen(false)}
						className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
						aria-label="Fechar menu"
					>
						<FaTimes className="text-lg" />
					</button>
				</div>

				{/* User Info */}
				<div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-linear-to-br from-blue-50 to-indigo-50">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-white rounded-full shadow-sm shrink-0">
							<FaUserCircle className="text-2xl text-blue-600" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-semibold text-gray-900 truncate">
								{session?.user?.name}
							</p>
							<p className="text-xs text-gray-600 truncate">
								{session?.user?.email}
							</p>
						</div>
					</div>
				</div>

				{/* Navigation Menu */}
				<div className="flex-1 overflow-y-auto">
					<div className="px-3 py-4">
						<p className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
							Navegação
						</p>
						<nav className="space-y-1">
							{menuItems.map((item) => {
								const Icon = item.icon;
								const isActive = pathname === item.href;

								return (
									<Link
										key={item.href}
										href={item.href}
										className={`
											flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
											transition-all duration-200
											${isActive
												? 'bg-blue-600 text-white shadow-sm'
												: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
											}
										`}
										onClick={() => setSidebarOpen(false)}
									>
										<Icon className={`text-lg shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
										<span>{item.name}</span>
									</Link>
								);
							})}
						</nav>
					</div>
				</div>
				
				{/* Bottom Buttons */}
				<div className="p-4 border-t border-gray-200 grid gap-3">
					{/* Create New Training Button */}
					<Link
						href="/dashboard/trainings/new"
						className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 border border-blue-200 hover:border-blue-300"
						onClick={() => setSidebarOpen(false)}
					>
						<FaShieldAlt className="text-base shrink-0" />
						<span>Novo Treinamento</span>
					</Link>

					{/* Logout Button */}
					<button
						onClick={handleLogout}
						className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 border border-red-200 hover:border-red-300"
					>
						<FaSignOutAlt className="text-base shrink-0" />
						<span>Sair</span>
					</button>
				</div>
			</aside>

			{/* Main Content */}
			<div>
				{/* Top Header */}
				<header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
					<div className="px-3 sm:px-4 lg:px-8 py-3 sm:py-4 mx-auto max-w-6xl">
						<div className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-3">
							<button
								onClick={() => setSidebarOpen(true)}
								className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all shrink-0"
							>
								<FaBars className="text-lg sm:text-xl" />
							</button>

							<div className="flex items-center gap-2">
								<div className="p-1.5 bg-blue-600 rounded-lg">
									<FaShieldAlt className="text-base sm:text-lg text-white" />
								</div>
								<h2 className="text-sm sm:text-lg font-bold text-gray-900">
									Tabletop App
								</h2>
							</div>
						</div>

						<div className="flex-1 min-w-0"></div>
							<div className="flex items-center gap-2 sm:gap-4 shrink-0">
								<div className="hidden md:block text-right min-w-0">
									<p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
										{session?.user?.name}
									</p>
									<p className="text-[10px] sm:text-xs text-gray-600 truncate">
										@{session?.user?.nickname}
									</p>
								</div>
							</div>
						</div>
					</div>
				</header>

				{/* Page Content */}
				<main className="p-3 sm:p-4 md:p-6 lg:p-8 mx-auto max-w-6xl">
					{children}
				</main>
			</div>
		</div>
	);
}
