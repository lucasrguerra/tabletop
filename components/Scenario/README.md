# Scenario Components

Componentes relacionados à gestão e visualização de treinamentos (cenários).

## Estrutura de Componentes

### TrainingHeader
Componente de cabeçalho que exibe informações gerais do treinamento:
- Nome do treinamento
- Criador do treinamento
- Status e role do usuário
- Informações do cenário
- Tipo de acesso e código (apenas para facilitador)
- Contagem de participantes

**Props:**
- `training` - Objeto com dados do treinamento
- `userRole` - Função do usuário atual
- `getStatusBadge` - Função para renderizar badge de status
- `getRoleBadge` - Função para renderizar badge de função

---

### TrainingTimer
Componente de cronômetro para controlar o tempo do treinamento.

**Props:**
- `currentTime` - Tempo atual em milissegundos
- `formatTime` - Função para formatar tempo

**Funcionalidades futuras:**
- Iniciar/pausar/resetar cronômetro
- Sincronização entre participantes

---

### TrainingTabs
Componente principal de navegação por abas, gerencia a exibição das diferentes seções.

**Props:**
- `training` - Objeto com dados do treinamento
- `currentTime` - Tempo atual do cronômetro
- `formatTime` - Função para formatar tempo
- `getRoleBadge` - Função para renderizar badge de função
- `activeTab` - ID da aba ativa atualmente
- `setActiveTab` - Função para mudar a aba ativa

**Abas disponíveis:**
- Rodadas (rounds)
- Métricas (metrics)
- Questões (questions)
- Participantes (participants)

---

### RoundsTab
Componente para gerenciar rodadas do treinamento.

**Funcionalidades futuras:**
- Criar novas rodadas
- Listar rodadas existentes
- Editar/excluir rodadas
- Marcar rodadas como concluídas

---

### MetricsTab
Componente de métricas e estatísticas do treinamento.

**Props:**
- `training` - Objeto com dados do treinamento
- `currentTime` - Tempo atual do cronômetro
- `formatTime` - Função para formatar tempo

**Métricas exibidas:**
- Tempo total (do cronômetro)
- Participantes ativos (apenas usuários com role 'participant')
- Rodadas concluídas

**Nota importante:** Este componente filtra e conta apenas usuários com `role === 'participant'`, excluindo facilitadores e observadores das métricas.

---

### QuestionsTab
Componente para documentar questões e problemas durante o treinamento.

**Funcionalidades futuras:**
- Adicionar novas questões
- Listar questões registradas
- Marcar questões como resolvidas
- Adicionar comentários/respostas

---

### ParticipantsTab
Componente que exibe lista completa de todos os participantes do treinamento.

**Props:**
- `training` - Objeto com dados do treinamento
- `getRoleBadge` - Função para renderizar badge de função

**Informações exibidas:**
- Nome completo
- Email
- Nickname
- Função (facilitator, participant, observer)
- Data/hora de entrada

---

## Uso

```jsx
import {
  TrainingHeader,
  TrainingTimer,
  TrainingTabs
} from '@/components/Scenario';

// Usar os componentes na página
<TrainingHeader 
  training={training}
  userRole={userRole}
  getStatusBadge={getStatusBadge}
  getRoleBadge={getRoleBadge}
/>

<TrainingTimer 
  currentTime={currentTime}
  formatTime={formatTime}
/>

<TrainingTabs 
  training={training}
  currentTime={currentTime}
  formatTime={formatTime}
  getRoleBadge={getRoleBadge}
  activeTab={activeTab}
  setActiveTab={setActiveTab}
/>
```

## Observações

- Todos os componentes são client-side (não precisam da diretiva "use client" pois a página pai já a possui)
- Os componentes são projetados para serem reutilizáveis
- A lógica de negócio permanece na página pai, os componentes apenas renderizam
