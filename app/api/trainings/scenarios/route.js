import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import getScenarios from '@/models/Trainings/getScenarios';
import readScenario from '@/models/Trainings/readScenario';

/**
 * GET /api/trainings/scenarios
 * 
 * Two modes:
 * 1. List scenarios: ?category_id=NET_VOL&type_id=NET_VOL_DNS_REFLECTION
 *    Returns all available scenarios for a specific incident type
 * 
 * 2. Get specific scenario: ?scenario_id=dns-amplification-attack&category=NET_VOL&type=NET_VOL_DNS_REFLECTION
 *    Returns full scenario data including rounds
 * 
 * Requires authentication
 */
export const GET = withAuth(async (request) => {
	try {
		const { searchParams } = new URL(request.url);
		
		// Check if requesting specific scenario (with rounds)
		const scenario_id = searchParams.get('scenario_id');
		const category = searchParams.get('category');
		const type = searchParams.get('type');
		
		if (scenario_id && category && type) {
			// Mode 2: Get specific scenario with rounds
			const result = await readScenario(scenario_id, category, type);

			if (!result.success) {
				return NextResponse.json(
					{
						success: false,
						message: result.message
					},
					{ status: 404 }
				);
			}

			return NextResponse.json({
				success: true,
				scenario: result.scenario
			}, { status: 200 });
		}
		
		// Mode 1: List scenarios
		const category_id = searchParams.get('category_id');
		const type_id = searchParams.get('type_id');

		if (!category_id || !type_id) {
			return NextResponse.json(
				{
					success: false,
					message: 'Parâmetros obrigatórios ausentes. Use category_id+type_id para listar ou scenario_id+category+type para obter cenário específico'
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
