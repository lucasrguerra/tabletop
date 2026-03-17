import { NextResponse } from 'next/server';
import { withAdmin } from '@/utils/auth';
import getStats from '@/models/Admin/getStats';

export const GET = withAdmin(async (request, context, session) => {
    try {
        const result = await getStats();

        if (!result.success) {
            return NextResponse.json({ success: false, message: result.message }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in GET /api/admin/stats:', error);
        return NextResponse.json({ success: false, message: 'Erro ao buscar estatísticas' }, { status: 500 });
    }
});
