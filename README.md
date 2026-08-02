# Tabletop - Plataforma de Treinamento em Resposta a Incidentes

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=flat&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=flat&logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.18-38bdf8?style=flat&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat)

Uma plataforma completa para condução de **exercícios tabletop** de resposta a incidentes de segurança cibernética e infraestrutura de rede. Permite que equipes pratiquem a análise e resposta a cenários realistas de incidentes em um ambiente controlado e seguro, sem riscos para sistemas em produção.

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Características Principais](#-características-principais)
- [Telas da Aplicação](#-telas-da-aplicação)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Arquitetura](#-arquitetura)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Banco de Dados](#-banco-de-dados)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Como Usar](#-como-usar)
- [Estrutura de Cenários](#-estrutura-de-cenários)
- [Categorias de Incidentes](#-categorias-de-incidentes)
- [Biblioteca de Estudos](#-biblioteca-de-estudos)
- [API Endpoints](#-api-endpoints)
- [Segurança](#-segurança)
- [Testes](#-testes)
- [Design da Interface](#-design-da-interface)
- [Deploy](#-deploy)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)
- [Autor](#-autor)

## 🎯 Sobre o Projeto

O **Tabletop** é uma plataforma web desenvolvida para facilitar a condução de exercícios de simulação de resposta a incidentes (tabletop exercises). A aplicação oferece:

- **31 Cenários Pré-configurados**: Biblioteca de cenários técnicos e realistas em 6 categorias, baseados em incidentes reais de segurança e infraestrutura
- **Sistema de Rodadas**: Progressão temporal em 5 fases (Preparação → Detecção → Contenção → Análise Avançada → Recuperação) que simula a evolução real de um incidente
- **Avaliação Interativa**: 5 tipos de questões (múltipla escolha, verdadeiro/falso, numérica, correspondência, ordenação) com correção automática e justificativas técnicas
- **3 Papéis Distintos**: Facilitador (controle total), Participante (responde questões) e Observador (acompanhamento read-only)
- **Timer Sincronizado**: Cronômetro de treinamento (automático) + cronômetro de rodada (manual) controlados pelo facilitador
- **Métricas Técnicas**: Apresentação de dados realistas (logs, gráficos, análises de rede, status de servidores) via Recharts
- **Ranking Público em Tempo Real**: Leaderboard projetável com atualização sincronizada via WebSockets
- **Sistema de Notificações**: Convites, aceites e recusas em tempo real via WebSockets
- **Exportação PDF**: Relatório completo do treinamento exportável pelo facilitador
- **Avaliação Pós-Treinamento**: Formulário de feedback com ratings de 1-5 estrelas e estatísticas agregadas

### O que são Exercícios Tabletop?

Exercícios tabletop são simulações baseadas em discussão onde equipes trabalham juntas para resolver cenários de incidentes de segurança. Sem sistemas reais em risco, a equipe analisa métricas, identifica ameaças, toma decisões e aprende com feedback imediato.

## ✨ Características Principais

### Para Facilitadores
- ✅ Criar sessões de treinamento via wizard de 3 etapas (categoria → tipo de incidente → cenário)
- ✅ Escolher entre 31 cenários pré-configurados em 6 categorias
- ✅ Controlar o status do treinamento (Iniciar / Pausar / Retomar / Concluir / Reiniciar)
- ✅ Gerenciar dois timers independentes: treinamento (automático) e rodada (manual)
- ✅ Navegar entre rodadas (próxima / anterior / ir para rodada específica)
- ✅ Convidar participantes por nickname com papel definido (participante/observador/facilitador)
- ✅ Configurar acesso aberto ou protegido com código de acesso
- ✅ Acompanhar respostas dos participantes em tempo real via WebSockets
- ✅ Visualizar métricas técnicas e questões de cada rodada com respostas dos participantes
- ✅ Monitorar painel de estatísticas com distribuição de acertos, pontuação e comparativos
- ✅ Exportar relatório completo em PDF
- ✅ Visualizar avaliações dos participantes com estatísticas agregadas
- ✅ Excluir treinamentos (com confirmação e remoção de todos os dados associados)

### Para Participantes
- ✅ Cadastro com nome, email, nickname e senha
- ✅ Entrar em sessões via código de acesso ou navegação por treinamentos abertos
- ✅ Aceitar/recusar convites de treinamento com notificações em tempo real
- ✅ Responder 5 tipos de questões interativas durante rodadas ativas
- ✅ Visualizar métricas técnicas (logs, gráficos, análises de rede)
- ✅ Navegar por rodadas anteriores para revisão
- ✅ Acompanhar resultados pessoais com dashboard de desempenho: acurácia, pontuação, posição no ranking, breakdown por rodada e por tipo de questão
- ✅ Comparar desempenho com médias anônimas da turma
- ✅ Enviar avaliação pós-treinamento (ratings + comentário)

### Para Observadores
- ✅ Acompanhar o treinamento sem qualquer controle sobre ele
- ✅ Ver as respostas de todos os participantes, o gabarito e as justificativas — o mesmo acesso de leitura do facilitador
- ✅ Acompanhar o medidor de respostas e as estatísticas de desempenho em tempo real
- ✅ Navegar entre rodadas disponíveis, com aviso quando o facilitador abre uma nova
- ❌ Não pode responder questões, controlar rodadas nem ver o código de acesso

> O papel de observador existe para avaliar a equipe e embasar o feedback ao
> final. Por isso recebe o gabarito: sem ele, não teria o que observar.

### Sistema de Questões
A plataforma suporta 5 tipos de questões para avaliar diferentes habilidades cognitivas (baseado na Taxonomia de Bloom):

| Tipo | Descrição | Pontuação Sugerida |
|------|-----------|-------------------|
| **Múltipla Escolha** | 4 opções, apenas uma correta | 5 pontos |
| **Verdadeiro ou Falso** | Validação de afirmações técnicas | 3 pontos |
| **Numérica** | Cálculos e estimativas com tolerância | 5-6 pontos |
| **Correspondência** | Conectar elementos de duas listas (crédito parcial) | 6 pontos |
| **Ordenação** | Colocar itens na sequência correta | 5 pontos |

Distribuição recomendada por cenário: 60-70% múltipla escolha, 10-15% verdadeiro/falso, 5-10% numérica, 5-10% correspondência, 5% ordenação (16-20 questões totais, 80-100 pontos).

## 🖥️ Telas da Aplicação

### Páginas Públicas
| Rota | Descrição |
|------|-----------|
| `/` | Landing page com apresentação da plataforma, seções de features, como funciona, benefícios e CTA dinâmico (detecta sessão ativa) |
| `/login` | Formulário de login com email ou nickname + senha (proteção CSRF) |
| `/register` | Formulário de registro com validação client-side (senha: 8+ chars, maiúscula, minúscula, número, especial; nickname: alfanumérico + underscore) |
| `/ranking/:id` | Leaderboard público em tempo real (sem autenticação), projetável em tela durante o exercício, atualizado via WebSockets |

### Dashboard
| Rota | Descrição |
|------|-----------|
| `/dashboard` | Painel principal: estatísticas (total, ativos, concluídos, aguardando), convites pendentes, treinamentos ativos, distribuição por papel/categoria, ações rápidas |
| `/dashboard/sessions` | Gerenciamento de sessões de login ativas (dispositivos/navegadores), com revogação individual ou em lote. Exibe user agent, IP, datas |
| `/dashboard/trainings` | Lista paginada de todos os treinamentos (9 por página) com filtros por status e papel, cards com metadados completos |
| `/dashboard/trainings/new` | Wizard de 3 etapas: (1) Selecionar categoria e tipo de incidente, (2) Escolher cenário, (3) Configurar sessão (nome, descrição, acesso aberto/código, máx. participantes) |
| `/dashboard/trainings/access` | Entrar em treinamentos: formulário de código de acesso ou navegar por treinamentos abertos com filtros por status |
| `/dashboard/trainings/invites` | Ver convites pendentes com aceitar/recusar |
| `/dashboard/trainings/:id` | Redirecionamento automático para a view do papel do usuário (facilitator/participant/observer) |
| `/dashboard/trainings/:id/facilitator` | Console de comando, controle de rodadas e medidor de respostas ao vivo. O que aparece muda conforme a fase — preparação, ao vivo ou análise (ver [DESIGN.md](DESIGN.md)) |
| `/dashboard/trainings/:id/participant` | Responder questões, ler evidências, navegar rodadas, progresso pessoal no console; ao encerrar, resultados e avaliação |
| `/dashboard/trainings/:id/observer` | Acesso de leitura equivalente ao do facilitador — respostas de todos, gabarito, justificativas e estatísticas — sem nenhum controle |
| `/dashboard/studies` | Biblioteca de estudos: busca, filtros por categoria/tipo/dificuldade, ordenação e paginação servida pelo backend; estado na URL |
| `/dashboard/studies/:id` | Artigo completo, com registro de leitura e conclusão |
| `/dashboard/admin` | Painel administrativo: métricas da plataforma, gestão de usuários e de treinamentos (exige `admin`) |

## 🛠️ Tecnologias Utilizadas

### Frontend
| Tecnologia | Versão | Função |
|-----------|--------|--------|
| [Next.js](https://nextjs.org/) | 16.2.12 | Framework React com SSR e App Router |
| [React](https://react.dev/) | 18 | Biblioteca JavaScript para interfaces |
| [TailwindCSS](https://tailwindcss.com/) | 4.1.18 | Framework CSS utility-first |
| [React Icons](https://react-icons.github.io/react-icons/) | 5.5.0 | Biblioteca de ícones |
| [Recharts](https://recharts.org/) | 3.6.0 | Gráficos e visualização de dados |
| [jsPDF](https://github.com/parallax/jsPDF) | 4.2.1 | Geração de relatórios PDF |
| [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) | 5.0.7 | Tabelas em relatórios PDF |

Tipografia: **Montserrat** para a interface e **JetBrains Mono** para telemetria
(relógios, contadores, posição de rodada), ambas via `next/font/google`.

### Backend & Autenticação
| Tecnologia | Versão | Função |
|-----------|--------|--------|
| [NextAuth.js](https://next-auth.js.org/) | 4.24.15 | Autenticação com Credentials Provider |
| [MongoDB](https://www.mongodb.com/) | — | Banco de dados NoSQL |
| [Mongoose](https://mongoosejs.com/) | 9.9.0 | ODM para MongoDB com schemas validados |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 3.0.3 | Hash de senhas |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | 9.0.3 | Geração e validação de JWTs com issuer/audience |
| [Socket.IO](https://socket.io/) | 4.8.3 | Atualização em tempo real do treinamento |

### Desenvolvimento
| Tecnologia | Versão | Função |
|-----------|--------|--------|
| [Vitest](https://vitest.dev/) | 4.1.10 | Execução de testes unitários e de integração |
| [mongodb-memory-server](https://github.com/typegoose/mongodb-memory-server) | 10.4.3 | MongoDB em memória para os testes de integração |

#### Sobre o bloco `overrides` do `package.json`

```json
"overrides": { "postcss": "^8.5.25", "sharp": "^0.35.3" }
```

Ambas as bibliotecas são dependências transitivas do Next.js e o range que ele
declara ainda aponta para versões com CVE aberto — `sharp` é fixado em `^0.34.5`,
enquanto a correção das vulnerabilidades de libvips exige `>= 0.35.0`. Os
overrides existem só por isso e devem ser removidos quando o Next.js passar a
declarar as versões corrigidas. Com eles, `npm audit` reporta zero
vulnerabilidades, inclusive com `--omit=dev`.

## 🏗️ Arquitetura

```
┌──────────────────────────────────────────────────────────────┐
│                       CLIENTE (Browser)                      │
│  ┌─────────┐  ┌──────────────┐  ┌─────────────────────────┐  │
│  │ Landing │  │    Login /   │  │       Dashboard         │  │
│  │  Page   │  │  Register    │  │  (Facilitador/Partic./  │  │
│  │   (/)   │  │              │  │    Observador)          │  │
│  └─────────┘  └──────────────┘  └─────────────────────────┘  │
│                         │ WebSockets (Socket.IO)             │
├─────────────────────────┼────────────────────────────────────┤
│                   MIDDLEWARE (proxy.js)                      │
│  Security Headers │ CSP │ HSTS │ Route Protection │ JWT Check│
├─────────────────────────┼────────────────────────────────────┤
│                    API ROUTES (35 endpoints)                 │
│  ┌──────┐ ┌────┐ ┌──────────┐ ┌─────┐ ┌───────┐ ┌────────┐   │
│  │ Auth │ │CSRF│ │Trainings │ │Users│ │Studies│ │ Admin  │   │
│  │ + 2  │ │HMAC│ │18 routes │ │  4  │ │   3   │ │   5    │   │
│  └──────┘ └────┘ └──────────┘ └─────┘ └───────┘ └────────┘   │
│              ┌──────────────┐ ┌───────────────┐              │
│              │ Notifications│ │  /api/health  │              │
│              └──────────────┘ └───────────────┘              │
│   withAuth │ withCsrf │ withTrainingRole │ withAdmin │ rate  │
├────────────┼──────────┼──────────────────┼──────────┼────────┤
│                     MODELS (Lógica de Negócio)               │
│  ┌──────────┐ ┌──────────────┐  ┌────────┐ ┌──────────────┐  │
│  │   User   │ │  Trainings   │  │ Token  │ │Notifications │  │
│  │ register │ │ create/join  │  │ create │ │   create     │  │
│  │  login   │ │ submit/eval  │  │validate│ │  markAsRead  │  │
│  │  getOne  │ │ 17 funções   │  │ revoke │ │getUserNotifs │  │
│  └──────────┘ └──────────────┘  └────────┘ └──────────────┘  │
│         ┌──────────────┐  ┌────────────────────┐             │
│         │   Studies    │  │       Admin        │             │
│         │ list/read    │  │ getStats/getUsers  │             │
│         │ progress     │  │ update/deleteUser  │             │
│         └──────────────┘  └────────────────────┘             │
├──────────────────────────────────────────────────────────────┤
│                     DATABASE (MongoDB)                       │
│   ┌──────┐ ┌──────────┐ ┌───────┐ ┌──────────┐ ┌──────────┐  │
│   │ User │ │ Training │ │ Token │ │ Response │ │Evaluation│  │
│   └──────┘ └──────────┘ └───────┘ └──────────┘ └──────────┘  │
│           ┌──────────────┐ ┌────────────────┐                │
│           │ Notification │ │ StudyProgress  │                │
│           └──────────────┘ └────────────────┘                │
├──────────────────────────────────────────────────────────────┤
│         CONTEÚDO EM ARQUIVO (lido do disco, não do banco)    │
│  SCENARIOS (31 JSON)          STUDIES (43 JSON)              │
│  GOV_LEGAL(5) NET_ROUT(6)     CONCEITO(17) PROCEDIMENTO(11)  │
│  NET_VOL(6)   PHY_L2(6)       FERRAMENTA(9) GLOSSARIO(6)     │
│  SCI_DATA(4)  SEC_SYS(4)                                     │
└──────────────────────────────────────────────────────────────┘
```

### Padrões Chave
- **Autenticação**: NextAuth.js com `CredentialsProvider` → JWT strategy → tokens armazenados como hashes SHA-256 no banco → sessões de 30 dias
- **Autorização**: Middleware composável via HOFs: `withAuth` → `withCsrf` → `withTrainingRole(['facilitator'])`. As flags `admin` e `facilitator` são relidas do banco a cada requisição — a sessão nunca é fonte de verdade para privilégio (ver [Segurança](#-segurança))
- **WebSockets (Socket.IO)**: Comunicação em tempo real para sincronizar o status do treinamento, timers, respostas dos participantes, ranking público e notificações.
- **Conteúdo em arquivo**: cenários e artigos de estudo são JSON versionados no repositório, não registros de banco. O índice de estudos é lido do disco uma vez e mantido em memória (`clearStudyArticleCache()` invalida)
- **Estado da interface na URL**: filtros, busca e paginação da biblioteca de estudos vivem em query params, de modo que uma visão filtrada é compartilhável e o botão voltar funciona
- **Path alias**: `@/*` mapeia para a raiz do projeto via jsconfig.json

## 📁 Estrutura do Projeto

```
tabletop/
├── app/                              # App Router do Next.js
│   ├── api/                          # 35 API Routes
│   │   ├── auth/                     # Autenticação (NextAuth + logout)
│   │   ├── csrf/                     # Geração de token CSRF
│   │   ├── notifications/            # Notificações (GET/PATCH)
│   │   ├── trainings/                # Gestão de treinamentos (22 rotas)
│   │   │   ├── [id]/                 # Operações por treinamento
│   │   │   │   ├── evaluations/      # Avaliações pós-treinamento
│   │   │   │   ├── participants/     # Convite de participantes
│   │   │   │   ├── ranking/          # Ranking público
│   │   │   │   ├── responses/        # Submissão/consulta de respostas
│   │   │   │   ├── results/          # Resultados pessoais e agregados
│   │   │   │   ├── round/            # Controle de rodadas
│   │   │   │   ├── scenario/         # Cenário filtrado por papel
│   │   │   │   ├── status/           # Transições de estado
│   │   │   │   └── timer/            # Controle do timer de rodada
│   │   │   ├── access/               # Entrar em treinamentos
│   │   │   ├── access-code/          # Gerar/validar códigos de acesso
│   │   │   ├── categories/           # Listar categorias de incidentes
│   │   │   ├── invites/              # Gerenciar convites
│   │   │   ├── new/                  # Criar treinamento
│   │   │   └── scenarios/            # Listar/consultar cenários
│   │   └── users/                    # Gestão de usuários
│   │       ├── register/             # Registro de novos usuários
│   │       └── sessions/             # Gestão de sessões ativas
│   ├── dashboard/                    # Painel do usuário (10 páginas)
│   │   ├── sessions/                 # Gerenciar sessões de login
│   │   └── trainings/                # Treinamentos
│   │       ├── [id]/                 # View por papel
│   │       │   ├── facilitator/      # Painel do facilitador
│   │       │   ├── participant/      # Experiência do participante
│   │       │   └── observer/         # View do observador
│   │       ├── access/               # Entrar em treinamentos
│   │       ├── invites/              # Convites pendentes
│   │       └── new/                  # Wizard de criação
│   ├── login/                        # Página de login
│   ├── ranking/[id]/                 # Ranking público (sem auth)
│   ├── register/                     # Página de registro
│   ├── globals.css                   # Estilos globais (TailwindCSS)
│   ├── layout.jsx                    # Layout raiz (SessionProvider + Footer)
│   └── page.jsx                      # Landing page
│
├── components/                       # 48 Componentes React
│   ├── Dashboard/                    # Layout e notificações do dashboard
│   │   ├── Layout.jsx                # Sidebar colapsável + header + nav
│   │   └── NotificationBell.jsx      # Dropdown de notificações (WebSockets)
│   ├── Studies/                      # Biblioteca de estudos (12 componentes)
│   │   ├── StudyArticleViewer.jsx    # Visualizador principal de artigos
│   │   ├── StudyBreadcrumb.jsx       # Navegação breadcrumb
│   │   ├── StudyCard.jsx             # Card de artigo
│   │   ├── StudyCategoryPanel.jsx    # Seletor de categoria em pílulas
│   │   ├── StudyConceptBody.jsx      # Renderizador de artigos conceituais
│   │   ├── StudyDifficultyBadge.jsx # Badge de nível de dificuldade
│   │   ├── StudyGlossaryBody.jsx     # Renderizador de termos de glossário
│   │   ├── StudyPagination.jsx       # Paginação da biblioteca
│   │   ├── StudyProcedureBody.jsx    # Renderizador de procedimentos operacionais
│   │   ├── StudyProgressBar.jsx      # Barra de progresso de leitura
│   │   ├── StudyToolBody.jsx         # Renderizador de guias de ferramentas
│   │   └── StudyTypeFilter.jsx       # Filtro por tipo de artigo
│   ├── Trainings/                    # Componentes de treinamentos (27 componentes)
│   │   ├── AccessCodeCard.jsx        # Card de código de acesso
│   │   ├── BaseScenarioDisplay.jsx   # Exibição do cenário base
│   │   ├── ErrorAlert.jsx            # Alerta de erro
│   │   ├── EvaluationForm.jsx        # Formulário de avaliação (1-5 estrelas)
│   │   ├── EvaluationStats.jsx       # Estatísticas de avaliações agregadas
│   │   ├── ExportPDFButton.jsx       # Exportar relatório em PDF
│   │   ├── FacilitatorQuestionsView.jsx  # Questões com respostas dos participantes
│   │   ├── InviteParticipantCard.jsx # Card para convidar participantes
│   │   ├── LoadingSpinner.jsx        # Spinner de carregamento
│   │   ├── MetricsDisplay.jsx        # Gráficos e métricas (Recharts)
│   │   ├── MyRoundProgress.jsx       # Indicador de progresso pessoal
│   │   ├── ParticipantResultsDashboard.jsx # Dashboard de resultados pessoais
│   │   ├── ParticipantsList.jsx      # Lista de participantes com gestão
│   │   ├── ResponseMeter.jsx         # Medidor de submissão de respostas
│   │   ├── RoundControl.jsx          # Controle de rodadas (próxima/anterior/set)
│   │   ├── RoundInfo.jsx             # Informações da rodada atual
│   │   ├── RoundNavigator.jsx        # Navegação entre rodadas disponíveis
│   │   ├── RoundQuestions.jsx        # Questões interativas (5 tipos)
│   │   ├── RoundTimerDisplay.jsx     # Timer manual da rodada
│   │   ├── ScenarioInfo.jsx          # Info do cenário (metadados, objetivos)
│   │   ├── TimerDisplay.jsx          # Componente base de timer
│   │   ├── TrainingConsole.jsx       # Console unificado do treinamento
│   │   ├── TrainingHeader.jsx        # Cabeçalho do treinamento
│   │   ├── TrainingShell.jsx         # Container estrutural da view de treinamento
│   │   ├── TrainingStatsDashboard.jsx # Dashboard de estatísticas do treinamento
│   │   ├── TrainingStatusBadge.jsx   # Badge de status
│   │   ├── TrainingTimerDisplay.jsx  # Timer automático do treinamento
│   │   └── new/                      # Componentes do wizard de criação
│   │       ├── CategoryCard.jsx      # Card de categoria de incidente
│   │       ├── IncidentTypeCard.jsx  # Card de tipo de incidente
│   │       ├── ScenarioCard.jsx      # Card de cenário
│   │       └── StepIndicator.jsx     # Indicador de etapas do wizard
│   ├── Footer.jsx                    # Footer global (links CAIS/RNP, CERT.br)
│   ├── Header.jsx                    # Header público (responsive, scroll-aware)
│   └── SessionWrapper.jsx            # Wrapper do NextAuth SessionProvider
│
├── database/                         # Camada de banco de dados
│   ├── database.js                   # Conexão MongoDB (singleton, pool de 10)
│   └── schemas/                      # 7 Schemas Mongoose
│       ├── User.js                   # name, email, nickname, password_hash
│       ├── Training.js               # Sessão de treinamento (cenário, participantes, timers)
│       ├── Token.js                  # Tokens JWT (hash SHA-256, TTL auto-delete)
│       ├── Notification.js           # Notificações (convites, aceites, recusas)
│       ├── Response.js               # Respostas dos participantes (unique constraint)
│       ├── Evaluation.js             # Avaliações pós-treinamento (1-5 estrelas)
│       └── StudyProgress.js          # Progresso e histórico de leitura de estudos
│
├── models/                           # Lógica de negócio (37 módulos / 7 diretórios)
│   ├── Password.js                   # Hash e verificação com bcryptjs
│   ├── Admin/                        # Gestão administrativa (5 funções)
│   │   ├── deleteUser.js             # Deletar usuário em cascata
│   │   ├── getAllTrainings.js        # Listar todos os treinamentos
│   │   ├── getStats.js               # Métricas agregadas da plataforma
│   │   ├── getUsers.js               # Listar usuários cadastrados
│   │   └── updateUser.js             # Atualizar papéis de usuário
│   ├── Notifications/                # Gestão de notificações (3 funções)
│   │   ├── create.js                 # Criar notificação
│   │   ├── getUserNotifications.js   # Listar com paginação
│   │   └── markAsRead.js             # Marcar como lida(s)
│   ├── Studies/                      # Biblioteca de estudos (4 funções)
│   │   ├── getStudyArticles.js       # Listagem paginada com busca e facets
│   │   ├── getUserStudyProgress.js   # Progresso de leitura do usuário
│   │   ├── markArticleRead.js        # Registrar leitura/conclusão de artigo
│   │   └── readStudyArticle.js       # Ler artigo completo do JSON
│   ├── Token/                        # Gestão de tokens JWT (4 funções)
│   │   ├── create.js                 # Criar token (armazena hash)
│   │   ├── validate.js               # Validar token (verifica hash + expiração)
│   │   ├── getUserTokens.js          # Listar sessões ativas
│   │   └── revoke.js                 # Revogar sessão(ões)
│   ├── Trainings/                    # Gestão de treinamentos (17 funções)
│   │   ├── accessCode.js             # Gerar/validar códigos de acesso
│   │   ├── create.js                 # Criar treinamento
│   │   ├── deleteTraining.js         # Deletar com dados associados
│   │   ├── getAvailableTrainings.js  # Treinamentos abertos para acesso
│   │   ├── getCategories.js          # Categorias de cenários
│   │   ├── getEvaluations.js         # Consultar avaliações
│   │   ├── getPendingInvites.js      # Convites pendentes
│   │   ├── getResponses.js           # Consultar respostas
│   │   ├── getScenarios.js           # Listar cenários por tipo
│   │   ├── getUserTrainings.js       # Listar treinamentos do usuário
│   │   ├── grading.js                # Corretor automático de questões
│   │   ├── inviteParticipant.js      # Convidar por nickname
│   │   ├── joinTraining.js           # Entrar em treinamento
│   │   ├── readScenario.js           # Ler cenário completo do JSON
│   │   ├── respondToInvite.js        # Aceitar/recusar convite
│   │   ├── submitAnswer.js           # Submeter resposta
│   │   └── submitEvaluation.js       # Submeter avaliação
│   └── User/                         # Gestão de usuários (3 funções)
│       ├── getOne.js                 # Buscar usuário por ID
│       ├── login.js                  # Login email/nickname + bcrypt
│       └── register.js               # Registro com sanitização
│
├── scenarios/                        # 31 Cenários JSON em 6 categorias
│   ├── categories.json               # Definição de categorias e tipos
│   ├── GOV_LEGAL/                    # 5 cenários - Governança e Jurídico
│   ├── NET_ROUT/                     # 6 cenários - Roteamento de Rede
│   ├── NET_VOL/                      # 6 cenários - Tráfego Volumétrico/DDoS
│   ├── PHY_L2/                       # 6 cenários - Infraestrutura Física/L2
│   ├── SCI_DATA/                     # 4 cenários - Dados Científicos
│   └── SEC_SYS/                      # 4 cenários - Segurança de Sistemas
│
├── scripts/                          # Scripts utilitários CLI de administração
│   ├── add-admin.mjs                 # Conceder privilégio de administrador
│   ├── add-facilitator.mjs           # Conceder papel de facilitador
│   ├── remove-admin.mjs              # Remover privilégio de administrador
│   └── remove-facilitator.mjs        # Remover papel de facilitador
│
├── studies/                          # 43 artigos de estudo (JSON)
│   ├── glossarios/                   # 6 glossários, um por categoria
│   └── <CATEGORIA>/<TIPO>/           # conceitos, procedimentos e ferramentas
│
├── tests/                            # 20 arquivos, 291 testes (Vitest)
│   ├── setup/                        # env, MongoMemoryServer, limpeza entre testes
│   ├── unit/                         # models e utils
│   └── integration/                  # middlewares e models com banco real
│
├── utils/                            # 14 Utilitários
│   ├── auth.js                       # NextAuth config + withAuth/withAdmin HOFs
│   │                                 #   + getCurrentUserPrivileges (revalida no banco)
│   ├── csrf.js                       # HMAC CSRF tokens + withCsrf HOF
│   ├── jwt.js                        # Geração/verificação/hash de JWTs
│   ├── rateLimit.js                  # Rate limiter in-memory (4 tiers)
│   ├── sanitize.js                   # Prevenção de NoSQL injection
│   ├── regexes.js                    # Validação de email/nickname (RFC 5322)
│   ├── timingSafe.js                 # crypto.timingSafeEqual + random delay
│   ├── trainingAuth.js               # Autorização por papel + withTrainingRole HOF
│   ├── questions.js                  # questionText() — aceita `text` ou `question`
│   ├── useTraining.js                # Hook compartilhado pelas 3 views de treinamento
│   ├── socket.js                     # Emissores server-side de eventos Socket.IO
│   ├── useSocket.js                  # Cliente Socket.IO da sala de treinamento
│   ├── useUserSocket.js              # Cliente Socket.IO da sala do usuário (notificações)
│   └── useAuth.js                    # Hook React client-side (logout)
│
├── proxy.js                          # Middleware Next.js (security headers + auth)
├── server.mjs                        # Servidor HTTP/Socket.IO customizado (dev & prod)
├── Dockerfile                        # Container Node.js 22 (slim)
├── docker-compose.yml                # App + MongoDB com healthchecks
├── vitest.config.mjs                 # Configuração dos testes
├── package.json                      # Dependências (+ overrides de segurança)
├── postcss.config.mjs                # Configuração PostCSS (TailwindCSS)
├── jsconfig.json                     # Path alias (@/*)
├── SCENARIO_STRUCTURE.md             # Documentação de cenários
├── DESIGN.md                         # Decisões de interface
├── LICENSE                           # Licença MIT
└── README.md                         # Este arquivo
```

## 🗄️ Banco de Dados

A aplicação utiliza MongoDB com Mongoose como ODM. São 7 coleções:

### Schemas

#### User
| Campo | Tipo | Restrições |
|-------|------|-----------|
| `name` | String | obrigatório, indexado, max 100 |
| `email` | String | obrigatório, unique, indexado, max 100 |
| `nickname` | String | obrigatório, unique, indexado, max 30 |
| `password_hash` | String | obrigatório, `select: false` (excluído de queries por padrão) |

#### Training
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `name` | String | Nome do treinamento (max 200) |
| `description` | String | Descrição (max 1000) |
| `created_by` | ObjectId → User | Criador/facilitador principal |
| `scenario` | Object | `{id, category, type, title, description}` |
| `access_type` | Enum | `'open'` ou `'code'` |
| `access_code` | String | Código de acesso (se `access_type === 'code'`) |
| `max_participants` | Number | 1-500, padrão 15 |
| `status` | Enum | `'not_started' \| 'active' \| 'paused' \| 'completed'` |
| `current_round` | Number | Índice da rodada atual |
| `training_timer` | Object | `{started_at, elapsed_time, is_paused}` (automático) |
| `round_timer` | Object | `{started_at, elapsed_time, is_paused}` (manual) |
| `participants[]` | Array | `{user_id, joined_at, role, status}` — papéis: facilitator/participant/observer |

Índices compostos: `(created_by, status)` e `(scenario.category, scenario.type)`.

#### Token
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `user_id` | ObjectId → User | Dono do token |
| `token_hash` | String | Hash SHA-256 do JWT (nunca armazena o token raw) |
| `token_id` | String | Identificador único embutido no JWT |
| `expires_at` | Date | TTL index para auto-deleção |
| `user_agent` | String | Navegador/dispositivo |
| `ip_address` | String | IP da sessão |

#### Notification
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `user_id` | ObjectId → User | Destinatário |
| `type` | Enum | `'invite_received' \| 'invite_accepted' \| 'invite_declined'` |
| `title`, `message` | String | Conteúdo da notificação |
| `training_id` | ObjectId → Training | Treinamento relacionado |
| `is_read` | Boolean | Estado de leitura |

Índice composto: `(user_id, is_read, created_at desc)`.

#### Response
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `training_id`, `user_id` | ObjectId | Referências |
| `round_id`, `question_id` | Number/String | Identificação da questão |
| `answer` | Mixed | Resposta do participante (varia por tipo) |
| `question_type` | Enum | `'multiple-choice' \| 'true-false' \| 'numeric' \| 'matching' \| 'ordering'` |
| `is_correct` | Boolean | Resultado da correção automática |
| `points_earned`, `points_possible` | Number | Pontuação |

Unique constraint: `(training_id, user_id, round_id, question_id)` — impede duplicatas.

#### Evaluation
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `training_id`, `user_id` | ObjectId | Referências |
| `overall_rating`, `scenario_rating`, `difficulty_rating` | Number | Escala 1-5 |
| `would_recommend` | Boolean | Recomendação |
| `comment` | String | Comentário livre (max 1000) |

Unique constraint: `(training_id, user_id)` — uma avaliação por participante.

#### StudyProgress
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `user_id` | ObjectId → User | Dono do progresso (unique — um documento por usuário) |
| `articles[]` | Array | `{article_id, category, content_type, first_read_at, last_read_at, read_count, completed, completed_at}` |
| `total_read`, `total_completed` | Number | Contadores agregados |
| `last_activity_at` | Date | Última leitura registrada |

Cada entrada carrega a própria `category`, o que permite calcular o progresso por
categoria sem depender do índice de artigos carregado no cliente.

Índices: `(user_id, articles.article_id)` e `(user_id, articles.category)`.

### Configuração da Conexão

- **Pool**: Máximo 10 conexões simultâneas
- **Timeouts**: Server selection 5s, Socket 45s
- **URI**: Construída a partir de 4 variáveis de ambiente (`DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_URI`, `DATABASE_NAME`)
- **Cache**: Conexão singleton reutilizada entre requisições

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
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# MongoDB
DATABASE_USER=seu_usuario
DATABASE_PASSWORD=sua_senha
DATABASE_URI=cluster.mongodb.net
DATABASE_NAME=tabletop

# JWT & Auth
JWT_SECRET=sua_chave_secreta_jwt_muito_longa_e_segura
NEXTAUTH_SECRET=sua_chave_secreta_nextauth_muito_longa_e_segura
NEXTAUTH_URL=http://localhost:3000

# CSRF
CSRF_SECRET=sua_chave_secreta_csrf_muito_longa_e_segura

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
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuração

### Banco de Dados

O sistema se conecta automaticamente ao MongoDB na primeira requisição. A conexão é mantida em cache (singleton) para otimização.

**MongoDB Atlas (Recomendado):**
1. Crie uma conta em [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie um cluster gratuito
3. Configure o acesso de rede (IP Whitelist)
4. Crie um database user
5. Configure as 4 variáveis `DATABASE_*` no `.env.local`

### Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_USER` | Sim | Usuário do MongoDB |
| `DATABASE_PASSWORD` | Sim | Senha do MongoDB |
| `DATABASE_URI` | Sim | URI do cluster (sem `mongodb+srv://`) |
| `DATABASE_NAME` | Sim | Nome do banco de dados |
| `JWT_SECRET` | Sim | Chave secreta para JWTs (min 32 chars) |
| `NEXTAUTH_SECRET` | Sim | Chave secreta do NextAuth |
| `NEXTAUTH_URL` | Sim | URL base da aplicação |
| `CSRF_SECRET` | Recomendada | Chave para tokens CSRF (fallback: hardcoded) |
| `NODE_ENV` | Não | `development` ou `production` |

## 📖 Como Usar

### Para Facilitadores

1. **Criar Conta**: Acesse `/register` e crie uma conta com nome, email, nickname e senha
2. **Fazer Login**: Entre com email (ou nickname) e senha em `/login`
3. **Criar Treinamento** (`/dashboard/trainings/new`):
   - **Etapa 1**: Escolha uma categoria de incidente (ex: Segurança de Sistemas) e um tipo específico (ex: Ransomware)
   - **Etapa 2**: Selecione um dos cenários disponíveis para o tipo escolhido
   - **Etapa 3**: Configure nome, descrição, tipo de acesso (aberto ou com código) e máximo de participantes
4. **Gerenciar Sessão** (`/dashboard/trainings/:id/facilitator`):
   - **Convidar**: Adicione participantes/observadores/facilitadores por nickname
   - **Compartilhar**: Envie o código de acesso ou link para treinamentos abertos
   - **Iniciar**: Clique em "Iniciar" para ativar o treinamento (inicia timer automático)
   - **Rodadas**: Navegue entre rodadas — cada uma apresenta novas métricas e questões
   - **Timers**: O timer do treinamento é automático; o timer da rodada é manual (start/pause/reset)
   - **Monitorar**: Acompanhe respostas dos participantes em tempo real (atualização a cada 5s)
   - **Concluir**: Finalize para liberar resultados e formulário de avaliação
   - **Exportar**: Gere relatório PDF completo do treinamento

### Para Participantes

1. **Acessar Sessão**: Via convite (aceitar em `/dashboard/trainings/invites`), código de acesso ou navegar treinamentos abertos em `/dashboard/trainings/access`
2. **Acompanhar**: Siga as rodadas — o facilitador controla a progressão
3. **Analisar**: Estude as métricas técnicas apresentadas (logs, gráficos, dados de rede)
4. **Responder**: Responda as questões de cada rodada durante o período ativo
5. **Revisar**: Navegue por rodadas anteriores para rever métricas e suas respostas
6. **Resultados**: Ao final, visualize seu dashboard de desempenho com acurácia, pontuação, posição no ranking e comparação com a turma
7. **Avaliar**: Envie feedback sobre o treinamento (ratings + comentário)

### Para Observadores

1. **Acessar**: Entre no treinamento via convite com papel "observador"
2. **Acompanhar**: Visualize cenário, métricas e questões em modo read-only
3. **Navegar**: Explore rodadas já apresentadas
4. **Notas**: Utilize como referência para melhoria de processos internos

## 🎭 Estrutura de Cenários

Os cenários seguem uma estrutura JSON padronizada. Cada cenário contém 5 rodadas que simulam a progressão temporal de um incidente:

| Rodada | Fase | Descrição |
|--------|------|-----------|
| 1 | Preparação | Apresentação do cenário e contexto inicial (sem questões) |
| 2 | Detecção e Análise | Evidências iniciais, questões de identificação e classificação |
| 3 | Contenção | Evolução após ações iniciais, questões sobre contenção |
| 4 | Análise Avançada | Aprofundamento técnico, questões sobre erradicação |
| 5 | Recuperação e Pós-Incidente | Encerramento, questões sobre lições aprendidas |

### Componentes de um Cenário

```json
{
  "id": "identificador-kebab-case",
  "title": "Título do Cenário",
  "description": "Descrição breve do incidente",
  "category": { "id": "CATEGORIA", "type": "TIPO", "title": "Nome" },
  "metadata": {
    "version": "1.0",
    "lastUpdate": "YYYY-MM-DD",
    "difficulty": "Básico|Intermediário|Avançado",
    "estimatedDuration": "30-45 minutos",
    "targetAudience": "Público-alvo"
  },
  "objectives": ["Objetivo mensurável 1", "..."],
  "scope": ["Limitação 1", "..."],
  "baseScenario": {
    "context": "Contexto organizacional genérico",
    "initialSituation": { "alert": "...", "affectedHost": "...", "keyMetrics": "..." },
    "initialComplaints": ["..."],
    "availableResources": ["..."]
  },
  "rounds": [
    {
      "id": 1,
      "title": "Nome da Fase",
      "phase": "Fase do Ciclo",
      "timeElapsed": "T+X minutos",
      "metrics": [
        { "title": "...", "type": "server-status|network-analysis|...", "data": {} }
      ],
      "questions": [
        { "id": "q1", "type": "multiple-choice|true-false|numeric|matching|ordering", "text": "...", "points": 5 }
      ]
    }
  ],
  "evaluation": { "totalPoints": 100, "passingScore": 60, "gradingScale": [] },
  "facilitatorNotes": ["Orientação 1", "..."],
  "technicalReferences": [{ "title": "RFC/Guia", "url": "..." }]
}
```

### Tipos de Métricas

| Tipo | Descrição |
|------|-----------|
| `server-status` | CPU, memória, processos, disco |
| `query-analysis` | Análise de queries, logs, padrões |
| `ip-analysis` | IPs de origem, distribuição geográfica, ASNs |
| `network-analysis` | Tráfego de rede, pacotes, protocolos |
| `security-analysis` | Detecções IDS/IPS, assinaturas de malware |

📄 Para documentação completa sobre criação de cenários, consulte [SCENARIO_STRUCTURE.md](SCENARIO_STRUCTURE.md)

## 🗂️ Categorias de Incidentes

A plataforma oferece **31 cenários** organizados em **6 categorias** com **31 tipos de incidente**:

### 1. GOV_LEGAL — Governança e Jurídico (5 cenários)

| Tipo | Cenário |
|------|---------|
| Expiração de Certificado Digital | Notificação de certificado próximo da expiração, impactando autenticação e serviços |
| Violação de Direitos Autorais | Uso não autorizado de material protegido, requerendo conformidade com leis de propriedade intelectual |
| Bloqueio Judicial de Conteúdo | Ordem judicial para bloqueio/remoção de conteúdo ou serviços |
| Solicitação Judicial de Logs | Demanda judicial para fornecimento de logs e dados de acesso |
| Violação de Privacidade (LGPD) | Exposição não autorizada de dados pessoais/sensíveis |

### 2. NET_ROUT — Roteamento de Rede (6 cenários)

| Tipo | Cenário |
|------|---------|
| Sequestro de Prefixo BGP | AS malicioso anunciando prefixos alheios, causando desvio de tráfego |
| Instabilidade BGP (Flapping) | Oscilação excessiva de rotas causando dampening e instabilidade |
| Falha MPLS/LDP | Queda de LSPs e impossibilidade de estabelecer túneis MPLS |
| Queda de Adjacência OSPF | Falha recorrente de adjacências OSPF causando reconvergência constante |
| Vazamento de Rotas BGP | Propagação indevida de rotas entre peers, violando políticas |
| RPKI Inválido | Rotas bloqueadas por ROAs expirados ou mal configurados |

### 3. NET_VOL — Tráfego Volumétrico e DDoS (6 cenários)

| Tipo | Cenário |
|------|---------|
| Carpet Bombing | Ataque DDoS distribuído por milhares de IPs em redes /24 |
| Amplificação DNS | Queries ANY com IP spoofado usando servidores DNS recursivos |
| Amplificação NTP (MONLIST) | Exploração de MONLIST (CVE-2013-5211) com amplificação de até 556x |
| DDoS de Saída (Botnet Interna) | Dispositivos internos comprometidos participando de ataques |
| SYN Flood | Esgotamento de tabela de estados via handshake TCP incompleto |
| Amplificação Memcached UDP | Exploração de Memcached com amplificação de até 51.000x |

### 4. PHY_L2 — Infraestrutura Física e Camada 2 (6 cenários)

| Tipo | Cenário |
|------|---------|
| Loop de Camada 2 | Broadcast storm causado por falha no Spanning Tree |
| Rompimento de Fibra Óptica | Secção de cabos por obras civis em via pública |
| Degradação de Sinal Óptico | Atenuação progressiva por conectores, emendas ou curvatura |
| Falha de Energia (UPS/Gerador) | Esgotamento de bateria UPS com falha do gerador |
| Falha de Módulo SFP | Transceiver com fim de vida, sobrecarga térmica ou incompatibilidade |
| Falha de Switch de Núcleo | Falha catastrófica de hardware (fonte, backplane, ASIC) |

### 5. SCI_DATA — Dados Científicos e Acadêmicos (4 cenários)

| Tipo | Cenário |
|------|---------|
| Elephant Flow | Fluxo de dados massivo impactando performance da rede científica |
| Alta Latência | Latência elevada afetando aplicações sensíveis ao tempo |
| Perda de Pacotes | Perda significativa impactando integridade das comunicações |
| Degradação de Throughput | Redução na capacidade de transferência entre instituições |

### 6. SEC_SYS — Segurança de Sistemas (4 cenários)

| Tipo | Cenário |
|------|---------|
| Beacon C2 | Comunicação periódica entre host comprometido e servidor de comando e controle |
| Ransomware | Infecção com criptografia de dados e demanda de resgate |
| Injeção SQL | Exploração de vulnerabilidades SQL em aplicações web |
| Força Bruta SSH | Tentativas massivas de autenticação com dicionários de senhas |

> **Nota**: O tipo "Desfiguração de Site (Web Defacement)" está cadastrado na categoria SEC_SYS mas ainda não possui cenário JSON implementado.

## 📚 Biblioteca de Estudos

Material técnico para preparação antes do exercício e consulta durante ele,
acessível em `/dashboard/studies`. São **43 artigos** em JSON versionado, nas
mesmas seis categorias dos cenários.

### Tipos de artigo

Cada tipo tem um renderizador próprio em `components/Studies/` e um formato de
conteúdo distinto:

| Tipo | Qtd | Estrutura do `content` | Renderizador |
|------|-----|------------------------|--------------|
| `CONCEITO` | 17 | `sections[]` — cada seção com `body`, `keyPoints[]`, `callout`, `codeBlock` | `StudyConceptBody` |
| `PROCEDIMENTO` | 11 | `context`, `steps[]`, `postConditions[]`, `escalationCriteria[]` | `StudyProcedureBody` |
| `FERRAMENTA` | 9 | `toolName`, `toolVersion`, `installHint`, `commands[]`, `outputFields[]`, `commonPitfalls[]` | `StudyToolBody` |
| `GLOSSARIO` | 6 | `terms[]` — cada termo com `definition`, `seeAlso[]`, `relatedStudyId` | `StudyGlossaryBody` |

Campos relevantes por elemento:

- **`callout`** — `{type, text}`, com `type` ∈ `info | warning | tip | danger`.
  Cada tipo tem cor e ícone próprios; use `danger` apenas para risco real de dano.
- **`codeBlock`** — `{language, code}`. Aceita comandos reais ou diagramas em
  texto; `language` alimenta o rótulo exibido acima do bloco.
- **`step.rollbackAction`** — como desfazer um passo que altera estado. Passos
  puramente diagnósticos (só comandos de leitura) não têm o campo, e o
  renderizador omite o bloco. A lista dos passos isentos é explícita em
  `tests/unit/models/studies.integrity.test.js`.
- **`term.relatedStudyId`** — leva o leitor do termo ao artigo que o desenvolve.
  Termos sem artigo correspondente ficam com `null` e constam da lista
  `SEM_ARTIGO_AINDA` no mesmo teste — é a fila de conteúdo a escrever.

### Busca, filtros e paginação

A listagem é paginada **no servidor** (`models/Studies/getStudyArticles.js`):

| Parâmetro | Valores | Observação |
|-----------|---------|------------|
| `page` | inteiro ≥ 1 | Valor inválido cai em 1; acima do total prende na última página |
| `limit` | 1–48 | Padrão 12, teto `MAX_PAGE_SIZE` |
| `search` | texto livre | Busca em título, descrição, tags e categoria, ignorando acento e caixa; todos os termos precisam casar |
| `category` | ID da categoria | — |
| `content_type` | `CONCEITO`… | — |
| `difficulty` | `Basico`\|`Intermediario`\|`Avancado` | — |
| `sort` | `relevance`\|`title`\|`difficulty`\|`readTime`\|`recent` | `relevance` mantém a ordem curada |

A resposta inclui `facets`, com as contagens por categoria, tipo e dificuldade
calculadas sobre **todo o resultado filtrado** e não sobre a página atual — sem
isso os números dos chips mudariam a cada troca de página.

### Integridade do conteúdo

`tests/unit/models/studies.integrity.test.js` valida a biblioteca inteira a cada
execução da suíte: ids únicos, `relatedStudies` e `prerequisites` sem referência
morta, campos obrigatórios por tipo, `callout.type` dentro dos quatro conhecidos,
e ausência de link quebrado nos glossários. Um artigo novo incompleto quebra o
teste antes de chegar à interface.

## 🔌 API Endpoints

A plataforma expõe **35 endpoints**. Todas as rotas mutáveis (POST/PATCH/DELETE) autenticadas incluem proteção CSRF.

### Autenticação & CSRF

| Método | Rota | Auth | CSRF | Descrição |
|--------|------|------|------|-----------|
| GET/POST | `/api/auth/[...nextauth]` | NextAuth | — | Endpoints do NextAuth (sign-in, callbacks, session) |
| POST | `/api/auth/logout` | ✅ | ✅ | Logout com revogação do token no banco |
| GET | `/api/csrf` | — | — | Gerar token CSRF (cookie `csrf_session` + token HMAC) |

### Notificações

| Método | Rota | Auth | CSRF | Descrição |
|--------|------|------|------|-----------|
| GET | `/api/notifications` | ✅ | — | Listar notificações paginadas (filtro: all/unread) |
| PATCH | `/api/notifications` | ✅ | ✅ | Marcar como lida (uma ou todas) |

### Treinamentos

| Método | Rota | Auth | CSRF | Papel | Descrição |
|--------|------|------|------|-------|-----------|
| GET | `/api/trainings` | ✅ | — | — | Listar treinamentos do usuário (filtros: status, papel) |
| POST | `/api/trainings/new` | ✅ | ✅ | — | Criar treinamento (criador = facilitador) |
| GET | `/api/trainings/categories` | ✅ | — | — | Listar categorias de incidentes |
| GET | `/api/trainings/scenarios` | ✅ | — | — | Listar cenários por tipo ou obter cenário completo |
| GET | `/api/trainings/access` | ✅ | — | — | Listar treinamentos disponíveis para acesso |
| POST | `/api/trainings/access` | ✅ | ✅ | — | Entrar em treinamento (aberto ou com código) |
| GET | `/api/trainings/access-code/generate` | ✅ | — | — | Gerar código de acesso único |
| POST | `/api/trainings/access-code/validate` | ✅ | ✅ | — | Validar código de acesso |
| GET | `/api/trainings/invites` | ✅ | — | — | Listar convites pendentes |
| POST | `/api/trainings/invites` | ✅ | ✅ | — | Responder convite (accept/decline) |
| GET | `/api/trainings/:id` | ✅ | — | Membro | Detalhes do treinamento (dados filtrados por papel) |
| DELETE | `/api/trainings/:id` | ✅ | ✅ | Facilitador | Deletar treinamento e dados associados |
| POST | `/api/trainings/:id/participants` | ✅ | ✅ | — | Convidar participante por nickname |
| PATCH | `/api/trainings/:id/status` | ✅ | ✅ | Facilitador | Transição de status (not_started→active→paused→completed) |
| PATCH | `/api/trainings/:id/round` | ✅ | ✅ | Facilitador | Navegar rodadas (next/previous/set) |
| PATCH | `/api/trainings/:id/timer` | ✅ | ✅ | Facilitador | Controlar timer da rodada (start/pause/reset) |
| GET | `/api/trainings/:id/scenario` | ✅ | — | Membro | Cenário filtrado: facilitador vê tudo, demais veem até `current_round` sem respostas |
| POST | `/api/trainings/:id/responses` | ✅ | ✅ | Participante | Submeter resposta (correção automática backend-side) |
| GET | `/api/trainings/:id/responses` | ✅ | — | Participante/Facilitador | Consultar respostas (participante: próprias; facilitador: todas + stats) |
| GET | `/api/trainings/:id/results` | ✅ | — | Participante/Facilitador | Resultados: desempenho pessoal, ranking, breakdown; facilitador: stats agregados |
| GET | `/api/trainings/:id/ranking` | — | — | — | **Ranking público** (rate limit: 60 req/15s) |
| POST | `/api/trainings/:id/evaluations` | ✅ | ✅ | Participante | Submeter avaliação pós-treinamento |
| GET | `/api/trainings/:id/evaluations` | ✅ | — | Participante/Facilitador | Consultar avaliações (participante: própria; facilitador: todas + médias) |

### Usuários

| Método | Rota | Auth | CSRF | Rate Limit | Descrição |
|--------|------|------|------|------------|-----------|
| POST | `/api/users/register` | — | ✅ | Strict (5 req/30s) | Registrar novo usuário |
| GET | `/api/users/sessions` | ✅ | — | — | Listar sessões ativas (dispositivos) |
| POST | `/api/users/sessions/revoke` | ✅ | ✅ | — | Revogar sessão específica |
| POST | `/api/users/sessions/revoke-all` | ✅ | ✅ | — | Revogar todas exceto a atual |

### Estudos

| Método | Rota | Auth | CSRF | Descrição |
|--------|------|------|------|-----------|
| GET | `/api/studies` | ✅ | — | Listar artigos paginados (`page`, `limit`, `search`, `sort`, `category`, `content_type`, `difficulty`); retorna `pagination`, `facets` e `library_total` |
| GET | `/api/studies/:id` | ✅ | — | Artigo completo com o corpo do conteúdo |
| GET | `/api/studies/progress` | ✅ | — | Progresso de leitura do usuário |
| POST | `/api/studies/progress` | ✅ | ✅ | Registrar leitura ou conclusão de um artigo |

### Administração

Todas exigem `admin === true` **verificado no banco** a cada requisição, via `withAdmin`.

| Método | Rota | Auth | CSRF | Descrição |
|--------|------|------|------|-----------|
| GET | `/api/admin/stats` | ✅ | — | Métricas agregadas da plataforma |
| GET | `/api/admin/users` | ✅ | — | Listar usuários |
| PATCH | `/api/admin/users/:id` | ✅ | ✅ | Conceder/remover papel de facilitador |
| DELETE | `/api/admin/users/:id` | ✅ | ✅ | Deletar usuário em cascata (participações, respostas, avaliações) |
| GET | `/api/admin/trainings` | ✅ | — | Listar todos os treinamentos |
| DELETE | `/api/admin/trainings/:id` | ✅ | ✅ | Deletar qualquer treinamento |

### Operação

| Método | Rota | Auth | CSRF | Descrição |
|--------|------|------|------|-----------|
| GET | `/api/health` | — | — | Health check: verifica a conexão com o MongoDB. `200` com `{status:'ok'}` ou `503` se o banco estiver inacessível. Usado pelo healthcheck do container |

## 🔒 Segurança

A aplicação implementa uma arquitetura de segurança em múltiplas camadas:

### Headers de Segurança (`proxy.js`)

| Header | Valor |
|--------|-------|
| `X-XSS-Protection` | `1; mode=block` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Content-Security-Policy` | Política restritiva (`unsafe-eval` apenas em dev) |
| `Permissions-Policy` | Desabilita camera, microfone, geolocalização, FLoC |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` (produção) |

### Proteção por Camada

| Camada | Mecanismo | Detalhes |
|--------|-----------|---------|
| **Autenticação** | NextAuth.js + JWT customizado | Tokens de 30 dias, armazenados como hash SHA-256 no banco |
| **Sessões** | Gerenciáveis pelo usuário | Visualizar dispositivos, revogar individual ou em lote |
| **CSRF** | Tokens HMAC stateless | Validade de 1h, comparação constant-time, cookie httpOnly |
| **Rate Limiting** | In-memory por IP/URL | 4 tiers — strict: 5/30s, auth: 10/60s, standard: 30/15s, lenient: 100/15s |
| **Sanitização** | Prevenção NoSQL Injection | Rejeita objetos, bloqueia operadores MongoDB (`$`, `{`, `}`), limpa HTML |
| **Timing-Safe** | `crypto.timingSafeEqual` | Comparações em tempo constante + delay aleatório (0-100ms) em falhas de auth |
| **Autorização** | RBAC por treinamento | Middleware `withTrainingRole` filtra dados por papel (facilitador/participante/observador) |
| **Privilégio** | Revalidado no banco | `admin` e `facilitator` são relidos a cada requisição — a sessão não é fonte de verdade |
| **Dados** | Proteção em profundidade | Password hash `select: false`, tokens como SHA-256, TTL auto-delete, unique constraints |
| **Validação** | Regex + Mongoose schemas | Email RFC 5322, nickname alfanumérico, schemas com max lengths e enums |
| **Transporte** | HSTS + middleware | Redirecionamento `/dashboard` sem JWT → `/login`, CSP restritivo |

### Privilégio não vem da sessão

A sessão do NextAuth é um JWT emitido no login com validade de 30 dias. Se
`admin` e `facilitator` fossem lidos dele, revogar o privilégio de alguém só
teria efeito quando a sessão expirasse ou a pessoa refizesse login — uma janela
de até um mês.

Por isso `withAuth` e `withAdmin` chamam `getCurrentUserPrivileges(user_id)`,
que lê as flags direto do banco (`findById` com projeção de dois campos), e
sobrescrevem os valores na sessão antes de entregá-la ao handler:

```js
const privileges = await getCurrentUserPrivileges(session.user.id);
if (!privileges) { return 401; }          // conta deletada durante a sessão
session.user.admin       = privileges.admin;
session.user.facilitator = privileges.facilitator;
```

Consequências: revogação e promoção valem já na requisição seguinte, e uma
sessão cuja conta foi deletada recebe `401` em vez de seguir adiante. O custo é
uma consulta indexada por requisição autenticada.

### Correção do rate limiter

O limitador guarda a expiração como `reset_time`, mas a checagem lia
`resetTime`. Como `now > undefined` é sempre falso, **a janela nunca reiniciava
pelo caminho da requisição**: o contador só crescia e o cliente ficava bloqueado
até a rotina de limpeza rodar, o que independe do `window_ms` configurado.
Coberto por teste de regressão em `tests/unit/utils/rateLimit.test.js`.

## 🧪 Testes

Suíte em [Vitest](https://vitest.dev/), com MongoDB em memória para os testes de
integração. **291 testes em 20 arquivos.**

| Comando | Escopo |
|---------|--------|
| `npm test` | Suíte completa |
| `npm run test:unit` | Apenas `tests/unit` |
| `npm run test:integration` | Apenas `tests/integration` (sobe MongoDB em memória) |
| `npm run test:watch` | Modo interativo |
| `npm run test:coverage` | Cobertura de `models/` e `utils/` via V8 |

```
tests/
├── setup/
│   ├── env.js            # variáveis de ambiente + database por worker
│   ├── globalSetup.js    # sobe o MongoMemoryServer
│   └── database.js       # limpa coleções entre testes
├── unit/
│   ├── models/           # grading, password, integridade de cenários e estudos
│   └── utils/            # csrf, jwt, rateLimit, sanitize, timingSafe, trainingAuth
└── integration/
    ├── api/              # middlewares withAuth / withCsrf / withAdmin / privilégios
    └── models/           # register, login, joinTraining (com concorrência real)
```

> **Isolamento entre workers**: `globalSetup` expõe o MongoMemoryServer sem nome
> de database, então todos os workers cairiam no mesmo banco `test` — e como o
> helper limpa todas as coleções entre testes, um arquivo apagava os dados de
> outro rodando em paralelo. `tests/setup/env.js` dá a cada worker seu próprio
> database (`tabletop_test_<worker_id>`).

Os testes de conteúdo (`scenarios.integrity`, `studies.integrity`) validam os
JSON versionados no repositório e falham quando um cenário ou artigo novo está
incompleto — inclusive verificando que a resposta oficial de cada questão recebe
pontuação máxima no corretor.

## 🎨 Design da Interface

As decisões visuais e de layout da aplicação — sistema de cores, tipografia,
hierarquia por fase do treinamento e os componentes compartilhados — estão
documentadas em **[DESIGN.md](DESIGN.md)**.

## 🐳 Deploy

### Docker Compose (recomendado)

O servidor **não compila nada**: a imagem é publicada pelo GitHub Actions a cada
merge na `main` e o compose apenas a baixa.

```bash
docker compose pull          # busca ghcr.io/lucasrguerra/tabletop:latest
docker compose up -d
docker compose ps            # ambos devem aparecer como "healthy"
```

Atualizar para a última versão é o mesmo par de comandos. Para fixar uma versão
específica ou voltar atrás, use as outras tags publicadas:

```bash
IMAGE_TAG=1.1.0 docker compose up -d                    # por versão
IMAGE_TAG=sha-<commit> docker compose up -d             # por commit exato
```

Os dois serviços têm healthcheck. O do MongoDB usa `db.adminCommand('ping')`; o
da aplicação consulta `/api/health`, que confirma a conexão com o banco. Como a
imagem final é um Alpine enxuto, sem `curl` nem `wget`, o comando usa o próprio Node:

```yaml
healthcheck:
  test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:3000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
  interval: 15s
  timeout: 5s
  retries: 5
  start_period: 40s
```

O `depends_on` da aplicação usa `condition: service_healthy`, de modo que ela só
sobe depois que o banco responde — e não apenas quando o container inicia.

As variáveis seguem o padrão de nomes do Coolify (`SERVICE_USER_MONGODB`,
`SERVICE_PASSWORD_64_NEXTAUTH`, `SERVICE_PASSWORD_64_CSRF`, `SERVICE_URL_APP`),
com valores de desenvolvimento como padrão — **troque todos antes de expor**.

### Build local da imagem

Útil para testar uma mudança no `Dockerfile` antes de abrir o PR. O overlay
troca o `pull` por um build da árvore de trabalho e publica a porta no host:

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

A imagem é multi-stage sobre `alpine` + `nodejs` (183 MB): o estágio de build
compila com `output: 'standalone'`, que rastreia apenas as dependências
alcançadas pela aplicação, e o estágio final roda como usuário não-root sem
`npm` instalado.

### Docker (imagem isolada)

```bash
docker build -t tabletop .

# Run do container
docker run -p 3000:3000 \
  -e DATABASE_USER=seu_usuario \
  -e DATABASE_PASSWORD=sua_senha \
  -e DATABASE_URI=cluster.mongodb.net \
  -e DATABASE_NAME=tabletop \
  -e JWT_SECRET=sua_chave_secreta \
  -e NEXTAUTH_SECRET=sua_chave_nextauth \
  -e NEXTAUTH_URL=https://seu-dominio.com \
  -e CSRF_SECRET=sua_chave_csrf \
  -e NODE_ENV=production \
  tabletop
```

### Produção

Para produção, certifique-se de:
- Usar chaves secretas fortes e únicas (mínimo 32 caracteres)
- Configurar `NODE_ENV=production` (ativa HSTS e CSP restritivo)
- Configurar `NEXTAUTH_URL` com o domínio real
- Considerar migrar o rate limiter para Redis (limitação: in-memory não é cluster-safe)

## 🤝 Contribuindo

### Fluxo de trabalho no Git (obrigatório)

Todo trabalho segue este padrão, sem exceções:

- **Uma branch numerada por feature/correção**: `feature/N-descricao` ou `fix/N-descricao`, onde `N` é sequencial em todo o repositório. Antes de criar, confira o maior `N` existente:

  ```bash
  git branch -a | grep -oE '(feature|fix)/[0-9]+' | grep -oE '[0-9]+' | sort -n | tail -1
  ```

- **Toda mensagem de commit é prefixada com o número da branch**: `#N: mensagem`

  ```
  #17: corrige superfícies sem variante dark em 36 arquivos
  ```

  Isso torna trivial identificar de qual branch cada mudança veio, mesmo depois do merge.

- **Merge na `main` sempre com `--no-ff`**, para que o grafo mostre uma bolha de merge por feature. **Nunca commite direto na `main`.**

  ```bash
  git checkout main
  git merge --no-ff feature/17-correcao-do-dark-mode
  ```

- **Agrupe commits pequenos**: retoques repetidos no mesmo arquivo e ajustes mínimos pertencem a um único commit completo — não inche a árvore. Use `git commit --amend` ou um rebase interativo antes do merge.

- **Mensagens em português, no imperativo**, descrevendo o *porquê* quando não for óbvio.

#### Exemplo completo

```bash
git checkout main && git pull
git checkout -b feature/21-exportacao-de-relatorios

git commit -m "#21: adiciona exportação de resultados em PDF por participante"

git checkout main
git merge --no-ff feature/21-exportacao-de-relatorios
git push origin main
```

### CI/CD

Nada é compilado à mão. O GitHub Actions cuida do ciclo inteiro:

| Workflow | Quando roda | O que faz |
|---|---|---|
| [`ci.yml`](.github/workflows/ci.yml) | todo push e pull request | Vitest, Playwright (temas claro e escuro), Trivy no repositório, build da imagem + Trivy na imagem |
| [`release.yml`](.github/workflows/release.yml) | merge na `main` | Roda o CI inteiro e, só se passar, publica a imagem no GHCR |

A imagem vai para `ghcr.io/lucasrguerra/tabletop` com três tags: `latest`, a versão do `package.json` e o SHA completo do commit. **Não existe artefato de build versionado** — o `Dockerfile` compila a partir do código-fonte.

### Criando Novos Cenários

Para adicionar novos cenários:

1. Consulte o guia completo em [SCENARIO_STRUCTURE.md](SCENARIO_STRUCTURE.md)
2. Siga a estrutura JSON padronizada (metadados, objetivos, escopo, cenário base, 5 rodadas, avaliação)
3. Mantenha nomenclatura **genérica** — nunca use nomes reais de organizações, IPs públicos ou infraestrutura específica
4. Inclua múltiplos tipos de questões (60-70% múltipla escolha, restante distribuído entre V/F, numérica, correspondência, ordenação)
5. Forneça justificativas técnicas completas para todas as respostas
6. Coloque o arquivo JSON na pasta `scenarios/CATEGORIA/TIPO/` correspondente
7. Verifique que o tipo está cadastrado em `scenarios/categories.json`

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

**Lucas Rayan Guerra**

- Email: [contato@lucasrguerra.dev.br](mailto:contato@lucasrguerra.dev.br)

---

## 📝 Notas de Desenvolvimento

### Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento via `server.mjs` com Socket.IO |
| `npm run build` | Build de produção otimizado com rotas do Next.js |
| `npm run start` | Inicia servidor de produção via `server.mjs` (com `NODE_ENV=production`) |
| `npm run lint` | Executa linting do código pelo Next.js |
| `npm run clean` | Remove as pastas `.next` e arquivos de build `.tar.gz` usando `rimraf` |
| `npm test` | Executa a suíte completa de testes |
| `npm run test:unit` | Somente testes unitários |
| `npm run test:integration` | Somente testes de integração (MongoDB em memória) |
| `npm run test:watch` | Testes em modo interativo |
| `npm run test:coverage` | Relatório de cobertura de `models/` e `utils/` |
| `npm run test:e2e` | Suíte E2E com Playwright (compila antes de rodar) |
| `npm run test:e2e:theme` | Somente a auditoria de tema claro/escuro |
| `npm run test:all` | Vitest + E2E, o mesmo que o CI executa |
| `node scripts/add-admin.mjs <nickname>` | Concede papel de administrador (`admin: true`) a um usuário cadastrado |
| `node scripts/remove-admin.mjs <nickname>` | Remove o papel de administrador de um usuário cadastrado |
| `node scripts/add-facilitator.mjs <nickname>` | Concede papel de facilitador (`facilitator: true`) a um usuário cadastrado |
| `node scripts/remove-facilitator.mjs <nickname>` | Remove o papel de facilitador de um usuário cadastrado |

### Limitações Conhecidas

- **Redundância/Clusterização**: Atualmente a implementação do Next.js rate limiting em memória e as instâncias de WebSocket (Socket.IO) operam como Single Node stateful. Para múltiplos nós/clusters é necessário alocar persistência compartilhada (ex: adaptador Redis).
- **Cache de estudos por processo**: o índice de artigos é mantido em memória por instância. Alterar um JSON em `studies/` exige reiniciar o processo (ou chamar `clearStudyArticleCache()`), o que é adequado para conteúdo versionado no repositório mas não para edição em tempo de execução.
- **Cenário SEC_SYS_WEB_DEFACEMENT**: Tipo cadastrado mas sem cenário JSON implementado
- **Conteúdo pendente na biblioteca**: os termos `PDoS`, `EDoS` e `Yo-Yo DoS` estão definidos no glossário mas ainda não têm artigo que os aprofunde — a lista está em `SEM_ARTIGO_AINDA`, em `tests/unit/models/studies.integrity.test.js`.
- **`overrides` no `package.json`**: `postcss` e `sharp` são forçados acima do range declarado pelo Next.js para eliminar CVEs; revisar a cada atualização do framework.

---

<div align="center">

**[⬆ Voltar ao topo](#tabletop---plataforma-de-treinamento-em-resposta-a-incidentes)**

Desenvolvido com ❤️ para treinamentos de resposta a incidentes

</div>