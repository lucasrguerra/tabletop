import { NextResponse } from 'next/server';
import { withAuth } from '@/utils/auth';
import getCategories from '@/models/Trainings/getCategories';

/**
 * GET /api/trainings/categories
 * Returns all available incident categories and their types
 * Requires authentication
 */
export const GET = withAuth(async (request) => {
	try {
		const result = await getCategories();
		
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
			categories: result.categories
		});
		
	} catch (error) {
		console.error('Error in GET /api/trainings/categories:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Erro ao buscar categorias'
			},
			{ status: 500 }
		);
	}
});
