'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io as ioClient } from 'socket.io-client';

/** @type {import('socket.io-client').Socket | null} */
let socketSingleton = null;
let refCount = 0;

/**
 * Returns (or creates) the shared Socket.io client singleton.
 */
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
 * Hook that connects to a training room via Socket.io.
 *
 * @param {string | null} trainingId - Training ID to join. Pass null to skip.
 * @returns {{ socket: import('socket.io-client').Socket | null, isConnected: boolean }}
 */
export default function useSocket(trainingId) {
	const [isConnected, setIsConnected] = useState(false);
	const currentRoom = useRef(null);

	useEffect(() => {
		if (!trainingId) return;

		const socket = getSocket();
		refCount++;

		const onConnect = () => {
			setIsConnected(true);
			// (Re-)join training room on connect / reconnect
			socket.emit('join-training', trainingId);
			currentRoom.current = trainingId;
		};

		const onDisconnect = () => {
			setIsConnected(false);
		};

		socket.on('connect', onConnect);
		socket.on('disconnect', onDisconnect);

		// If already connected, join immediately
		if (socket.connected) {
			onConnect();
		}

		return () => {
			socket.off('connect', onConnect);
			socket.off('disconnect', onDisconnect);

			if (currentRoom.current) {
				socket.emit('leave-training', currentRoom.current);
				currentRoom.current = null;
			}

			refCount--;
			if (refCount <= 0 && socketSingleton) {
				socketSingleton.disconnect();
				socketSingleton = null;
				refCount = 0;
			}
		};
	}, [trainingId]);

	return {
		socket: trainingId ? getSocket() : null,
		isConnected,
	};
}
