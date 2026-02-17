import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import { withCsrf } from '@/utils/csrf';
import getUserNotifications from '@/models/Notifications/getUserNotifications';
import markAsRead from '@/models/Notifications/markAsRead';

/**
 * GET /api/notifications
 * Retrieves notifications for the authenticated user
 */
export const GET = withAuth(async (request, context, session) => {
	try {
		const user_id = session.user.id;
		const { searchParams } = new URL(request.url);

		const page = parseInt(searchParams.get('page')) || 1;
		const limit = parseInt(searchParams.get('limit')) || 20;
		const filter = searchParams.get('filter') || 'all';

		const result = await getUserNotifications(user_id, { page, limit, filter });

		if (!result.success) {
			return NextResponse.json(
				{ success: false, message: result.message },
				{ status: 400 }
			);
		}

		return NextResponse.json({
			success: true,
			notifications: result.notifications,
			unread_count: result.unread_count,
			pagination: result.pagination,
		}, { status: 200 });

	} catch (error) {
		console.error('Error in GET /api/notifications:', error);
		return NextResponse.json(
			{ success: false, message: 'Erro ao buscar notificações' },
			{ status: 500 }
		);
	}
});

/**
 * PATCH /api/notifications
 * Marks notifications as read
 * Body: { notification_id?: string } - if omitted, marks all as read
 */
export const PATCH = withAuth(withCsrf(async (request, context, session) => {
	try {
		const user_id = session.user.id;
		const body = await request.json();
		const { notification_id } = body;

		const result = await markAsRead(user_id, notification_id || null);

		if (!result.success) {
			return NextResponse.json(
				{ success: false, message: result.message },
				{ status: 400 }
			);
		}

		return NextResponse.json({
			success: true,
			message: result.message,
		}, { status: 200 });

	} catch (error) {
		console.error('Error in PATCH /api/notifications:', error);
		return NextResponse.json(
			{ success: false, message: 'Erro ao atualizar notificações' },
			{ status: 500 }
		);
	}
}));
