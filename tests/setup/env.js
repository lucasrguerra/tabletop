// Configura todas as variáveis de ambiente necessárias para os testes.
// Este arquivo roda via setupFiles ANTES do import de qualquer módulo da aplicação.
// IMPORTANTE: utils/csrf.js captura CSRF_SECRET no momento do import — deve estar aqui.

process.env.NODE_ENV        = 'test'
process.env.NEXTAUTH_SECRET = 'test-secret-minimum-32-chars-long-ok'
process.env.JWT_SECRET      = 'test-jwt-secret-minimum-32-chars-ok'
process.env.CSRF_SECRET     = 'test-csrf-secret-minimum-32-chars-ok'
process.env.NEXTAUTH_URL    = 'http://localhost:3000'

// MONGODB_URI é definido dinamicamente pelo globalSetup.js, apontando para o
// MongoMemoryServer sem nome de database — ou seja, todos os workers cairiam no
// mesmo banco `test`. Como useTestDatabase() limpa TODAS as coleções no
// beforeEach, um arquivo de teste apagava os dados de outro rodando em paralelo
// em outro fork. Cada worker recebe aqui seu próprio database para ficar isolado.
if (process.env.MONGODB_URI) {
	const worker_id = process.env.VITEST_WORKER_ID || process.env.VITEST_POOL_ID || '1'
	const base_uri = process.env.MONGODB_URI.split('?')[0].replace(/\/[^/]*$/, '/')
	const query = process.env.MONGODB_URI.includes('?')
		? `?${process.env.MONGODB_URI.split('?')[1]}`
		: ''

	process.env.MONGODB_URI = `${base_uri}tabletop_test_${worker_id}${query}`
}
