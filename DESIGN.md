# Design da Interface

Documento de referência para quem for mexer na interface do Tabletop. Registra
**por que** cada decisão foi tomada, não só qual foi — a intenção é que uma
mudança futura saiba o que está contrariando.

---

## Índice

- [Princípio central](#princípio-central)
- [Sistema visual](#sistema-visual)
- [O console de treinamento](#o-console-de-treinamento)
- [Layout por fase](#layout-por-fase)
- [As três visões](#as-três-visões)
- [Componentes compartilhados](#componentes-compartilhados)
- [Biblioteca de estudos](#biblioteca-de-estudos)
- [Texto de interface](#texto-de-interface)
- [Acessibilidade](#acessibilidade)
- [Armadilhas conhecidas](#armadilhas-conhecidas)

---

## Princípio central

**A tela mostra o que serve à fase atual, não tudo que existe.**

Um exercício tabletop é uma sessão ao vivo e cronometrada. As necessidades do
facilitador mudam completamente ao longo dela:

| Fase | Status | O que importa |
|------|--------|---------------|
| Preparação | `not_started` | Código de acesso, convidar, ver quem entrou |
| Ao vivo | `active` / `paused` | Controlar a rodada e ver quem já respondeu |
| Análise | `completed` | Resultados, exportação, avaliações |

A versão anterior empilhava controle de rodada, métricas, estatísticas e
avaliações numa coluna só, em todas as fases. Durante uma sessão ao vivo o
facilitador precisava rolar a página para alternar entre as duas únicas coisas
que usava.

O agrupamento vive em `utils/useTraining.js`:

```js
export const PHASE = { SETUP: 'setup', LIVE: 'live', REVIEW: 'review' };
```

`active` e `paused` compartilham a fase `LIVE` de propósito: exigem exatamente a
mesma tela, só os controles mudam. Ao adicionar conteúdo, decida a **fase** antes
de decidir a posição.

---

## Sistema visual

A aplicação tem uma linguagem estabelecida e ela é a base: fundo `slate-50`,
cartões brancos com `rounded-2xl`, borda `slate-200/60` e sombra suave. Mudanças
devem trabalhar dentro dela.

### Cores de estado

Um estado de treinamento sempre usa a mesma família, em qualquer lugar da
interface:

| Estado | Família | Uso |
|--------|---------|-----|
| `not_started` | `slate` | Neutro, ainda não começou |
| `active` | `emerald` | Em andamento |
| `paused` | `amber` | Interrompido, requer atenção |
| `completed` | `blue` | Encerrado |

Ações destrutivas usam `red` e **nada mais** usa `red`. Isso é o que permite
identificar risco sem ler.

### Tipografia

Duas famílias, com papéis separados:

- **Montserrat** (`next/font/google`) — toda a interface e o conteúdo.
- **JetBrains Mono** (variável `--font-mono`, ligada ao `font-mono` do Tailwind
  em `app/globals.css`) — apenas telemetria: relógios, contadores, posição de
  rodada, totais de paginação.

O mono não é enfeite. Vem sempre com `tabular-nums`, e é isso que impede o
relógio de tremer enquanto os dígitos mudam durante a sessão. Se o número não
muda sozinho na tela, provavelmente não precisa de mono.

### Densidade

Rótulos de seção usam `text-xs uppercase tracking-[0.14em] text-slate-500` — são
placas de orientação, não títulos que competem com o conteúdo. Os títulos
visíveis pertencem aos cartões dentro da seção.

---

## O console de treinamento

`components/Trainings/TrainingConsole.jsx` — o instrumento da sessão ao vivo,
presente no topo das três visões.

```
┌─╥──────────────────────────────────────────────────────────────┐
│ ║ ← Treinamentos   Simulado C2 Beacon    👤 Facilitador         │
│ ║────────────────────────────────────────────────────────────── │
│ ║ ESTADO        RODADA        TEMPO TOTAL     NESTA RODADA      │
│ ║ ● Ao vivo     3/5           47:12          8:03              │
│ ║               Escalada                                        │
│ ║────────────────────────────────────────────────────────────── │
│ ║ [Pausar] [Encerrar] │ [Zerar tempo] [Contar tempo]            │
│ ║ RESPOSTAS DESTA RODADA                              7/12      │
│ ║ ▁▄█▃  ← uma coluna por questão                                │
└─╨──────────────────────────────────────────────────────────────┘
  ↑ trilho de cor = fase
```

Decisões:

- **Trilho de cor na borda esquerda** (`w-1`, cor da fase). É o único lugar onde
  estado vira cor pura, legível a distância — útil quando o console está
  projetado numa tela da sala.
- **Números grandes em mono.** A posição da rodada é o dado mais consultado da
  sessão e recebe `text-2xl lg:text-3xl`.
- **`children` recebe o instrumento específico do papel**: medidor de respostas
  para facilitador e observador, progresso pessoal para o participante.
- **Indicador de reconexão.** Se o WebSocket cai, aparece um aviso âmbar. Sem
  ele, o participante olha dados velhos achando que estão atualizados.

> Houve uma versão anterior deste console em fundo escuro (`slate-900`),
> descartada: destoava do resto da aplicação. A ideia de "instrumento separado do
> conteúdo" sobreviveu na forma do trilho de cor, do mono e do agrupamento — sem
> inverter o tema.

### Medidor de respostas

`components/Trainings/ResponseMeter.jsx` responde à pergunta que o facilitador
faz o tempo todo — *já posso avançar?* — sem expandir nada. Uma coluna por
questão, preenchida na proporção de quem já respondeu; coluna cheia fica
`emerald`, parcial fica `blue`. Coluna incompleta é gente ainda trabalhando.

Para o participante, `MyRoundProgress.jsx` faz o equivalente pessoal: um pip por
questão, preenchido quando respondida. Antes disso não havia como saber se você
tinha terminado a rodada.

---

## Layout por fase

### Facilitador, ao vivo

```
Console (estado · rodada · relógios · controles · medidor)
Controle da rodada
┌─ Respostas da equipe (2/3) ────┬─ Rodada atual (1/3) ─┐
Evidências apresentadas            ← largura total
Equipe                             ← largura total
Deletar treinamento
```

Seções largas (evidências, equipe) ocupam a linha inteira em vez de espremer na
barra lateral. Grids de conteúdo usam `items-start` para que uma coluna curta não
estique a linha e crie um vazio ao lado da coluna longa.

### Onde fica o botão de deletar

No fim da página, isolado, com borda vermelha de 2px — **nunca** na barra de
controles ao lado de *Pausar* e *Encerrar*. Deletar é irreversível e apaga
respostas e avaliações; um clique errado durante uma sessão ao vivo custa o
exercício inteiro. Continua plenamente visível, com modal de confirmação: o
objetivo é separação, não ocultação.

---

## As três visões

Todas montam sobre `TrainingShell` e `useTraining`, e diferem apenas no que
colocam no console e nas seções.

| | Facilitador | Participante | Observador |
|---|---|---|---|
| Controles da sessão | ✅ | — | — |
| Instrumento no console | Medidor da equipe | Progresso pessoal | Medidor da equipe |
| Responder questões | — | ✅ | — |
| Ver respostas dos outros | ✅ | — | ✅ |
| Gabarito e justificativas | ✅ | Após responder | ✅ |
| Código de acesso | ✅ | — | — |
| Estatísticas | ✅ | Próprias | ✅ |

**O observador recebe acesso de leitura equivalente ao do facilitador.** Antes
via exatamente o que o participante via, sem poder responder — o papel não tinha
o que observar. Como sua função é avaliar a equipe e embasar o feedback final,
precisa do gabarito. O que ele não tem é qualquer controle, e nunca o código de
acesso (`filterTrainingByRole` continua barrando isso).

### Mudança de rodada não sequestra a tela

Quando o facilitador avança, o leitor **não** é movido. Aparece um aviso
não-bloqueante (`NewRoundNotice`) com "Ir para a rodada N". A versão anterior
trocava a rodada automaticamente, o que podia arrancar alguém do meio de uma
resposta.

O estado fica em `pendingRound`, separado de `viewingRound`, com
`goToPendingRound()` e `dismissPendingRound()`.

---

## Componentes compartilhados

As três visões somavam ~1370 linhas com header, faixa de status, navegação de
rodadas, grid e toda a lógica de fetch **triplicados**. Foi por isso que a
correção de acentuação e a de `questionText` precisaram ser feitas três vezes.

### `utils/useTraining.js`

Concentra busca de dados, sincronização por Socket.IO, token CSRF, estado de
conexão e navegação de rodada.

```js
const {
  training, scenario, phase, rounds, currentRound,
  responses, responseSummary, results, evaluation,
  viewingRound, setViewingRound, pendingRound, goToPendingRound,
  loading, error, isConnected, refetch,
} = useTraining({
  expectRole: 'facilitator',   // redireciona se o papel não bater
  withResponses: true,
  withResults: true,
  withEvaluations: true,
});
```

### `components/Trainings/TrainingShell.jsx`

Cromo da página: estados de carregamento e erro, console e coluna de conteúdo.
Exporta também `Section` (rótulo + dica + ação) e `NewRoundNotice`.

**Cuidado ao usar:** os `children` de `TrainingShell` são construídos pelo
componente pai **antes** de o shell decidir se mostra o estado de carregamento.
Acessar `training.algo` diretamente no JSX quebra na primeira renderização, com
`training` ainda `null`. As três páginas saem antes por isso:

```js
if (loading || error || !training) {
  return <TrainingShell loading={loading} error={error} onRetry={...} />;
}
```

---

## Biblioteca de estudos

### Estado na URL

Filtros, busca, ordenação e página vivem em query params
(`?category=NET_VOL&search=dns&page=2`). Uma visão filtrada pode ser enviada a
um colega e o botão voltar percorre as buscas como o leitor espera. O input de
busca tem 350ms de debounce antes de escrever na URL.

### Paginação servida pelo backend

O cliente nunca recebe os 43 artigos. Consequência de projeto: os contadores da
barra lateral e dos chips **não podem** ser calculados a partir da página atual —
por isso a API devolve `facets` (contagens sobre todo o resultado filtrado) e
`library_total` (tamanho da biblioteca, ignorando filtros).

O progresso por categoria usa o campo `category` gravado em cada entrada de
`StudyProgress`, e não um cruzamento com os artigos em tela — que só refletiria a
página visível.

### Ao paginar, o conteúdo esmaece

Trocar de página não devolve a tela ao spinner: o grid recebe `opacity-60`
enquanto carrega. O layout permanece estável e a mudança fica perceptível sem ser
brusca.

---

## Texto de interface

- **Sentence case.** Nada de Caixa Alta Em Cada Palavra.
- **Nome pelo que a pessoa faz**, não pelo que o sistema é: "Encerrar", não
  "Finalizar treinamento (status → completed)".
- **A ação mantém o nome do começo ao fim.** Botão "Deletar treinamento" abre um
  modal cujo botão também diz "Deletar".
- **Erro diz o que aconteceu e o que fazer**, sem se desculpar: "Não foi possível
  abrir este treinamento" + o motivo + "Tentar de novo".
- **Estado vazio é convite**, não lamento. O vazio da biblioteca diferencia
  "Nada encontrado para *X*" de "Nenhum artigo com esses filtros", e oferece o
  botão que resolve.
- **Português com acentuação correta.** Toda a interface é em pt-BR.

---

## Acessibilidade

Piso a manter em qualquer alteração:

- `focus-visible:ring-2` em todo elemento interativo — nunca remova o foco sem
  colocar outro indicador.
- `aria-label` em botões só com ícone (setas de paginação, fechar aviso).
- `aria-current="page"` no número da página ativa; `aria-pressed` nos chips de
  filtro que alternam.
- `role="status"` com `aria-live="polite"` nos estados de carregamento e no aviso
  de reconexão.
- Conteúdo largo (tabelas, blocos de código) rola dentro do próprio contêiner; a
  página não rola na horizontal.
- Cor nunca é o único portador de informação: o estado do console tem ponto
  colorido **e** rótulo textual; o medidor tem `title` descritivo por coluna.

---

## Armadilhas conhecidas

Erros que já aconteceram neste código e valem verificação:

1. **`children` avaliado antes do early-return** — ver
   [Componentes compartilhados](#componentes-compartilhados). Rendeu 500 nas três
   visões de treinamento.

2. **`truncate` e `line-clamp` em conteúdo essencial.** O enunciado das questões
   ficava cortado na visão do facilitador, sem nenhuma forma de ler o texto
   completo. Use `break-words whitespace-pre-line` para o texto que precisa ser
   lido inteiro; reserve o corte para pré-visualizações que têm uma versão
   expandida.

3. **Campos com nomes divergentes na mesma base.** Alguns cenários usam
   `question` em vez de `text` para o enunciado — 80 questões apareciam em branco
   por causa disso. Use sempre `questionText()` de `utils/questions.js`.

4. **Renderizar o valor cru do banco.** Os badges de dificuldade mostravam
   `Basico`, `Intermediario`, `Avancado` diretamente. Os valores são chaves de
   dados; a interface precisa de um mapa para os rótulos acentuados.

5. **Reposicionar o mesmo componente entre colunas.** O cenário base era
   renderizado à esquerda na rodada 0 e à direita nas demais, e o layout saltava
   ao avançar. Um componente deve ocupar o mesmo lugar em todos os estados.

6. **Card alto em coluna estreita.** A lista de participantes, com ~90px por
   pessoa numa barra lateral, ficava mais alta que a coluna principal e abria um
   vazio na página. Seções que crescem com os dados ficam em largura total, com
   grade responsiva.
