"use client";

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook for authentication actions
 * Provides logout functionality with token revocation
 */
export function useAuth() {
	const router = useRouter();

	/**
	 * Logout user and revoke token in database
	 * @returns {Promise<Object>} Logout result
	 */
	const logout = async () => {
		try {
			// Call API to revoke token in database
			const response = await fetch('/api/auth/logout', {
				method: 'POST',
			});

			const data = await response.json();

			// Sign out from NextAuth (clear session)
			await signOut({ redirect: false });

			// Redirect to login page
			router.push('/login');
			router.refresh();

			return {
				success: true,
				message: data.message || 'Logout realizado com sucesso'
			};

		} catch (error) {
			console.error('Logout error:', error);
			
			// Even if database revocation fails, still sign out from NextAuth
			await signOut({ redirect: false });
			router.push('/login');

			return {
				success: false,
				message: 'Erro ao fazer logout, mas sessão foi encerrada'
			};
		}
	};

	return {
		logout
	};
}
