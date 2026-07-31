import { describe, it, expect } from 'vitest'
import mongoose from 'mongoose'
import { filterTrainingByRole } from '@/utils/trainingAuth'

const oid = () => new mongoose.Types.ObjectId()

function makeTraining(overrides = {}) {
	const creatorId = oid()
	return {
		_id: oid(),
		name: 'Treinamento DDoS',
		description: 'Simulação',
		created_by: { _id: creatorId, name: 'Ana', nickname: 'ana', email: 'ana@ex.com' },
		scenario: { id: 's1', category: 'DDOS', type: 'DNS' },
		access_type: 'code',
		access_code: 'SEGREDO1',
		max_participants: 10,
		status: 'active',
		current_round: 2,
		participants: [
			{
				user_id: { _id: creatorId, name: 'Ana', nickname: 'ana', email: 'ana@ex.com' },
				role: 'facilitator', status: 'accepted', joined_at: new Date(),
			},
			{
				user_id: { _id: oid(), name: 'Bruno', nickname: 'bruno', email: 'bruno@ex.com' },
				role: 'participant', status: 'accepted', joined_at: new Date(),
			},
			{
				user_id: { _id: oid(), name: 'Carla', nickname: 'carla', email: 'carla@ex.com' },
				role: 'participant', status: 'pending', joined_at: new Date(),
			},
		],
		created_at: new Date(),
		started_at: null,
		completed_at: null,
		...overrides,
	}
}

describe('filterTrainingByRole', () => {
	it('expõe access_code e emails apenas para o facilitador', () => {
		const out = filterTrainingByRole(makeTraining(), 'facilitator')

		expect(out.access_code).toBe('SEGREDO1')
		expect(out.participants).toHaveLength(3) // inclui o pendente
		expect(out.participants[1].user.email).toBe('bruno@ex.com')
		expect(out.participants[1].status).toBe('accepted')
	})

	it('nunca vaza access_code nem email para participante', () => {
		const out = filterTrainingByRole(makeTraining(), 'participant')

		expect(out.access_code).toBeUndefined()
		expect(out.participants).toHaveLength(2) // apenas os aceitos
		for (const p of out.participants) {
			expect(p.user.email).toBeUndefined()
		}
	})

	it('nunca vaza access_code para observador', () => {
		const out = filterTrainingByRole(makeTraining(), 'observer')
		expect(out.access_code).toBeUndefined()
	})

	it('participants_count reflete a lista já filtrada', () => {
		expect(filterTrainingByRole(makeTraining(), 'facilitator').participants_count).toBe(3)
		expect(filterTrainingByRole(makeTraining(), 'participant').participants_count).toBe(2)
	})

	// Regressão: created_by não é limpo quando uma conta é deletada (deleteUser
	// preserva os treinamentos criados). Com o populate retornando null, o acesso
	// direto a created_by._id lançava TypeError e derrubava com 500 TODA rota de
	// treinamento — inclusive para os demais participantes.
	it('não quebra quando o criador do treinamento foi deletado', () => {
		const training = makeTraining({ created_by: null })

		expect(() => filterTrainingByRole(training, 'facilitator')).not.toThrow()
		const out = filterTrainingByRole(training, 'facilitator')
		expect(out.created_by.id).toBeNull()
		expect(out.created_by.name).toBe('Usuário removido')
	})

	// Regressão: mesma classe de bug em participants[].user_id.
	it('ignora participantes cujo usuário foi deletado', () => {
		const training = makeTraining()
		training.participants.push({
			user_id: null, role: 'participant', status: 'accepted', joined_at: new Date(),
		})

		expect(() => filterTrainingByRole(training, 'facilitator')).not.toThrow()
		expect(filterTrainingByRole(training, 'facilitator').participants).toHaveLength(3)
		expect(filterTrainingByRole(training, 'participant').participants).toHaveLength(2)
	})

	it('trata timers ausentes como pausados', () => {
		const out = filterTrainingByRole(makeTraining({ training_timer: undefined }), 'participant')
		expect(out.training_timer.is_paused).toBe(true)
		expect(out.training_timer.elapsed_time).toBe(0)
	})
})
