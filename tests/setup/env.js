// Configura todas as variáveis de ambiente necessárias para os testes.
// Este arquivo roda via setupFiles ANTES do import de qualquer módulo da aplicação.
// IMPORTANTE: utils/csrf.js captura CSRF_SECRET no momento do import — deve estar aqui.

process.env.NODE_ENV        = 'test'
process.env.NEXTAUTH_SECRET = 'test-secret-minimum-32-chars-long-ok'
process.env.JWT_SECRET      = 'test-jwt-secret-minimum-32-chars-ok'
process.env.CSRF_SECRET     = 'test-csrf-secret-minimum-32-chars-ok'
process.env.NEXTAUTH_URL    = 'http://localhost:3000'
// MONGODB_URI é definido dinamicamente pelo globalSetup.js
