import { NextResponse } from 'next/server';
import { withAdmin } from '@/utils/auth';
import getAllTrainings from '@/models/Admin/getAllTrainings';

export const GET = withAdmin(async (request, context, session) => {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const status = searchParams.get('status') || 'all';
        const search = searchParams.get('search') || '';

        const result = await getAllTrainings({ page, limit, status, search });

        if (!result.success) {
            return NextResponse.json({ success: false, message: result.message }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            trainings: result.trainings,
            pagination: result.pagination,
        });
    } catch (error) {
        console.error('Error in GET /api/admin/trainings:', error);
        return NextResponse.json({ success: false, message: 'Erro ao buscar treinamentos' }, { status: 500 });
    }
});
