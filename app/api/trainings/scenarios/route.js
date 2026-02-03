import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import getScenarios from '@/models/Trainings/getScenarios';

/**
 * GET /api/trainings/scenarios?category_id=NET_VOL&type_id=NET_VOL_DNS_REFLECTION
 * Returns all available scenarios for a specific incident type
 * Requires authentication
 */
export const GET = withAuth(async (request) => {
	try {
		const { searchParams } = new URL(request.url);
		const category_id = searchParams.get('category_id');
		const type_id = searchParams.get('type_id');

		if (!category_id || !type_id) {
			return NextResponse.json(
				{
					success: false,
					message: 'Parâmetros category_id e type_id são obrigatórios'
				},
				{ status: 400 }
			);
		}

		const result = await getScenarios(category_id, type_id);
		
		if (!result.success) {
			return NextResponse.json(
				{
					success: false,
					message: result.message
				},
				{ status: 500 }
			);
		}
		
		return NextResponse.json({
			success: true,
			scenarios: result.scenarios,
			count: result.count
		});
		
	} catch (error) {
		console.error('Error in GET /api/trainings/scenarios:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Erro ao buscar cenários'
			},
			{ status: 500 }
		);
	}
});
