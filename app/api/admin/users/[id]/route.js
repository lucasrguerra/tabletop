import { NextResponse } from 'next/server';
import { withAdmin } from '@/utils/auth';
import { withCsrf } from '@/utils/csrf';
import updateUser from '@/models/Admin/updateUser';
import deleteUser from '@/models/Admin/deleteUser';

export const PATCH = withAdmin(withCsrf(async (request, context, session) => {
    try {
        const params = await context.params;
        const userId = params.id;
        const body = await request.json();

        const result = await updateUser(userId, { facilitator: body.facilitator });

        if (!result.success) {
            return NextResponse.json({ success: false, message: result.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, user: result.user });
    } catch (error) {
        console.error('Error in PATCH /api/admin/users/[id]:', error);
        return NextResponse.json({ success: false, message: 'Erro ao atualizar usuário' }, { status: 500 });
    }
}));

export const DELETE = withAdmin(withCsrf(async (request, context, session) => {
    try {
        const params = await context.params;
        const userId = params.id;

        if (userId === session.user.id) {
            return NextResponse.json(
                { success: false, message: 'Você não pode deletar sua própria conta' },
                { status: 400 }
            );
        }

        const result = await deleteUser(userId);

        if (!result.success) {
            return NextResponse.json({ success: false, message: result.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: result.message });
    } catch (error) {
        console.error('Error in DELETE /api/admin/users/[id]:', error);
        return NextResponse.json({ success: false, message: 'Erro ao deletar usuário' }, { status: 500 });
    }
}));
