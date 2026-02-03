"use client";

import { SessionProvider } from 'next-auth/react';

/**
 * SessionWrapper using NextAuth
 * This provides authentication context using JWT tokens stored in database
 * The JWT is automatically validated against the database on each request
 */
const SessionWrapper = ({ children }) => {
	return (
		<SessionProvider>
			{children}
		</SessionProvider>
	);
};

export default SessionWrapper;