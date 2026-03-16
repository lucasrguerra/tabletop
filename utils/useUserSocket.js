'use client';

import { useEffect, useRef, useState } from 'react';
import { io as ioClient } from 'socket.io-client';

/** @type {import('socket.io-client').Socket | null} */
let socketSingleton = null;
let refCount = 0;

function getSocket() {
	if (!socketSingleton) {
		socketSingleton = ioClient({
			path: '/api/socketio',
			transports: ['websocket', 'polling'],
			reconnection: true,
			reconnectionAttempts: Infinity,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
		});
	}
	return socketSingleton;
}

/**
 * Hook that connects to a user-specific room for real-time notifications.
 *
 * @param {string | null} userId - User ID to join. Pass null to skip.
 * @returns {{ socket: import('socket.io-client').Socket | null, isConnected: boolean }}
 */
export default function useUserSocket(userId) {
	const [isConnected, setIsConnected] = useState(false);
	const currentRoom = useRef(null);

	useEffect(() => {
		if (!userId) return;

		const socket = getSocket();
		refCount++;

		const onConnect = () => {
			setIsConnected(true);
			socket.emit('join-user', userId);
			currentRoom.current = userId;
		};

		const onDisconnect = () => {
			setIsConnected(false);
		};

		socket.on('connect', onConnect);
		socket.on('disconnect', onDisconnect);

		if (socket.connected) {
			onConnect();
		}

		return () => {
			socket.off('connect', onConnect);
			socket.off('disconnect', onDisconnect);

			currentRoom.current = null;

			refCount--;
			if (refCount <= 0 && socketSingleton) {
				socketSingleton.disconnect();
				socketSingleton = null;
				refCount = 0;
			}
		};
	}, [userId]);

	return {
		socket: userId ? getSocket() : null,
		isConnected,
	};
}
