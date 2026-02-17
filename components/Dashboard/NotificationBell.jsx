"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaBell, FaCheck, FaCheckDouble, FaEnvelope, FaEnvelopeOpen, FaUserPlus, FaUserCheck, FaUserTimes } from 'react-icons/fa';

const NOTIFICATION_ICONS = {
	invite_received: FaUserPlus,
	invite_accepted: FaUserCheck,
	invite_declined: FaUserTimes,
};

const NOTIFICATION_COLORS = {
	invite_received: 'text-blue-500 bg-blue-50',
	invite_accepted: 'text-emerald-500 bg-emerald-50',
	invite_declined: 'text-red-500 bg-red-50',
};

function timeAgo(date) {
	const now = new Date();
	const diff = now - new Date(date);
	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);

	if (minutes < 1) return 'Agora';
	if (minutes < 60) return `${minutes}min`;
	if (hours < 24) return `${hours}h`;
	if (days < 7) return `${days}d`;
	return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export default function NotificationBell() {
	const [open, setOpen] = useState(false);
	const [notifications, setNotifications] = useState([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [loading, setLoading] = useState(false);
	const [filter, setFilter] = useState('all');
	const [csrfToken, setCsrfToken] = useState(null);
	const dropdownRef = useRef(null);
	const bellRef = useRef(null);
	const router = useRouter();

	// Fetch CSRF token
	useEffect(() => {
		const fetchCsrf = async () => {
			try {
				const res = await fetch('/api/csrf');
				const data = await res.json();
				if (data.success && data.csrf_token) {
					setCsrfToken(data.csrf_token);
				}
			} catch (err) {
				console.error('Error fetching CSRF token:', err);
			}
		};
		fetchCsrf();
	}, []);

	const fetchNotifications = useCallback(async () => {
		try {
			setLoading(true);
			const res = await fetch(`/api/notifications?filter=${filter}&limit=15`);
			const data = await res.json();
			if (data.success) {
				setNotifications(data.notifications);
				setUnreadCount(data.unread_count);
			}
		} catch (error) {
			console.error('Error fetching notifications:', error);
		} finally {
			setLoading(false);
		}
	}, [filter]);

	// Fetch notifications on mount and periodically
	useEffect(() => {
		fetchNotifications();
		const interval = setInterval(fetchNotifications, 30000);
		return () => clearInterval(interval);
	}, [fetchNotifications]);

	// Close dropdown on outside click
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (
				dropdownRef.current && !dropdownRef.current.contains(e.target) &&
				bellRef.current && !bellRef.current.contains(e.target)
			) {
				setOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// Close on Escape
	useEffect(() => {
		const handleEscape = (e) => {
			if (e.key === 'Escape') setOpen(false);
		};
		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, []);

	const markOneAsRead = async (notification_id) => {
		try {
			const res = await fetch('/api/notifications', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
				body: JSON.stringify({ notification_id }),
			});
			const data = await res.json();
			if (data.success) {
				setNotifications(prev =>
					prev.map(n => n.id === notification_id ? { ...n, is_read: true } : n)
				);
				setUnreadCount(prev => Math.max(0, prev - 1));
			}
		} catch (error) {
			console.error('Error marking notification as read:', error);
		}
	};

	const markAllAsRead = async () => {
		try {
			const res = await fetch('/api/notifications', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
				body: JSON.stringify({}),
			});
			const data = await res.json();
			if (data.success) {
				setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
				setUnreadCount(0);
			}
		} catch (error) {
			console.error('Error marking all as read:', error);
		}
	};

	const toggleOpen = () => {
		setOpen(prev => !prev);
		if (!open) {
			fetchNotifications();
		}
	};

	return (
		<div className="relative">
			{/* Bell Button */}
			<button
				ref={bellRef}
				onClick={toggleOpen}
				className="relative p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200"
				aria-label="Notificações"
			>
				<FaBell className="text-base" />
				{unreadCount > 0 && (
					<span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white shadow-sm">
						{unreadCount > 99 ? '99+' : unreadCount}
					</span>
				)}
			</button>

			{/* Dropdown */}
			{open && (
				<div
					ref={dropdownRef}
					className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-200/80 overflow-hidden z-50"
				>
					{/* Header */}
					<div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
						<h3 className="text-sm font-bold text-slate-900">Notificações</h3>
						<div className="flex items-center gap-2">
							{unreadCount > 0 && (
								<button
									onClick={markAllAsRead}
									className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
									title="Marcar todas como lidas"
								>
									<FaCheckDouble className="text-[10px]" />
									<span>Ler todas</span>
								</button>
							)}
						</div>
					</div>

					{/* Filter Tabs */}
					<div className="flex border-b border-slate-100">
						{[
							{ key: 'all', label: 'Todas' },
							{ key: 'unread', label: 'Não lidas' },
							{ key: 'read', label: 'Lidas' },
						].map(tab => (
							<button
								key={tab.key}
								onClick={() => setFilter(tab.key)}
								className={`flex-1 py-2 text-xs font-medium transition-colors ${
									filter === tab.key
										? 'text-blue-600 border-b-2 border-blue-600'
										: 'text-slate-500 hover:text-slate-700'
								}`}
							>
								{tab.label}
								{tab.key === 'unread' && unreadCount > 0 && (
									<span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded-full">
										{unreadCount}
									</span>
								)}
							</button>
						))}
					</div>

					{/* Notification List */}
					<div className="max-h-80 overflow-y-auto">
						{loading && notifications.length === 0 ? (
							<div className="flex items-center justify-center py-8">
								<div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
							</div>
						) : notifications.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-8 px-4">
								<div className="p-3 bg-slate-100 rounded-full mb-3">
									<FaBell className="text-lg text-slate-400" />
								</div>
								<p className="text-sm font-medium text-slate-500">Nenhuma notificação</p>
								<p className="text-xs text-slate-400 mt-1">
									{filter === 'unread' ? 'Todas as notificações foram lidas' : 'Você ainda não tem notificações'}
								</p>
							</div>
						) : (
							notifications.map(notification => {
								const Icon = NOTIFICATION_ICONS[notification.type] || FaBell;
								const colorClass = NOTIFICATION_COLORS[notification.type] || 'text-slate-500 bg-slate-50';

								return (
									<div
										key={notification.id}
										className={`flex items-start gap-3 px-4 py-3 border-b border-slate-50 transition-colors cursor-pointer hover:bg-slate-50 ${
											!notification.is_read ? 'bg-blue-50/40' : ''
										}`}
										onClick={() => {
											if (!notification.is_read) {
												markOneAsRead(notification.id);
											}
											if (notification.type === 'invite_received') {
												setOpen(false);
												router.push('/dashboard/trainings/invites');
											}
										}}
									>
										{/* Icon */}
										<div className={`shrink-0 p-2 rounded-lg ${colorClass}`}>
											<Icon className="text-sm" />
										</div>

										{/* Content */}
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2">
												<p className={`text-xs font-semibold truncate ${!notification.is_read ? 'text-slate-900' : 'text-slate-600'}`}>
													{notification.title}
												</p>
												{!notification.is_read && (
													<span className="shrink-0 w-2 h-2 bg-blue-500 rounded-full" />
												)}
											</div>
											<p className={`text-xs mt-0.5 line-clamp-2 ${!notification.is_read ? 'text-slate-700' : 'text-slate-500'}`}>
												{notification.message}
											</p>
											<p className="text-[10px] text-slate-400 mt-1">
												{timeAgo(notification.created_at)}
											</p>
										</div>

										{/* Read indicator */}
										<div className="shrink-0 pt-1">
											{notification.is_read ? (
												<FaEnvelopeOpen className="text-xs text-slate-300" />
											) : (
												<FaEnvelope className="text-xs text-blue-400" />
											)}
										</div>
									</div>
								);
							})
						)}
					</div>
				</div>
			)}
		</div>
	);
}
