import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDatabase from '@/database/database';

export const dynamic = 'force-dynamic';

/**
 * GET endpoint used as container healthcheck
 * Reports application status and database connectivity
 */
export async function GET() {
	try {
		await connectDatabase();
		await mongoose.connection.db.admin().command({ ping: 1 });

		return NextResponse.json({
			success: true,
			status: 'ok',
			database: 'connected',
			uptime: process.uptime()
		});

	} catch (error) {
		console.error('Healthcheck error:', error);
		return NextResponse.json(
			{
				success: false,
				status: 'error',
				database: 'disconnected'
			},
			{ status: 503 }
		);
	}
}
