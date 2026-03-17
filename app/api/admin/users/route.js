import { NextResponse } from 'next/server';
import { withAdmin } from '@/utils/auth';
import getUsers from '@/models/Admin/getUsers';

export const GET = withAdmin(async (request, context, session) => {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const search = searchParams.get('search') || '';

        const result = await getUsers({ page, limit, search });

        if (!result.success) {
            return NextResponse.json({ success: false, message: result.message }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            users: result.users,
            pagination: result.pagination,
        });
    } catch (error) {
        console.error('Error in GET /api/admin/users:', error);
        return NextResponse.json({ success: false, message: 'Erro ao buscar usuários' }, { status: 500 });
    }
});
