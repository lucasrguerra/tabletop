import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
	const httpServer = createServer((req, res) => {
		const parsedUrl = parse(req.url, true);
		handle(req, res, parsedUrl);
	});

	const io = new SocketIOServer(httpServer, {
		path: '/api/socketio',
		addTrailingSlash: false,
		cors: {
			origin: dev ? '*' : false,
			methods: ['GET', 'POST'],
		},
		transports: ['websocket', 'polling'],
	});

	// Store io instance globally so API routes can access it
	global.io = io;

	io.on('connection', (socket) => {
		console.log(`[Socket.io] Client connected: ${socket.id}`);

		// Join a training room for real-time updates
		socket.on('join-training', (trainingId) => {
			if (typeof trainingId === 'string' && trainingId.length > 0) {
				socket.join(`training:${trainingId}`);
				console.log(`[Socket.io] ${socket.id} joined training:${trainingId}`);
			}
		});

		// Leave a training room
		socket.on('leave-training', (trainingId) => {
			if (typeof trainingId === 'string' && trainingId.length > 0) {
				socket.leave(`training:${trainingId}`);
				console.log(`[Socket.io] ${socket.id} left training:${trainingId}`);
			}
		});

		// Join a user-specific room (for notifications)
		socket.on('join-user', (userId) => {
			if (typeof userId === 'string' && userId.length > 0) {
				socket.join(`user:${userId}`);
				console.log(`[Socket.io] ${socket.id} joined user:${userId}`);
			}
		});

		socket.on('disconnect', (reason) => {
			console.log(`[Socket.io] Client disconnected: ${socket.id} (${reason})`);
		});
	});

	httpServer.listen(port, hostname, () => {
		console.log(`> Ready on http://${hostname}:${port}`);
		console.log(`> Socket.io server running on path /api/socketio`);
	});
});
