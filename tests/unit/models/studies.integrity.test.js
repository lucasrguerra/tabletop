import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import path from 'path'

const STUDIES_DIR = path.resolve(process.cwd(), 'studies')

function listJsonFiles(dir) {
	const out = []
	for (const entry of readdirSync(dir)) {
		const full = path.join(dir, entry)
		if (statSync(full).isDirectory()) { out.push(...listJsonFiles(full)) }
		else if (entry.endsWith('.json')) { out.push(full) }
	}
	return out
}

const files = listJsonFiles(STUDIES_DIR)
const articles = files.map(file => ({
	file: path.relative(process.cwd(), file),
	data: JSON.parse(readFileSync(file, 'utf-8')),
}))

const ids = new Set(articles.map(a => a.data.id))
const byType = (type) => articles.filter(a => a.data.content_type === type)

describe('integridade da biblioteca de estudos', () => {
	it('encontra artigos para validar', () => {
		expect(articles.length).toBeGreaterThan(0)
	})

	it('todo artigo tem id, título, descrição, categoria e tipo', () => {
		const invalidos = articles
			.filter(({ data }) =>
				!data.id || !data.title || !data.description ||
				!data.category?.id || !data.content_type
			)
			.map(a => a.file)
		expect(invalidos).toEqual([])
	})

	it('ids são únicos', () => {
		const seen = new Map()
		const duplicados = []
		for (const { file, data } of articles) {
			if (seen.has(data.id)) { duplicados.push(`${data.id}: ${seen.get(data.id)} e ${file}`) }
			seen.set(data.id, file)
		}
		expect(duplicados).toEqual([])
	})

	it('content_type é um dos tipos que a interface sabe renderizar', () => {
		const conhecidos = ['CONCEITO', 'PROCEDIMENTO', 'FERRAMENTA', 'GLOSSARIO']
		const invalidos = articles
			.filter(({ data }) => !conhecidos.includes(data.content_type))
			.map(a => `${a.file}: ${a.data.content_type}`)
		expect(invalidos).toEqual([])
	})

	it('relatedStudies aponta para artigos existentes', () => {
		const quebrados = []
		for (const { file, data } of articles) {
			for (const ref of (data.relatedStudies || [])) {
				if (!ids.has(ref)) { quebrados.push(`${file} → ${ref}`) }
			}
		}
		expect(quebrados).toEqual([])
	})

	it('prerequisites apontam para artigos existentes', () => {
		const quebrados = []
		for (const { file, data } of articles) {
			for (const ref of (data.metadata?.prerequisites || [])) {
				if (!ids.has(ref)) { quebrados.push(`${file} → ${ref}`) }
			}
		}
		expect(quebrados).toEqual([])
	})

	describe('CONCEITO', () => {
		it('tem seções com id, título, corpo e pontos-chave', () => {
			const invalidos = []
			for (const { file, data } of byType('CONCEITO')) {
				for (const s of (data.content?.sections || [])) {
					if (!s.id || !s.title || !s.body || !(s.keyPoints?.length)) {
						invalidos.push(`${file} → ${s.id || '(sem id)'}`)
					}
				}
			}
			expect(invalidos).toEqual([])
		})

		// O renderizador exibe callout e codeBlock; ficavam ausentes em 34 das
		// 56 seções, deixando o artigo só com texto corrido.
		it('toda seção traz um callout e um bloco de código', () => {
			const incompletas = []
			for (const { file, data } of byType('CONCEITO')) {
				for (const s of (data.content?.sections || [])) {
					if (!s.callout?.text) { incompletas.push(`${file} → ${s.id}: sem callout`) }
					if (!s.codeBlock?.code) { incompletas.push(`${file} → ${s.id}: sem codeBlock`) }
				}
			}
			expect(incompletas).toEqual([])
		})

		it('callouts usam um tipo que o renderizador conhece', () => {
			const conhecidos = ['info', 'warning', 'tip', 'danger']
			const invalidos = []
			for (const { file, data } of byType('CONCEITO')) {
				for (const s of (data.content?.sections || [])) {
					if (s.callout && !conhecidos.includes(s.callout.type)) {
						invalidos.push(`${file} → ${s.id}: ${s.callout.type}`)
					}
				}
			}
			expect(invalidos).toEqual([])
		})

		it('blocos de código declaram a linguagem', () => {
			const semLinguagem = []
			for (const { file, data } of byType('CONCEITO')) {
				for (const s of (data.content?.sections || [])) {
					if (s.codeBlock && !s.codeBlock.language) {
						semLinguagem.push(`${file} → ${s.id}`)
					}
				}
			}
			expect(semLinguagem).toEqual([])
		})
	})

	describe('FERRAMENTA', () => {
		// O renderizador exibe toolVersion e installHint; ficavam vazios na
		// maioria dos arquivos, deixando um bloco em branco na interface.
		it('declara versão e instruções de instalação', () => {
			const faltando = byType('FERRAMENTA')
				.filter(({ data }) => !data.content?.toolVersion || !data.content?.installHint)
				.map(a => a.file)
			expect(faltando).toEqual([])
		})

		it('todo comando tem sintaxe, descrição e interpretação', () => {
			const invalidos = []
			for (const { file, data } of byType('FERRAMENTA')) {
				for (const cmd of (data.content?.commands || [])) {
					if (!cmd.command || !cmd.description) {
						invalidos.push(`${file} → ${cmd.command || '(sem comando)'}`)
					}
				}
			}
			expect(invalidos).toEqual([])
		})
	})

	describe('PROCEDIMENTO', () => {
		// Passo que altera estado precisa dizer como desfazer. Estes são os
		// únicos puramente diagnósticos — executam apenas comandos de leitura
		// (show, mtr, grep) e não há nada a reverter. O renderizador omite o
		// bloco quando ausente, então não fica espaço vazio na interface.
		// Qualquer passo novo entra na exigência a menos que seja listado aqui.
		const SOMENTE_LEITURA = new Set([
			'ospf-procedimento-troubleshoot#1',        // show ip ospf neighbor
			'ospf-procedimento-troubleshoot#2',        // ping / show arp
			'ospf-procedimento-troubleshoot#3',        // show ip ospf interface
			'ospf-procedimento-troubleshoot#6',        // show ip route ospf
			'dns-procedimento-mitigacao-ddos#1',       // snmpwalk / nfdump
			'tcp-procedimento-mitigacao-syn#1',        // netstat / tcpdump
			'stp-procedimento-troubleshoot#1',         // show processes cpu
			'packet-loss-procedimento-diagnostico#1',  // medição perfSONAR
			'packet-loss-procedimento-diagnostico#2',  // mtr / pscheduler trace
			'packet-loss-procedimento-diagnostico#3',  // show interfaces
			'packet-loss-procedimento-diagnostico#4',  // interpretação de contadores
			'sql-procedimento-hardening#1',            // grep na base de código
			'sql-procedimento-hardening#3',            // priorização em planilha
		])

		it('todo passo que altera estado descreve como reverter', () => {
			const semRollback = []
			for (const { file, data } of byType('PROCEDIMENTO')) {
				for (const step of (data.content?.steps || [])) {
					const chave = `${data.id}#${step.id}`
					if (SOMENTE_LEITURA.has(chave)) { continue }
					if (!step.rollbackAction) {
						semRollback.push(`${file} → [${step.id}] ${step.title}`)
					}
				}
			}
			expect(semRollback).toEqual([])
		})

		it('a lista de passos somente-leitura não tem entradas obsoletas', () => {
			const existentes = new Set()
			for (const { data } of byType('PROCEDIMENTO')) {
				for (const step of (data.content?.steps || [])) {
					existentes.add(`${data.id}#${step.id}`)
				}
			}
			const obsoletas = [...SOMENTE_LEITURA].filter(k => !existentes.has(k))
			expect(obsoletas).toEqual([])
		})

		it('tem contexto e passos com título, descrição e resultado esperado', () => {
			const invalidos = []
			for (const { file, data } of byType('PROCEDIMENTO')) {
				if (!data.content?.context) { invalidos.push(`${file}: sem context`) }
				for (const step of (data.content?.steps || [])) {
					if (!step.title || !step.description || !step.expectedResult) {
						invalidos.push(`${file} → ${step.id || step.title || '(passo sem id)'}`)
					}
				}
			}
			expect(invalidos).toEqual([])
		})
	})

	describe('GLOSSARIO', () => {
		it('todo termo tem definição', () => {
			const invalidos = []
			for (const { file, data } of byType('GLOSSARIO')) {
				for (const t of (data.content?.terms || [])) {
					if (!t.term || !t.definition) { invalidos.push(`${file} → ${t.term || '(sem termo)'}`) }
				}
			}
			expect(invalidos).toEqual([])
		})

		// Termos cujo conceito ainda não tem artigo que o desenvolva. Apontar
		// para um artigo apenas parecido seria pior que deixar sem link, então
		// a lacuna fica registrada aqui — é a fila de conteúdo a escrever.
		const SEM_ARTIGO_AINDA = new Set([
			'PDoS (Permanent Denial of Service)',      // firmware/bricking não é coberto
			'EDoS (Economic Denial of Sustainability)', // custo em nuvem elástica
			'Yo-Yo DoS (Ataque Yo-Yo)',                // autoescalonamento
		])

		// Cada termo leva o leitor ao artigo que o desenvolve — era o campo mais
		// vazio da biblioteca (56 de 71 termos sem link).
		it('todo termo aponta para um artigo que o aprofunda', () => {
			const semLink = []
			for (const { file, data } of byType('GLOSSARIO')) {
				for (const t of (data.content?.terms || [])) {
					if (SEM_ARTIGO_AINDA.has(t.term)) { continue }
					if (!t.relatedStudyId) { semLink.push(`${file} → ${t.term}`) }
				}
			}
			expect(semLink).toEqual([])
		})

		it('a lista de termos sem artigo não tem entradas obsoletas', () => {
			const existentes = new Set()
			for (const { data } of byType('GLOSSARIO')) {
				for (const t of (data.content?.terms || [])) { existentes.add(t.term) }
			}
			const obsoletas = [...SEM_ARTIGO_AINDA].filter(k => !existentes.has(k))
			expect(obsoletas).toEqual([])
		})

		it('os links dos termos apontam para artigos existentes e não-glossário', () => {
			const glossarios = new Set(byType('GLOSSARIO').map(a => a.data.id))
			const quebrados = []
			for (const { file, data } of byType('GLOSSARIO')) {
				for (const t of (data.content?.terms || [])) {
					if (!t.relatedStudyId) { continue }
					if (!ids.has(t.relatedStudyId)) {
						quebrados.push(`${file} → ${t.term} → ${t.relatedStudyId} (inexistente)`)
					} else if (glossarios.has(t.relatedStudyId)) {
						quebrados.push(`${file} → ${t.term} → aponta para outro glossário`)
					}
				}
			}
			expect(quebrados).toEqual([])
		})
	})
})
