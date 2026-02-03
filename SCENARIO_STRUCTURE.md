# Guia de Estrutura e Padrões para Cenários de Resposta a Incidentes

## Visão Geral

Este documento define a estrutura padronizada e as melhores práticas para criação de cenários de simulação tabletop de resposta a incidentes de segurança e infraestrutura. Os cenários são projetados para serem **genéricos, técnicos e reutilizáveis** por diferentes organizações.

## Estrutura do Documento JSON

### 1. Metadados Principais

```json
{
  "id": "identificador-unico-kebab-case",
  "title": "Título Descritivo do Cenário",
  "description": "Breve descrição (1-2 linhas) do tipo de incidente simulado",
  "category": {
    "id": "CATEGORIA_PRINCIPAL",
    "type": "TIPO_ESPECIFICO",
    "title": "Nome do Tipo Específico"
  }
}
```

**Princípios:**
- `id`: Identificador único, em kebab-case, descritivo do cenário
- `title`: Nome claro e direto do exercício
- `description`: Resumo objetivo do que será simulado
- `category`: Referência ao arquivo `categories.json` para categorização padronizada

### 2. Metadados do Cenário

```json
"metadata": {
  "version": "1.0",
  "lastUpdate": "YYYY-MM-DD",
  "author": "Nome da Equipe ou Organização",
  "estimatedDuration": "30-45 minutos",
  "difficulty": "Básico|Intermediário|Avançado",
  "targetAudience": "Papéis e perfis do público-alvo"
}
```

**Princípios:**
- Versionamento semântico (major.minor)
- Data no formato ISO (YYYY-MM-DD)
- Duração realista para planejamento logístico
- Dificuldade clara para seleção de participantes apropriados
- Público-alvo específico para customização do cenário

### 3. Objetivos de Aprendizagem

```json
"objectives": [
  "Objetivo mensurável 1",
  "Objetivo mensurável 2",
  "..."
]
```

**Princípios:**
- Usar verbos de ação mensuráveis: "Validar", "Avaliar", "Testar", "Identificar"
- Focar em competências práticas, não conhecimento teórico apenas
- 4-6 objetivos claros e específicos
- Evitar objetivos genéricos demais ("melhorar segurança")

### 4. Escopo e Limitações

```json
"scope": [
  "Limitação ou regra clara 1",
  "Limitação ou regra clara 2",
  "..."
]
```

**Princípios:**
- Definir CLARAMENTE o que está fora do escopo
- Especificar que é simulação tabletop (não hands-on)
- Esclarecer que não há execução em produção
- Definir foco (decisão vs. execução técnica)

### 5. Cenário Base

```json
"baseScenario": {
  "context": "Descrição do contexto organizacional e temporal",
  "initialSituation": {
    "alert": "Alerta inicial que dispara o incidente",
    "affectedHost": "Sistema/host genérico afetado",
    "keyMetrics": "Métricas críticas anormais",
    "timestamp": "HH:MM:SS"
  },
  "initialComplaints": [
    "Reclamação observável 1",
    "Reclamação observável 2"
  ],
  "availableResources": [
    "Ferramenta ou acesso 1",
    "Ferramenta ou acesso 2"
  ]
}
```

**Princípios:**
- **Genericidade**: Evitar nomes específicos de organizações, playbooks proprietários, ou infraestrutura única
  - ✅ Correto: `dns-recursive.internal`, `10.0.1.53`, `servidor DNS recursivo`
  - ❌ Incorreto: `dns.pop-pe.rnp.br`, `playbook do PoP-PE`
- Usar nomenclatura genérica para hosts: `server.internal.corp`, `monitoring.internal`
- IPs genéricos: preferencialmente de blocos privados (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
- Contexto organizacional neutro: "sua organização", "equipe de resposta a incidentes"
- Ferramentas padrão de mercado (não proprietárias)

### 6. Rodadas (Rounds)

```json
"rounds": [
  {
    "id": 1,
    "title": "Nome Descritivo da Fase",
    "phase": "Fase do Ciclo de Resposta",
    "description": "O que acontece nesta rodada",
    "timeElapsed": "T+X minutos",
    "currentSituation": {
      "metric_1": "valor",
      "metric_2": "valor",
      "impact": "Descrição do impacto"
    },
    "metrics": [...],
    "questions": [...]
  }
]
```

**Estrutura Recomendada de Rodadas:**

1. **Rodada 1 - Preparação**: Apresentação do cenário, sem questões
2. **Rodada 2 - Detecção e Análise**: Apresentação de evidências, questões sobre identificação e classificação
3. **Rodada 3 - Contenção**: Evolução após ações iniciais, questões sobre contenção
4. **Rodada 4 - Análise Avançada**: Aprofundamento técnico, questões sobre erradicação
5. **Rodada 5 - Recuperação e Pós-Incidente**: Encerramento, questões sobre lições aprendidas

**Princípios das Rodadas:**
- Progressão temporal realista (T+0, T+15min, T+30min, etc.)
- Cada rodada representa evolução natural do incidente
- Métricas devem refletir impacto das ações tomadas (ou não tomadas)
- Injetar informações novas gradualmente, não tudo de uma vez

### 7. Métricas (Metrics)

```json
"metrics": [
  {
    "title": "Nome Descritivo da Métrica",
    "type": "categoria-da-metrica",
    "data": {
      "campo1": "valor1",
      "campo2": "valor2",
      "observation": "Insight chave desta métrica"
    }
  }
]
```

**Tipos Comuns de Métricas:**
- `server-status`: Status de CPU, memória, processos
- `query-analysis`: Análise de queries, logs, padrões
- `ip-analysis`: Análise de IPs de origem, distribuição geográfica, ASNs
- `network-analysis`: Tráfego de rede, pacotes, protocolos
- `security-analysis`: Detecções de IDS/IPS, assinaturas de malware

**Princípios:**
- Dados devem ser **tecnicamente plausíveis** (não inventar métricas impossíveis)
- Incluir campo `observation` com insight chave para guiar análise
- Fornecer dados quantitativos suficientes para tomada de decisão
- Incluir comparação com baseline normal quando relevante

### 8. Questões (Questions)

O sistema suporta múltiplos tipos de questões para avaliar diferentes habilidades cognitivas:

#### 8.1. Estrutura Base de Questões

Todas as questões compartilham campos comuns:

```json
{
  "id": "q1",
  "type": "multiple-choice|true-false|numeric|matching|ordering",
  "text": "Enunciado da questão",
  "points": 5,
  "justification": "Explicação técnica da resposta correta",
  // Campos específicos do tipo variam
}
```

#### 8.2. Tipos de Questões Suportados

##### 8.2.1. Múltipla Escolha (multiple-choice)

Questão com 4 opções de resposta, apenas uma correta.

```json
{
  "id": "q1",
  "type": "multiple-choice",
  "text": "Qual é o tipo MAIS provável de ataque?",
  "options": [
    "Ataque de força bruta",
    "Ataque SYN Flood",
    "Ataque de amplificação DNS",
    "Port scanning"
  ],
  "correctAnswer": 2,
  "points": 5,
  "justification": "A opção 2 está correta porque... As opções 0, 1 e 3 estão incorretas porque..."
}
```

**Uso recomendado:** Identificação de conceitos, seleção de melhor ação entre alternativas, análise de causa raiz.

##### 8.2.2. Verdadeiro ou Falso (true-false)

Questão de validação de afirmação técnica.

```json
{
  "id": "q2",
  "type": "true-false",
  "text": "SYN cookies eliminam completamente o overhead de processamento de rede durante ataques SYN flood.",
  "correctAnswer": false,
  "points": 3,
  "justification": "FALSO. SYN cookies reduzem o overhead de memória (não mantém estado), mas o kernel ainda precisa processar cada pacote SYN recebido, gerar SYN-ACK e validar ACK final. O overhead de CPU persiste."
}
```

**Uso recomendado:** Validação de conceitos fundamentais, detecção de misconceptions comuns, verificação rápida de conhecimento.

**Pontuação sugerida:** 3 pontos (menor que múltipla escolha devido à chance de 50% de acerto aleatório).

##### 8.2.3. Numérica (numeric)

Questão que requer cálculo ou estimativa de valor numérico.

```json
{
  "id": "q3",
  "type": "numeric",
  "text": "Dado um enlace de 10 Gbps operando a 85% de utilização, quantos Gbps de capacidade livre estão disponíveis?",
  "correctAnswer": 1.5,
  "tolerance": 0.1,
  "unit": "Gbps",
  "points": 5,
  "justification": "10 Gbps × 15% = 1.5 Gbps disponíveis. Cálculo: capacidade total × (100% - utilização%)."
}
```

**Campos específicos:**
- `correctAnswer`: Valor numérico esperado
- `tolerance`: Margem de erro aceitável (±0.1 permite 1.4 a 1.6)
- `unit`: Unidade de medida (opcional, para clareza)

**Uso recomendado:** Cálculos de capacidade, conversão de unidades (dBm, largura de banda, latência), estimativas de impacto.

##### 8.2.4. Correspondência/Conexões (matching)

Questão que requer conectar elementos de duas listas (ex: IPs a papéis, sintomas a causas). É fundamental que os itens sejam apresentados embaralhados.

```json
{
  "id": "q4",
  "type": "matching",
  "text": "Conecte cada IP ao seu papel no ataque de amplificação DNS:",
  "leftColumn": {
    "title": "Endereço IP",
    "items": [
      {"id": "ip1", "content": "10.0.1.53"},
      {"id": "ip2", "content": "187.45.123.89"},
      {"id": "ip3", "content": "203.0.113.10"}
    ]
  },
  "rightColumn": {
    "title": "Papel no Ataque",
    "items": [
      {"id": "role1", "content": "Vítima (alvo final do tráfego amplificado)"},
      {"id": "role2", "content": "Refletor (servidor DNS abusado)"},
      {"id": "role3", "content": "Atacante (IP spoofed da botnet)"}
    ]
  },
  "correctMatches": [
    {"left": "ip1", "right": "role2"},
    {"left": "ip2", "right": "role3"},
    {"left": "ip3", "right": "role1"}
  ],
  "points": 6,
  "partialCredit": true,
  "pointsPerMatch": 2,
  "justification": "10.0.1.53 é o servidor DNS interno sendo abusado como refletor. 187.45.123.89 é IP da botnet (spoofed). 203.0.113.10 é a vítima real do ataque amplificado."
}
```

**Campos específicos:**
- `leftColumn`/`rightColumn`: Listas de itens a serem conectados
- `correctMatches`: Array de pares corretos
- `partialCredit`: Se true, permite pontuação parcial por acertos individuais
- `pointsPerMatch`: Pontos por cada conexão correta (se partialCredit = true)

**Uso recomendado:** Classificação de IPs (atacante/vítima/refletor), associação de sintomas a causas, mapeamento de portas a serviços, conexão de comandos a objetivos.

##### 8.2.5. Ordenação (ordering)

Questão que requer colocar itens na sequência correta.

```json
{
  "id": "q5",
  "type": "ordering",
  "text": "Ordene as etapas do handshake TCP de três vias na sequência correta:",
  "items": [
    {"id": "step1", "content": "Cliente envia pacote SYN"},
    {"id": "step2", "content": "Servidor responde com SYN-ACK"},
    {"id": "step3", "content": "Cliente envia ACK final"},
    {"id": "step4", "content": "Conexão estabelecida (estado ESTABLISHED)"}
  ],
  "correctOrder": ["step1", "step2", "step3", "step4"],
  "points": 5,
  "partialCredit": false,
  "justification": "O handshake TCP segue rigorosamente: (1) SYN do cliente, (2) SYN-ACK do servidor, (3) ACK do cliente, (4) conexão estabelecida. Esta sequência é fundamental para entender ataques SYN flood."
}
```

**Campos específicos:**
- `items`: Lista de elementos a serem ordenados (apresentados embaralhados ao usuário)
- `correctOrder`: Array com IDs na ordem correta
- `partialCredit`: Se permite pontuação parcial (geralmente false para sequências críticas)

**Uso recomendado:** Sequências de protocolo (handshakes, processos de reparo), ordem de prioridade de ações, timeline de eventos, passos de troubleshooting.

#### 8.3. Princípios Gerais de Questões

Independente do tipo, todas as questões devem seguir:

1. **Clareza**: Enunciado inequívoco, sem ambiguidade
2. **Relevância**: Alinhada aos objetivos de aprendizagem do cenário
3. **Realismo Técnico**: Baseada em situações reais de resposta a incidentes
4. **Justificativa Completa**: Explicar não apenas a resposta correta, mas o raciocínio técnico
5. **Progressão de Dificuldade**: Questões mais simples no início, mais complexas no final

#### 8.4. Taxonomia de Bloom Aplicada

Questões devem cobrir diferentes níveis cognitivos:

| Nível | Descrição | Tipos Recomendados | Exemplo |
|-------|-----------|-------------------|---------|
| **Lembrar** | Recordar fatos, termos, conceitos | True-False, Multiple-Choice | "Qual é o threshold de RX Power para 10GBASE-LR?" |
| **Entender** | Explicar ideias, interpretar dados | Multiple-Choice, Matching | "Por que RX -40 dBm indica ausência de sinal?" |
| **Aplicar** | Usar conhecimento em nova situação | Numeric, Multiple-Choice | "Calcule a capacidade livre do link a 85% de uso" |
| **Analisar** | Decompor informação, identificar padrões | Matching, Multiple-Choice | "Classifique cada IP: atacante, vítima ou refletor" |
| **Avaliar** | Julgar valor, fazer escolhas fundamentadas | Multiple-Choice, Ordering | "Qual ação de mitigação tem maior impacto?" |
| **Criar** | Gerar plano, propor solução | Multiple-Choice (limitado em tabletop) | "Qual seria a melhor estratégia de mitigação?" |

#### 8.5. Distribuição Sugerida de Tipos

Para um cenário completo com 16-20 questões:

- **Multiple-Choice**: 10-12 questões (60-70%) - Base do cenário
- **True-False**: 2-3 questões (10-15%) - Validação de conceitos
- **Numeric**: 1-2 questões (5-10%) - Cálculos práticos
- **Matching**: 1-2 questões (5-10%) - Classificação/conexões
- **Ordering**: 1 questão (5%) - Sequências críticas

#### 8.6. Pontuação por Tipo

Pontuação sugerida considerando dificuldade e probabilidade de acerto aleatório:

| Tipo | Pontos Sugeridos | Razão |
|------|------------------|-------|
| Multiple-Choice (4 opções) | 5 pontos | 25% de chance aleatória |
| True-False | 3 pontos | 50% de chance aleatória |
| Numeric | 5-6 pontos | Requer cálculo, baixa chance aleatória |
| Matching (3 pares) | 6 pontos | Múltiplas conexões corretas |
| Ordering (4 itens) | 5 pontos | Sequência completa correta |

**Total recomendado: 80-100 pontos** para facilitar conversão em porcentagem.

### 9. Avaliação (Evaluation)

```json
"evaluation": {
  "totalPoints": 100,
  "passingScore": 60,
  "gradingScale": [
    {
      "min": 90,
      "max": 100,
      "grade": "Excelente",
      "description": "Descrição do nível de competência"
    },
    ...
  ]
}
```

**Princípios:**
- Escala de 0-100 para facilidade de cálculo
- Nota de corte (passing score) realista (geralmente 60%)
- 5 níveis: Inadequado, Insatisfatório, Satisfatório, Bom, Excelente
- Descrições claras de cada nível de competência

### 10. Notas para Facilitadores

```json
"facilitatorNotes": [
  "Orientação prática 1",
  "Orientação prática 2",
  "..."
]
```

**Conteúdo Essencial:**
- Como apresentar o cenário progressivamente
- Quanto tempo alocar para discussões
- Como manter neutralidade (não fornecer respostas)
- Como mediar conflitos de opinião
- Como conduzir discussão pós-exercício
- Como documentar observações

### 11. Referências Técnicas (Opcional)

```json
"technicalReferences": [
  {
    "title": "Nome do Documento/RFC/Guia",
    "url": "https://exemplo.com/documento"
  }
]
```

**Princípios:**
- Incluir RFCs, BCP, guias de segurança oficiais
- Preferir fontes públicas e abertas
- Evitar referências a documentação proprietária

## Padrões de Nomenclatura

### Hosts e Sistemas
- ✅ **Genérico**: `dns-recursive.internal`, `web-server-01.corp`, `firewall.dmz`
- ❌ **Evitar**: `dns.pop-pe.rnp.br`, `servidor-lucas-2024`

### Endereços IP
- **Preferir IPs privados**: `10.0.1.53`, `172.16.10.5`, `192.168.1.1`
- **IPs públicos externos**: Usar exemplos genéricos de blocos brasileiros `187.x.x.x`, `200.x.x.x`

### Domínios
- ✅ **Genérico**: `internal.corp`, `example.com`, `monitoring.internal`
- ❌ **Evitar**: domínios reais de organizações específicas

### Nomes de Organização
- ✅ **Genérico**: "sua organização", "a empresa", "rede corporativa"
- ❌ **Evitar**: "PoP-PE", "RNP", "Empresa X S.A."

## Checklist de Qualidade

Antes de finalizar um cenário, verificar:

- [ ] Todos os nomes de hosts/IPs/domínios são genéricos
- [ ] Não há referências a playbooks, procedimentos ou infraestrutura específicos de uma organização
- [ ] Cada questão tem justificativa técnica sólida
- [ ] Métricas são tecnicamente plausíveis e realistas
- [ ] Progressão temporal das rodadas é lógica
- [ ] Objetivos de aprendizagem são mensuráveis
- [ ] Escopo e limitações estão claros
- [ ] Todas as opções de resposta são plausíveis (para múltipla escolha)
- [ ] **Tipos de questões são variados** (não apenas múltipla escolha)
- [ ] **Distribuição de tipos respeita as proporções sugeridas** (60-70% multiple-choice, 10-15% true-false, etc.)
- [ ] **Pontuação por tipo está calibrada** (true-false = 3pts, numeric/matching = 5-6pts, etc.)
- [ ] Avaliação tem critérios claros
- [ ] Referências técnicas são públicas e acessíveis
- [ ] Categoria está corretamente mapeada no `categories.json`

## Exemplo de Fluxo de Criação

1. **Escolher categoria**: Consultar `categories.json` e selecionar tipo de incidente
2. **Definir objetivos**: Listar 4-6 competências a serem avaliadas
3. **Criar cenário base**: Contexto genérico, situação inicial, recursos disponíveis
4. **Planejar rodadas**: 5 rodadas seguindo ciclo de resposta (Detecção → Análise → Contenção → Erradicação → Recuperação)
5. **Desenvolver métricas**: Dados técnicos realistas para cada rodada
6. **Escrever questões**: 
   - Planejar distribuição de tipos (60-70% multiple-choice, 10-15% true-false, etc.)
   - Criar 16-20 questões variadas com opções plausíveis e justificativas técnicas
   - Incluir pelo menos 1-2 questões de cada tipo (matching, numeric, ordering) quando aplicável
   - Garantir progressão de dificuldade (Bloom: Lembrar → Entender → Aplicar → Analisar → Avaliar)
7. **Revisar genericidade**: Remover TODAS as referências específicas
8. **Testar internamente**: Fazer dry-run com equipe técnica
9. **Refinar**: Ajustar baseado no feedback do teste

## Adaptação para Contextos Específicos

Embora os cenários sejam genéricos, facilitadores PODEM (e devem) adaptar para seu contexto:

- **Durante apresentação verbal**: Substituir nomes genéricos por nomes reais da organização
- **Em material impresso**: Criar versão customizada substituindo `internal.corp` por domínio real
- **Em discussões**: Referenciar procedimentos internos específicos sem alterar o JSON base

**O objetivo é manter o JSON genérico e reutilizável, permitindo adaptação contextual na execução.**