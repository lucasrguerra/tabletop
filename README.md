# Tabletop - Plataforma de Treinamento em Resposta a Incidentes

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=flat&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=flat&logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.18-38bdf8?style=flat&logo=tailwindcss)

Uma plataforma completa para condução de **exercícios tabletop** de resposta a incidentes de segurança cibernética e infraestrutura de rede. Permite que equipes pratiquem a análise e resposta a cenários realistas de incidentes em um ambiente controlado e seguro, sem riscos para sistemas em produção.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Características Principais](#características-principais)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Como Usar](#como-usar)
- [Estrutura de Cenários](#estrutura-de-cenários)
- [Categorias de Incidentes](#categorias-de-incidentes)
- [API Endpoints](#api-endpoints)
- [Segurança](#segurança)
- [Contribuindo](#contribuindo)
- [Licença](#licença)
- [Autor](#autor)

## 🎯 Sobre o Projeto

O **Tabletop** é uma plataforma web desenvolvida para facilitar a condução de exercícios de simulação de resposta a incidentes (tabletop exercises). A aplicação oferece:

- **Cenários Pré-configurados**: Biblioteca de cenários técnicos e realistas baseados em incidentes reais
- **Sistema de Rodadas**: Progressão temporal que simula a evolução real de um incidente
- **Avaliação Interativa**: Múltiplos tipos de questões (múltipla escolha, verdadeiro/falso, numérica, correspondência, ordenação)
- **Gestão de Sessões**: Controle completo de sessões de treinamento com múltiplos participantes
- **Timer Sincronizado**: Cronômetro distribuído para acompanhar o tempo de exercício
- **Métricas Técnicas**: Apresentação de dados realistas (logs, gráficos, análises) para tomada de decisão

### O que são Exercícios Tabletop?

Exercícios tabletop são simulações baseadas em discussão onde equipes trabalham juntas para resolver cenários de incidentes de segurança. Sem sistemas reais em risco, a equipe analisa métricas, identifica ameaças, toma decisões e aprende com feedback imediato.

## ✨ Características Principais

### Para Facilitadores
- ✅ Criar e gerenciar sessões de treinamento
- ✅ Escolher entre diversos cenários pré-configurados 
- ✅ Controlar o fluxo das rodadas (play/pause/reset)
- ✅ Adicionar facilitadores adicionais
- ✅ Acompanhar participantes em tempo real
- ✅ Configurar acesso aberto ou com código
- ✅ Visualizar métricas e questões de cada rodada

### Para Participantes
- ✅ Cadastro simples com nome e função
- ✅ Participar de sessões abertas ou com código
- ✅ Responder questões em tempo real
- ✅ Visualizar métricas técnicas (logs, gráficos, análises)
- ✅ Receber feedback imediato sobre respostas
- ✅ Acompanhar pontuação e desempenho

### Sistema de Questões
A plataforma suporta múltiplos tipos de questões para avaliar diferentes habilidades:

- **Múltipla Escolha**: 4 opções, apenas uma correta
- **Verdadeiro ou Falso**: Validação de conceitos fundamentais
- **Numérica**: Cálculos e estimativas com tolerância
- **Correspondência**: Conectar elementos de duas listas
- **Ordenação**: Colocar itens na sequência correta

## 🛠️ Tecnologias Utilizadas

### Frontend
- **[Next.js 16.1.6](https://nextjs.org/)** - Framework React com SSR e App Router
- **[React 18](https://react.dev/)** - Biblioteca JavaScript para interfaces
- **[TailwindCSS 4.1.18](https://tailwindcss.com/)** - Framework CSS utility-first
- **[React Icons 5.5.0](https://react-icons.github.io/react-icons/)** - Biblioteca de ícones
- **[Recharts 3.6.0](https://recharts.org/)** - Biblioteca de gráficos para React

### Backend & Autenticação
- **[NextAuth.js 4.24.13](https://next-auth.js.org/)** - Autenticação para Next.js
- **[MongoDB](https://www.mongodb.com/)** - Banco de dados NoSQL
- **[Mongoose 9.0.1](https://mongoosejs.com/)** - ODM para MongoDB
- **[bcryptjs 3.0.3](https://github.com/dcodeIO/bcrypt.js)** - Hash de senhas
- **[jsonwebtoken 9.0.3](https://github.com/auth0/node-jsonwebtoken)** - Geração e validação de JWTs

### Segurança
- Proteção CSRF (Cross-Site Request Forgery)
- Rate Limiting por IP
- Sanitização de entradas
- Headers de segurança (CSP, X-Frame-Options, etc.)
- Validação timing-safe para comparações seguras
- Middleware de autenticação em rotas protegidas

## 📁 Estrutura do Projeto

```
tabletop/
├── app/                          # App Router do Next.js
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Autenticação (NextAuth)
│   │   ├── csrf/                 # Token CSRF
│   │   ├── trainings/            # Gestão de treinamentos
│   │   └── users/                # Gestão de usuários
│   ├── dashboard/                # Painel do usuário
│   ├── login/                    # Página de login
│   ├── register/                 # Página de registro
│   ├── globals.css               # Estilos globais
│   ├── layout.jsx                # Layout raiz
│   └── page.jsx                  # Página inicial
│
├── components/                   # Componentes React
│   ├── Dashboard/                # Componentes do dashboard
│   ├── Scenario/                 # Componentes de cenários
│   ├── Trainings/                # Componentes de treinamentos
│   ├── Footer.jsx
│   ├── Header.jsx
│   └── SessionWrapper.jsx
│
├── database/                     # Banco de dados
│   ├── database.js               # Conexão MongoDB
│   └── schemas/                  # Schemas Mongoose
│       ├── Token.js
│       ├── Training.js
│       └── User.js
│
├── models/                       # Lógica de negócio
│   ├── Password.js
│   ├── Token/                    # Gestão de tokens
│   ├── Trainings/                # Gestão de treinamentos
│   └── User/                     # Gestão de usuários
│
├── scenarios/                    # Cenários de treinamento
│   ├── categories.json           # Definição de categorias
│   ├── GOV_LEGAL/                # Governança e Jurídico
│   ├── NET_ROUT/                 # Roteamento de Rede
│   ├── NET_VOL/                  # Tráfego Volumétrico/DDoS
│   ├── PHY_L2/                   # Infraestrutura Física/L2
│   ├── SCI_DATA/                 # Dados Científicos
│   └── SEC_SYS/                  # Segurança de Sistemas
│
├── utils/                        # Utilitários
├── Dockerfile                    # Configuração Docker
├── middleware.js                 # Middleware global (segurança)
├── package.json                  # Dependências
├── postcss.config.mjs            # Configuração PostCSS
├── jsconfig.json                 # Configuração JavaScript
├── SCENARIO_STRUCTURE.md         # Documentação de cenários
└── README.md                     # Este arquivo
```

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **[Node.js](https://nodejs.org/)** 18.x ou superior
- **[MongoDB](https://www.mongodb.com/)** 6.x ou superior (local ou Atlas)
- **npm** ou **yarn** (gerenciador de pacotes)

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/tabletop.git
cd tabletop
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/tabletop
# ou
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/tabletop

# JWT & Auth
JWT_SECRET=sua_chave_secreta_jwt_muito_longa_e_segura
NEXTAUTH_SECRET=sua_chave_secreta_nextauth_muito_longa_e_segura
NEXTAUTH_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

**⚠️ IMPORTANTE**: Gere chaves secretas fortes e únicas para produção:

```bash
# Gerar chaves secretas seguras
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
# ou
yarn dev
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuração

### Banco de Dados

O sistema se conecta automaticamente ao MongoDB na primeira requisição. A conexão é mantida em cache para otimização.

**MongoDB Local:**
```bash
# Inicie o MongoDB localmente
mongod --dbpath /caminho/para/dados
```

**MongoDB Atlas:**
1. Crie uma conta em [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie um cluster gratuito
3. Configure o acesso de rede (IP Whitelist)
4. Copie a connection string e coloque no `.env.local`

### Segurança

A aplicação implementa múltiplas camadas de segurança:

- **Headers de Segurança**: CSP, X-Frame-Options, X-XSS-Protection
- **Proteção CSRF**: Tokens CSRF em todas as mutações
- **Rate Limiting**: Limite de requisições por IP
- **Sanitização**: Limpeza de entradas do usuário
- **Timing-Safe**: Comparações seguras contra timing attacks
- **JWT**: Tokens com expiração e refresh

## 📖 Como Usar

### Para Facilitadores

1. **Criar Conta**: Acesse `/register` e crie uma conta
2. **Fazer Login**: Entre com suas credenciais em `/login`
3. **Criar Treinamento**: 
   - Acesse `/dashboard/trainings/new`
   - Escolha uma categoria de incidente
   - Selecione um tipo específico
   - Escolha um cenário pré-configurado
   - Configure nome, descrição e tipo de acesso
   - Clique em "Criar Treinamento"
4. **Gerenciar Sessão**:
   - Adicione facilitadores adicionais
   - Compartilhe o link (ou código) com participantes
   - Controle o timer (play/pause/reset)
   - Navegue pelas rodadas
   - Acompanhe participantes e respostas

### Para Participantes

1. **Acessar Sessão**: Receba o link do facilitador
2. **Entrar**: Participe da sessão (com ou sem código)
3. **Acompanhar**: Siga as rodadas e instruções
4. **Responder**: Responda as questões de cada rodada
5. **Avaliar**: Receba feedback e pontuação

## 🎭 Estrutura de Cenários

Os cenários seguem uma estrutura JSON padronizada com as seguintes seções:

```json
{
  "id": "identificador-do-cenario",
  "title": "Título do Cenário",
  "description": "Descrição breve do incidente",
  "category": {
    "id": "CATEGORIA",
    "type": "TIPO_ESPECIFICO",
    "title": "Nome do Tipo"
  },
  "metadata": {
    "version": "1.0",
    "lastUpdate": "2024-01-01",
    "difficulty": "Intermediário",
    "estimatedDuration": "45 minutos"
  },
  "objectives": ["Objetivo 1", "Objetivo 2"],
  "scope": ["Limitação 1", "Limitação 2"],
  "baseScenario": {
    "context": "Contexto do cenário",
    "initialSituation": { /* ... */ }
  },
  "rounds": [
    {
      "id": 1,
      "title": "Fase do Incidente",
      "phase": "Detecção e Análise",
      "metrics": [ /* Métricas técnicas */ ],
      "questions": [ /* Questões de avaliação */ ]
    }
  ],
  "evaluation": {
    "totalPoints": 100,
    "passingScore": 60,
    "gradingScale": [ /* ... */ ]
  }
}
```

📄 Para detalhes completos sobre a estrutura de cenários, consulte [SCENARIO_STRUCTURE.md](SCENARIO_STRUCTURE.md)

## 🗂️ Categorias de Incidentes

A plataforma oferece 6 categorias principais de incidentes:

### 1. **GOV_LEGAL** - Governança e Jurídico
- Expiração de Certificado Digital
- Violação de Direitos Autorais
- Bloqueio Judicial de Conteúdo
- Solicitação Judicial de Logs
- Violação de Privacidade de Dados

### 2. **NET_ROUT** - Roteamento de Rede
- Sequestro de Prefixo BGP
- Instabilidade de Rotas (Flapping)
- Falha MPLS/LDP
- Queda de Adjacência OSPF
- Vazamento de Rotas BGP
- Bloqueio por RPKI Inválido

### 3. **NET_VOL** - Tráfego Volumétrico e DDoS
- Carpet Bombing
- Amplificação DNS
- Amplificação NTP
- DDoS de Saída (Botnet Interna)
- SYN Flood
- Amplificação Memcached

### 4. **PHY_L2** - Infraestrutura Física e Camada 2
- Loop de Camada 2 (Broadcast Storm)
- Rompimento de Fibra Óptica
- Degradação de Sinal Óptico
- Falha de Energia (UPS/Gerador)
- Falha de Módulo SFP
- Falha de Switch de Núcleo

### 5. **SCI_DATA** - Dados Científicos e Acadêmicos
- Elephant Flow
- Alta Latência em Rede Científica
- Perda de Pacotes
- Degradação de Throughput

### 6. **SEC_SYS** - Segurança de Sistemas
- Comunicação C2 (Command & Control)
- Infecção por Ransomware
- Injeção SQL
- Ataque de Força Bruta SSH
- Desfiguração de Site (Web Defacement)

## 🔌 API Endpoints

### Autenticação
```
POST   /api/auth/[...nextauth]   # NextAuth endpoints
POST   /api/auth/logout          # Logout
GET    /api/csrf                 # Obter token CSRF
```

### Usuários
```
POST   /api/users/register       # Registrar novo usuário
GET    /api/users/sessions       # Listar sessões do usuário
POST   /api/users/sessions/revoke        # Revogar sessão específica
POST   /api/users/sessions/revoke-all    # Revogar todas as sessões
```

Todas as rotas protegidas requerem autenticação via NextAuth e token CSRF.

## 🔒 Segurança

### Headers de Segurança (middleware.js)
```javascript
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: [política restritiva]
Permissions-Policy: [restrições de features]
Strict-Transport-Security: max-age=31536000 (produção)
```

### Autenticação
- NextAuth com providers personalizados
- JWT com expiração
- Sessões gerenciáveis pelo usuário
- Revogação de tokens

### Proteção de Dados
- Hashing de senhas com bcrypt (10 rounds)
- Sanitização de entradas
- Validação de schemas Mongoose
- Rate limiting por IP

## 🐳 Deploy

### Docker

```bash
# Build da imagem
docker build -t tabletop .

# Run do container
docker run -p 3000:3000 \
  -e MONGODB_URI=sua_connection_string \
  -e JWT_SECRET=sua_chave_secreta \
  -e NEXTAUTH_SECRET=sua_chave_nextauth \
  -e NEXTAUTH_URL=https://seu-dominio.com \
  tabletop
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Criando Novos Cenários

Para adicionar novos cenários:

1. Consulte [SCENARIO_STRUCTURE.md](SCENARIO_STRUCTURE.md)
2. Siga a estrutura JSON padronizada
3. Mantenha nomenclatura genérica (não específica de organizações)
4. Inclua múltiplos tipos de questões
5. Forneça justificativas técnicas completas

## 📄 Licença

Este projeto está sob a licença especificada no arquivo [LICENSE](LICENSE).

## 👤 Autor

**Lucas Rayan Guerra**

- GitHub: [@lucas](https://github.com/lucas)
- Email: l.rayanguerra@gmail.com

---

## 📝 Notas de Desenvolvimento

### Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Inicia servidor de produção
npm run lint     # Executa linting
```

---

<div align="center">

**[⬆ Voltar ao topo](#tabletop---plataforma-de-treinamento-em-resposta-a-incidentes)**

Desenvolvido com ❤️ para treinamentos de resposta a incidentes

</div>