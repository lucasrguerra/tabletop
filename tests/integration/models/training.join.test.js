import { describe, it, expect, beforeAll } from 'vitest'
import mongoose from 'mongoose'
import connectDatabase from '@/database/database'
import Training from '@/database/schemas/Training'
import joinTraining from '@/models/Trainings/joinTraining'
import { useTestDatabase } from '../../setup/database'

const oid = () => new mongoose.Types.ObjectId()

async function createTraining(overrides = {}) {
	const facilitatorId = oid()
	return Training.create({
		name: 'Treinamento de Teste',
		description: 'Cenário de teste',
		created_by: facilitatorId,
		scenario: {
			id: 's1',
			category: 'DDOS',
			type: 'DNS_AMPLIFICATION',
			title: 'DNS Amplification',
			description: 'Ataque de amplificação',
		},
		access_type: 'open',
		max_participants: 3,
		status: 'not_started',
		participants: [
			{ user_id: facilitatorId, role: 'facilitator', status: 'accepted', joined_at: new Date() },
		],
		...overrides,
	})
}

describe('joinTraining() — integração', () => {
	beforeAll(async () => {
		await connectDatabase()
	})

	useTestDatabase()

	it('adiciona o usuário como participante aceito', async () => {
		const training = await createTraining()
		const userId = oid().toString()

		const result = await joinTraining(training._id.toString(), userId)

		expect(result.success).toBe(true)
		const updated = await Training.findById(training._id).lean()
		const joined = updated.participants.find(p => p.user_id.toString() === userId)
		expect(joined.role).toBe('participant')
		expect(joined.status).toBe('accepted')
	})

	it('rejeita entrada duplicada', async () => {
		const training = await createTraining()
		const userId = oid().toString()

		await joinTraining(training._id.toString(), userId)
		const second = await joinTraining(training._id.toString(), userId)

		expect(second.success).toBe(false)
		expect(second.message).toContain('já está participando')
	})

	it('rejeita entrada em treinamento finalizado', async () => {
		const training = await createTraining({ status: 'completed' })

		const result = await joinTraining(training._id.toString(), oid().toString())

		expect(result.success).toBe(false)
		expect(result.message).toContain('finalizado')
	})

	it('rejeita ID de treinamento malformado', async () => {
		const result = await joinTraining('nao-e-um-objectid', oid().toString())
		expect(result.success).toBe(false)
		expect(result.message).toContain('inválido')
	})

	it('exige user_id', async () => {
		const training = await createTraining()
		const result = await joinTraining(training._id.toString(), null)
		expect(result.success).toBe(false)
	})

	it('bloqueia quando a lotação de aceitos foi atingida', async () => {
		const training = await createTraining({ max_participants: 2 })
		// facilitador (1) + 1 participante = 2 aceitos
		await joinTraining(training._id.toString(), oid().toString())

		const result = await joinTraining(training._id.toString(), oid().toString())

		expect(result.success).toBe(false)
		expect(result.message).toContain('máximo de participantes')
	})

	// Regressão: joinTraining contava training.participants.length (todos os
	// status), enquanto inviteParticipant e respondToInvite contam apenas os
	// aceitos. Convites recusados/pendentes ocupavam vaga para sempre e
	// travavam a entrada por código ou link aberto.
	it('não conta convites pendentes ou recusados na lotação', async () => {
		const facilitatorId = oid()
		const training = await createTraining({
			max_participants: 2,
			participants: [
				{ user_id: facilitatorId, role: 'facilitator', status: 'accepted', joined_at: new Date() },
				{ user_id: oid(), role: 'participant', status: 'declined', joined_at: new Date() },
				{ user_id: oid(), role: 'participant', status: 'pending', joined_at: new Date() },
			],
		})

		const result = await joinTraining(training._id.toString(), oid().toString())

		expect(result.success).toBe(true)
	})

	// Regressão: as validações rodavam sobre um snapshot lido antes do save,
	// então requisições simultâneas passavam todas pela checagem de lotação e
	// o array de participantes estourava max_participants. O push agora é
	// atômico e reafirma os invariantes no próprio filtro do update.
	describe('concorrência', () => {
		it('não ultrapassa max_participants com entradas simultâneas', async () => {
			const facilitatorId = oid()
			const training = await createTraining({
				max_participants: 4, // facilitador + 3 vagas
				participants: [
					{ user_id: facilitatorId, role: 'facilitator', status: 'accepted', joined_at: new Date() },
				],
			})

			const candidates = Array.from({ length: 10 }, () => oid().toString())
			const results = await Promise.all(
				candidates.map(id => joinTraining(training._id.toString(), id))
			)

			const accepted = results.filter(r => r.success).length
			expect(accepted).toBe(3)

			const updated = await Training.findById(training._id).lean()
			const acceptedInDb = updated.participants.filter(p => p.status === 'accepted').length
			expect(acceptedInDb).toBe(4)
			expect(acceptedInDb).toBeLessThanOrEqual(updated.max_participants)
		})

		it('o mesmo usuário entrando em paralelo é adicionado uma única vez', async () => {
			const training = await createTraining({ max_participants: 10 })
			const userId = oid().toString()

			const results = await Promise.all(
				Array.from({ length: 5 }, () => joinTraining(training._id.toString(), userId))
			)

			expect(results.filter(r => r.success)).toHaveLength(1)

			const updated = await Training.findById(training._id).lean()
			const occurrences = updated.participants.filter(p => p.user_id.toString() === userId)
			expect(occurrences).toHaveLength(1)
		})
	})

	describe('entrada por código de acesso', () => {
		it('encontra o treinamento pelo código', async () => {
			const training = await createTraining({ access_type: 'code', access_code: 'ABCD1234' })

			const result = await joinTraining(null, oid().toString(), { access_code: 'ABCD1234' })

			expect(result.success).toBe(true)
			expect(result.training.id).toBe(training._id.toString())
		})

		it('rejeita código incorreto ao entrar por ID', async () => {
			const training = await createTraining({ access_type: 'code', access_code: 'ABCD1234' })

			const result = await joinTraining(training._id.toString(), oid().toString(), {
				access_code: 'WXYZ9999',
			})

			expect(result.success).toBe(false)
			expect(result.message).toContain('incorreto')
		})

		it('exige código para treinamento protegido', async () => {
			const training = await createTraining({ access_type: 'code', access_code: 'ABCD1234' })

			const result = await joinTraining(training._id.toString(), oid().toString())

			expect(result.success).toBe(false)
			expect(result.message).toContain('obrigatório')
		})

		it('rejeita código com formato inválido sem consultar o banco', async () => {
			const result = await joinTraining(null, oid().toString(), { access_code: 'a b' })
			expect(result.success).toBe(false)
			expect(result.message).toContain('inválido')
		})

		it('não encontra treinamento finalizado pelo código', async () => {
			await createTraining({ access_type: 'code', access_code: 'ABCD1234', status: 'completed' })

			const result = await joinTraining(null, oid().toString(), { access_code: 'ABCD1234' })

			expect(result.success).toBe(false)
		})

		it('exige training_id ou access_code', async () => {
			const result = await joinTraining(null, oid().toString(), {})
			expect(result.success).toBe(false)
			expect(result.message).toContain('obrigatório')
		})
	})
})
