import { NextResponse } from 'next/server';
import { withAdmin } from '@/utils/auth';
import { withCsrf } from '@/utils/csrf';
import Training from '@/database/schemas/Training';
import Response from '@/database/schemas/Response';
import Evaluation from '@/database/schemas/Evaluation';
import connectDatabase from '@/database/database';
import mongoose from 'mongoose';

// Inline cascade logic — deliberately does NOT call deleteTraining() to bypass
// the facilitator ownership check that would prevent admins from deleting any training
export const DELETE = withAdmin(withCsrf(async (request, context, session) => {
    try {
        const params = await context.params;
        const trainingId = params.id;

        if (!mongoose.Types.ObjectId.isValid(trainingId)) {
            return NextResponse.json(
                { success: false, message: 'ID do treinamento inválido' },
                { status: 400 }
            );
        }

        await connectDatabase();

        const training = await Training.findById(trainingId);
        if (!training) {
            return NextResponse.json(
                { success: false, message: 'Treinamento não encontrado' },
                { status: 404 }
            );
        }

        await Response.deleteMany({ training_id: trainingId });
        await Evaluation.deleteMany({ training_id: trainingId });
        await Training.findByIdAndDelete(trainingId);

        return NextResponse.json({ success: true, message: 'Treinamento deletado com sucesso' });
    } catch (error) {
        console.error('Error in DELETE /api/admin/trainings/[id]:', error);
        return NextResponse.json({ success: false, message: 'Erro ao deletar treinamento' }, { status: 500 });
    }
}));
