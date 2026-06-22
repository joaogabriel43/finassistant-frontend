# Auditoria de Fidelidade — Redesign D4 "Bento Refinado"

> **Escopo**: comparação entre o protótipo de referência D4 (`C:\Users\joaoz\Downloads\d4-*.{jsx,js,css}`) e a implementação React real em `D:\Faculdade\TCC\Projeto\finassistant-frontend\src`.
> **Natureza**: documento de auditoria — nenhuma alteração de código foi realizada.
> **Pareceres combinados**: análise técnica de fidelidade de código (estrutura/props/lógica) + avaliação de fidelidade visual/design system (tokens/tipografia/layout).

---

## 1. Tabela-resumo

| # | Item | Status | Resumo |
|---|---|---|---|
| 1 | Dashboard — CSS Grid bento | ✅ Fiel ao design | `gridTemplateAreas` com as 6 áreas nomeadas (`hero score insight comp evo tx`) replicadas via `sx` do MUI `Box` |
| 2 | Chat — Scroll containment | ⚠️ Parcialmente implementado | Scroll fica contido na área de mensagens, mas a estrutura de containers diverge da referência (double `100vh` aninhado) — funciona, porém é frágil e foge do padrão D4 |
| 3 | Sidebar — posição user info + notificações | ❌ Divergente | Avatar, nome, plano e sino ficam no **topo** (cabeçalho), não no rodapé fixo (`d4-side-foot`) como na referência |
| 4 | Tokens — CSS vars → MUI theme | ⚠️ Parcialmente implementado | `applyCssVars()` é chamado no boot e `theme.js` espelha os tokens fielmente, mas restam **muitas cores hardcoded** (hex/rgba) nos componentes auditados, inclusive fora dos primitivos |
| 5 | Primitivos SVG (RingGauge/Donut/Sparkline) | ⚠️ Parcialmente implementado | Primitivos existem com API quase idêntica à referência e substituem `CircularProgress`/`Pie` no Dashboard novo — mas **componentes legados** (`PortfolioDonutChart`, `GastosPorCategoriaChart`, `DividendosCard`) continuam usando Recharts `Pie`/`CircularProgress`, gerando duas linguagens visuais coexistindo |
| 6 | Tipografia monetária (fonte mono) | ⚠️ Parcialmente implementado | Aplicada corretamente no Dashboard novo (Hero, ScoreSaudeCard, ComposicaoCard), mas **ausente** em `TransactionList`, `SaldoLineChart`, `DividendosCard` e no `Chat` (`formatCurrencyInText`) — esses redefinem `formatBRL` localmente em vez de importar de `components/ui` |

---

## 2. Detalhamento por item

### 2.1 DASHBOARD — CSS Grid bento

**(a) Referência**: `d4-app.jsx` (`DashboardBento`, linhas 54-79) compõe 6 cards (`HeroPatrimonioCard`, `ScoreSaudeCard`, `InsightCard`, `ComposicaoCard`, `EvolucaoCard`, `TransacoesCard`) dentro de `<div className="d4-bento">`. O CSS correspondente (`d4.css:61-65`) define:
```css
.d4-bento { display: grid; gap: 14px;
  grid-template-columns: repeat(4, 1fr); grid-template-rows: 1.22fr 1fr 1.12fr;
  grid-template-areas: "hero hero score insight" "hero hero score comp" "evo evo tx comp"; }
```
com classes `.a-hero`, `.a-score`, `.a-insight`, `.a-comp`, `.a-evo`, `.a-tx` mapeando `grid-area`.

**(b) Implementação**: `pages/Dashboard.jsx:108-122` usa um `Box` com `display: 'grid'` e:
```jsx
gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
gridTemplateAreas: {
  xs: 'none',
  md: `
    "hero hero score insight"
    "hero hero score comp"
    "evo evo tx comp"
  `,
},
```
Cada `Paper` recebe `gridArea: { md: 'hero' }` (linha 128), `{ md: 'score' }` (173), `{ md: 'insight' }` (178), `{ md: 'comp' }` (185), `{ md: 'evo' }` (193), `{ md: 'tx' }` (201) — exatamente as 6 áreas nomeadas da referência, inclusive a ordem e o agrupamento das linhas do template. O `gap: 3` (24px no espaçamento base de 4px do tema) é equivalente ao `gap: 14px` original (pequena diferença de escala, não estrutural). Adicionalmente, a implementação acrescenta um fallback responsivo `xs: 'none'` com `gridTemplateColumns: '1fr'`, que não existe tal qual no protótipo (lá o breakpoint usa `@media (max-width: 820px)` reescrevendo `grid-template-areas` para empilhar — `d4.css:223-227`), mas atinge o mesmo objetivo de empilhamento em telas pequenas.

**(c) Status: ✅ Fiel ao design.** A estrutura de grid nomeado foi corretamente portada para `sx` do MUI, célula a célula, preservando a composição visual "bento" pretendida pela referência.

---

### 2.2 CHAT — Scroll containment

**(a) Referência**: `d4.css:125,134` define
```css
.d4-chat { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }
.d4-chat-body { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 24px 28px; }
```
O container `.d4-chat` tem `overflow: hidden` e ocupa o espaço restante do `.d4-app` (que é `position: fixed; inset: 0` — `d4.css:14`, ou seja, **altura controlada por um único container raiz fixo**). Apenas `.d4-chat-body` rola.

**(b) Implementação**: `components/Chat.jsx:218-230` define o container raiz do Chat como:
```jsx
<Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: 900, mx: 'auto', ... }}>
```
e o corpo de mensagens (linhas 277-284):
```jsx
<Box sx={{ flexGrow: 1, overflowY: 'auto', px: { xs: 0.5, md: 1 }, py: 1, mb: 2 }}>
```
Isso reproduz a intenção (`flex: 1` + `overflowY: auto` dentro de uma coluna flex de altura controlada — equivalente ao padrão `.d4-chat` / `.d4-chat-body`). **Porém**, o Chat não é o container raiz da aplicação: ele é renderizado dentro de `components/layout/Layout.jsx:108-117`, cujo `<Box component="main">` já possui `height: { xs: 'calc(100vh - 56px)', md: '100vh' }` **e** `overflowY: 'auto'` (Layout.jsx:113-119). Ou seja, existem **dois containers com `100vh` aninhados** (`Layout main` → `Chat root Box`), e o pai do Chat já é por si só rolável. Na prática isso funciona porque o Chat preenche os 100vh do pai e seu próprio scroll interno consome o evento antes de propagar — não há vazamento visível de scroll para a página — mas é uma duplicação estrutural que diverge do modelo único `.d4-app[fixed] → .d4-chat[flex] → .d4-chat-body[scroll]` da referência, e é frágil: qualquer mudança futura no `Layout` (ex.: padding extra, footer mais alto) pode reintroduzir scroll duplo ou cortar o composer.

**(c) Status: ⚠️ Parcialmente implementado.** O comportamento funcional (scroll contido nas mensagens) está correto e o usuário não percebe vazamento, mas a estrutura de containers diverge do "single root fixed + flex column" da referência — `height: '100vh'` no Chat dentro de um `main` que já é `height: 100vh; overflow: auto` é redundante e estruturalmente incorreto, mesmo funcionando hoje por acidente de composição (o filho preenche exatamente o espaço do pai).
**Causa provável**: o Chat foi portado isoladamente sem revisitar o contrato de altura do `Layout.jsx` legado (que predate o redesign D4 e mantém seu próprio `100vh`/`overflowY: auto` herdado do shell antigo).
**Impacto visual concreto**: nenhum no estado atual (telas testadas não mostram barra de rolagem dupla), mas é um ponto de fragilidade — testes E2E de scroll/resize devem cobrir este caso antes do lançamento.

---

### 2.3 SIDEBAR — Posição do user info + notificações

**(a) Referência**: `d4-app.jsx:40-47` posiciona avatar, nome, plano e sino **dentro de `.d4-side-foot`**, um rodapé fixo da sidebar (`margin-top: auto` — `d4.css:43`), **após** toda a navegação:
```jsx
<div className="d4-side-foot">
  <div className="d4-av">{user.iniciais}</div>
  <div>...nome / Plano {user.plano}...</div>
  <D4Icon name="bell" .../>
</div>
```
`.d4-side-foot` (`d4.css:43`) é estilizado como um cartão (`border`, `background: var(--c-surface)`, `border-radius`) fixado ao final da coluna flex via `margin-top: auto`.

**(b) Implementação**: `components/Sidebar.jsx:39-79` posiciona avatar/notificações/badge de plano **no topo**, dentro do cabeçalho da sidebar, logo abaixo do logo "FortunAI":
```jsx
{/* Linha 1: Logo ←→ Controles */}
<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
  <Typography>FortunAI</Typography>
  <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
    <NotificacoesBadge />
    <UserMenu />
  </Box>
</Box>
{/* Linha 2 */}
<Box sx={{ display: 'flex', gap: 0.75, mt: 0.25 }}>
  <Typography>Assistente Financeiro</Typography>
  <PlanoBadge />
</Box>
```
Não existe nenhum bloco equivalente a `.d4-side-foot` com `margin-top: auto`. O que ocupa o rodapé (linhas 123-140) é um bloco **"AMBIENTE: DEVELOPMENT"**, visível apenas em modo dev — sem relação com o conteúdo de usuário da referência.

**(c) Status: ❌ Divergente.** A composição visual (avatar + nome + plano + sino agrupados num cartão de rodapé fixo) prevista pela referência **não existe** na implementação; os mesmos elementos (`UserMenu`, `PlanoBadge`, `NotificacoesBadge`) foram todos realocados para o cabeçalho/topo da sidebar.
**Causa provável**: decisão técnica deliberada — o comentário no código ("Layout em 2 linhas para caber nos 220px da sidebar") indica que o desenvolvedor conscientemente reorganizou esses elementos no topo para resolver um problema de espaço/overflow, divergindo intencionalmente do mockup.
**Impacto visual observável**: a sidebar real não tem o "cartão de usuário" inferior estilizado (`d4-av` com gradiente, fundo `--c-surface`, borda) que dá ao protótipo D4 sua assinatura visual de rodapé; em vez disso o usuário vê controles de conta misturados ao branding no topo — uma composição visualmente diferente da referência aprovada, embora funcionalmente equivalente (mesmas informações disponíveis).

---

### 2.4 TOKENS — Mapeamento CSS vars → MUI theme

**(a) Referência**: `d4-tokens.js:55-66` exporta `d4CssVars()`, que gera `--c-*`/`--r-*`/`--f-*` a partir do objeto único `D4_TOKENS`, injetadas no elemento raiz (`d4-app.jsx:259`: `<div className="d4-app" style={d4CssVars()}>`). Comentário explícito na própria referência (`d4-tokens.js:7-8`): *"In the real FortunAI app, fold this into src/theme.js ... so JSX (sx prop) and CSS stay in sync"*.

**(b) Implementação**:
- `applyCssVars()` **é chamado no boot**: `main.jsx:11` — `applyCssVars()` antes do `createRoot(...).render(...)`, aplicando as variáveis em `document.documentElement` (ver `theme.js:217-221`). ✅ Conforme especificado.
- `theme.js:25-63` replica `tokens` com a mesma estrutura/valores de `d4-tokens.js` (cores, radius, fontes, motion) — fonte única coerente.
- **Porém**, ao verificar consumo de cor nos componentes auditados via grep por `#[0-9a-fA-F]{3,6}` e `rgba?\(`, encontram-se **diversas cores hardcoded fora de `theme.palette.*`/`tokens.colors.*`**:
  - `components/Chat.jsx:241,328,343,471` → `color: '#fff'`; `:243,473,474` → `boxShadow`/`background` com `rgba(124,106,247,...)` e `rgba(255,255,255,...)` literais (deveriam vir de `theme.palette.accent.primarySoft` / `theme.palette.lines.*`); `:296` → `bgcolor: 'rgba(255,255,255,0.05)'` (equivalente a `--c-raised`/`surfaces.raised`, mas hardcoded).
  - `components/Sidebar.jsx:53` → `color: '#7C6AF7'` (= `tokens.colors.primary`, deveria ser `theme.palette.primary.main`); `:96` → `'#ffffff'`/`'#8B8BA8'` (este último **nem está nos tokens D4** — é um cinza “órfão” fora da paleta `textDim #9494A6`/`textFaint #62626F`); `:97` → `rgba(124, 106, 247, 0.15)` (deveria ser `theme.palette.accent.primarySoft`, que é `rgba(124,106,247,0.14)` — quase idêntico, porém duplicado/hardcoded em vez de referenciado); `:112-114` → `'#FFD700'`/`rgba(255,215,0,...)` (cor de "Premium" **inteiramente fora da paleta D4** — não existe token dourado em `d4-tokens.js`).
  - `components/dashboard/TransactionList.jsx:50-51,55-56,80-83` → `'rgba(76,175,80,0.15)'`, `'#4CAF50'`, `'rgba(255,77,106,0.15)'`, `'#FF4D6A'` — cores de crédito/débito **completamente fora da paleta D4** (que define `pos: '#2DD4A7'` / `neg: '#FF5C77'` para os mesmos conceitos em `theme.palette.success.main`/`error.main`).
  - `components/dashboard/SaldoLineChart.jsx:44-45,50,56,62,69-70,80-84` → `'#7C6AF7'`, `'rgba(255,255,255,0.04)'`, `'#8B8BA8'`, `'#1A1A24'`, `'#0A0A0F'` literais no lugar de `theme.palette.primary.main`/`theme.palette.text.secondary`/`theme.palette.surfaces.raised`.
  - Primitivos `RingGauge.jsx:46-47` e `Sparkline.jsx:23` usam **defaults** `color = '#7C6AF7'` / `track = 'rgba(255,255,255,0.07)'` — aceitável como *fallback* de prop (a referência também faz isso: `d4-primitives.jsx:27`), mas só é realmente "sem hardcode" se todo *consumidor* sempre passar a cor via `theme.palette.*` explicitamente. Os consumidores corretos (`ScoreSaudeCard`, `Dashboard` Hero/Sparkline) **passam a cor do tema** (ex.: `Dashboard.jsx:167` → `color={theme.palette.primary.light}`), então o fallback nunca é exercitado em produção — comportamento correto, mas vale registrar que o "hardcode" nos defaults dos primitivos espelha a referência (não é regressão).

**(c) Status: ⚠️ Parcialmente implementado.** A infraestrutura de tokens (`applyCssVars` + `theme.js` espelhando `d4-tokens.js`) está corretamente montada e ativa no boot — esse pilar está ✅. Mas a regra "consumir cor exclusivamente via `theme.palette.*`/`tokens.colors.*`" (ADR de design system, seção "Regras que nunca quebrar" do `CLAUDE.md`) **não é respeitada de forma consistente**: `Sidebar`, `Chat` e, principalmente, `TransactionList`/`SaldoLineChart` (componentes legados não tocados pelo redesign) têm cores hex/rgba hardcoded, incluindo cores que **nem existem na paleta D4** (`#8B8BA8`, `#FFD700`, `#4CAF50`, `#FF4D6A`, `#1A1A24`).
**Causa provável**: mistura de componentes novos (D4) com legados (pré-redesign) — `TransactionList`, `SaldoLineChart`, `DividendosCard` e `Sidebar`/`Chat` (parcialmente) não foram recodificados durante o sprint de design, apenas reaproveitados dentro do novo grid/layout, preservando suas cores antigas (anteriores ao token D4).
**Impacto visual observável**: setas de crédito/débito na lista de transações usam verde/vermelho de uma paleta diferente (`#4CAF50`/`#FF4D6A`) da usada no resto do app (`pos #2DD4A7`/`neg #FF5C77`), criando inconsistência cromática perceptível ao alternar entre o card de transações e qualquer outro indicador de ganho/perda (ex.: chips de variação no chat, séries do score). O gráfico de evolução de saldo (`SaldoLineChart`) usa um tooltip com fundo `#1A1A24` que destoa sutilmente do `--c-raised` (`#16161f`) usado em todo o resto da UI.

---

### 2.5 PRIMITIVOS SVG — RingGauge, Donut, Sparkline

**(a) Referência**: `d4-primitives.jsx` define os três primitivos como componentes puros, parametrizados, "sem fetch de dados, sem app state", destinados a substituir `CircularProgress`/`Pie` (comentário explícito nas linhas 7-8: *"In the real app these live in src/components/ui/ and replace the bespoke MUI CircularProgress / Recharts Pie usages"*). APIs:
- `RingGauge({ value, size=130, stroke=11, color, track, children, animate=true })` (linha 27)
- `Donut({ segments, size=160, thickness=20, gap=4, children, bg, animate=true })` (linha 49)
- `Sparkline({ data, color, height=70, id, fill=0.28, strokeW=2.25, grid=false, animate=true })` (linha 82)

**(b) Implementação**: os três foram criados em `src/components/ui/{RingGauge,Donut,Sparkline}.jsx` com **APIs praticamente idênticas**:
- `RingGauge.jsx:42-50`: `{ value, size=130, stroke=11, color='#7C6AF7', track='rgba(255,255,255,0.07)', animate=true, children }` — mesma assinatura, mesmo cálculo de `circ`/`offset`, mesma transição CSS (`'stroke-dashoffset .95s cubic-bezier(.22,.7,.3,1)'`).
- `Donut.jsx:26-34`: `{ segments, size=160, thickness=20, gap=4, bg, animate=true, children }` — idêntico, inclusive a lógica de `acc`/`shown`/`offset`.
- `Sparkline.jsx:21-29`: `{ data, color, height=70, fill=0.28, strokeW=2.25, grid=false, animate=true }` — a única diferença de API é a ausência do prop `id` (a referência usa `id` para compor `gid = d4sg-${id}`; a implementação usa `useId()` do React para gerar um `gid` único automaticamente — `Sparkline.jsx:33-34` — uma melhoria técnica que elimina a necessidade de o consumidor fornecer IDs únicos manualmente).
- `useMountTween` foi corretamente extraído como hook compartilhado (`RingGauge.jsx:12-23`, reexportado por `Donut.jsx:2`), e ganhou tratamento de `prefers-reduced-motion` via `window.matchMedia` (linhas 13-15) — algo que a referência também previa ("respects prefers-reduced-motion via the animate prop") mas implementava apenas no nível do CSS global (`d4.css:201-203`), não no hook. Esta é uma melhoria de robustez sobre a referência.

Quanto à substituição de `CircularProgress`/`Pie`:
- **No Dashboard novo**: `ScoreSaudeCard.jsx:86` usa `RingGauge` (substituiu o `CircularProgress` que presumivelmente existia antes — o comentário "Skeleton variant=circular" na linha 54 sugere que o loading state ainda imita um círculo, mas o componente carregado usa o primitivo correto). `ComposicaoCard.jsx:29` usa `Donut`. `Dashboard.jsx:167` usa `Sparkline`. ✅ Os três primitivos estão de fato em uso nos cards centrais do bento, exatamente como a referência prescreve.
- **Fora do escopo do redesign** (componentes legados, não listados no escopo da auditoria mas capturados pelo grep): `DividendosCard.jsx:45` ainda usa `CircularProgress`; `ExportarRelatorioButton.jsx:36` usa `CircularProgress` (uso legítimo — spinner de loading de botão, não um gauge de dados); `GastosPorCategoriaChart.jsx:78-94` e `PortfolioDonutChart.jsx:43-66` continuam usando Recharts `PieChart`/`Pie`. `PortfolioDonutChart` parece ser **código morto** — o grep não encontra nenhuma importação dele em páginas/componentes ativos (apenas a própria definição), sugerindo que foi substituído por `ComposicaoCard`/`Donut` mas não removido.

**(c) Status: ⚠️ Parcialmente implementado.** Os primitivos em si (`RingGauge`, `Donut`, `Sparkline`) foram portados com **alta fidelidade de API e comportamento** — peça central do redesign cumprida com qualidade, inclusive com melhorias (gid via `useId`, `prefers-reduced-motion` no hook). A divergência está em **escopo**: a referência prevê que eles substituam *todos* os usos de `CircularProgress`/`Pie` para dados (não spinners de loading), mas `GastosPorCategoriaChart` e `PortfolioDonutChart` (este último aparentemente órfão) continuam com Recharts `Pie`, criando duas linguagens visuais (SVG D4 vs. Recharts) coexistindo no mesmo produto.
**Causa provável**: limitação de escopo/tempo — o redesign focou no *Dashboard bento* (`Dashboard.jsx`) e não tocou em telas/gráficos secundários (`Orcamento.jsx` provavelmente usa `GastosPorCategoriaChart`); `PortfolioDonutChart` ficou esquecido como código morto após a migração para `ComposicaoCard`.
**Impacto visual observável**: ao navegar do Dashboard (donut SVG D4, animação de revelação suave, cores da série do tema) para a tela de Orçamento (gráfico de pizza Recharts, com tooltip/legendas em estilo Recharts padrão), o usuário percebe uma **mudança de linguagem visual** entre seções do mesmo produto — quebra de consistência perceptível, mas não crítica (não é uma tela do "core" do redesign).

---

### 2.6 TIPOGRAFIA MONETÁRIA — fonte mono em valores BRL

**(a) Referência**: `d4-tokens.js:46` define `font.mono: "'JetBrains Mono', ui-monospace, monospace"` com o comentário explícito *"ALL monetary values (from D3)"*. O CSS aplica isso via classe utilitária `.d4-mono` (`d4.css:22`): `font-family: var(--f-mono); font-variant-numeric: tabular-nums; letter-spacing: -0.02em;`, usada em **todo** elemento que renderiza dinheiro (`d4-app.jsx:64,92-94,104,155,186,212` — chips, valores de posição, KPIs, badges de teclado, quotas).

**(b) Implementação**:
- `components/ui/index.js:20-34` exporta `formatBRL`/`formatBRLShort` como **formatadores puros** baseados em `Intl.NumberFormat` — não aplicam `fontFamily` (responsabilidade dos componentes consumidores, conforme a divisão de responsabilidades correta especificada no prompt).
- `theme.js:102` expõe `fontFamilyMono: tokens.font.mono` em `typography` — a "ponte" para os componentes aplicarem a fonte mono corretamente.
- **Aplicação correta** (componentes do Dashboard novo, todos com `const mono = (t) => t.typography.fontFamilyMono` e `sx={{ fontFamily: mono, ... }}`):
  - `Dashboard.jsx:22,46,146` — `MiniStat` e o valor do Hero (`patrimonioTotal`) aplicam `fontFamily: mono`.
  - `ScoreSaudeCard.jsx:7,27,87` — pontuação do score e pontos dos componentes (`pontos/25`) usam `fontFamily: mono`.
  - `ComposicaoCard.jsx:5,33,56,59` — total do donut e valores/percentuais da legenda usam `fontFamily: mono`.
- **Aplicação ausente** (valores monetários renderizados sem `fontFamilyMono`, usando a fonte UI padrão Hanken Grotesk):
  - `components/dashboard/TransactionList.jsx:16-17,33-40` — define **localmente** `const formatBRL = (value) => new Intl.NumberFormat(...)` (duplicando, em vez de importar, o formatter de `components/ui`) e renderiza o valor da transação em `<Typography variant="body2" fontWeight={600} color={...}>` **sem** `sx={{ fontFamily: ... }}` — o valor sai com a fonte UI.
  - `components/dashboard/SaldoLineChart.jsx:32-33,75` — idem: `formatBRL` redefinido localmente; usado apenas dentro do `formatter` do `Tooltip` do Recharts (`contentStyle` define `fontSize: 12` mas não `fontFamily`), portanto o tooltip do gráfico de evolução do saldo mostra valores em fonte UI, não mono.
  - `components/dashboard/DividendosCard.jsx:16,89,162,170,201` — mesmo padrão: `formatBRL` local, sem `fontFamily: theme.typography.fontFamilyMono` em nenhum dos 4 pontos onde formata e renderiza valores (`totalMes`, `totalPago`, `totalProvisionado`, `valorPorCota`).
  - `components/Chat.jsx:371` — usa `formatCurrencyInText(msg.text)` (de `utils/formatters.js`, que internamente chama `formatBRL` de `components/ui` para *substituir substrings* dentro do texto da mensagem via regex) dentro de um `<Typography component="span" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.92rem', ... }}>` — **sem** `fontFamily: fontFamilyMono`. Como o valor formatado é uma substring dentro de um texto maior (não um elemento isolado), aplicar a fonte mono apenas ao trecho numérico exigiria tokenizar o texto em partes (texto normal + spans monoespaçados) — o que não foi feito; o span inteiro (texto + valor) usa a fonte UI.

**(c) Status: ⚠️ Parcialmente implementado.** A "ponte" está corretamente construída (`theme.typography.fontFamilyMono` exposto, formatadores puros e centralizados em `components/ui`), e os **três cards centrais do bento novo** (`Hero`/`MiniStat`, `ScoreSaudeCard`, `ComposicaoCard`) aplicam a fonte mono fielmente. Mas a regra "TODOS os valores BRL usam `fontFamily: theme.typography.fontFamilyMono`" (seção "Regras que nunca quebrar" do `CLAUDE.md`) é **violada em pelo menos 4 componentes** que renderizam dinheiro: `TransactionList` (valores de transação no card "Últimas Transações" — que está *dentro* do bento auditado), `SaldoLineChart` (tooltip do gráfico "Evolução do Saldo"), `DividendosCard` e o `Chat` (valores mencionados nas respostas do assistente).
**Causa provável**: esses componentes redefinem `formatBRL` localmente (cópias divergentes do helper, ao invés de importar `formatBRL`/`formatBRLShort` de `components/ui`) — sinal de que não foram tocados durante a unificação de tokens do redesign D4, e a "fonte única da verdade" dos formatadores não chegou a ser propagada para eles. O caso do `Chat` é estruturalmente diferente: o valor está embutido em texto livre gerado pelo backend, exigindo tokenização para aplicar estilo seletivo — provavelmente fora do escopo de tempo do sprint.
**Impacto visual observável**: na mesma tela do Dashboard, o card "Últimas Transações" (com `TransactionList`) mostra valores em Hanken Grotesk lado a lado com o card Hero (mesma tela, mesmo grid) mostrando valores em JetBrains Mono — a inconsistência tipográfica é **diretamente perceptível** porque os dois cards são vizinhos no mesmo grid bento. O mesmo vale para o tooltip de "Evolução do Saldo".

---

## 3. Lista priorizada de correções recomendadas

Ordenada por **impacto visual × esforço de correção** (do maior retorno/menor esforço para o menor):

1. **[Alto impacto / Baixo esforço] Aplicar `fontFamily: theme.typography.fontFamilyMono` em `TransactionList.jsx`** (linhas 33-40) e remover o `formatBRL` local redefinido (importar de `../ui`). É o card mais visivelmente adjacente ao Hero no bento — a inconsistência tipográfica entre os dois é a mais perceptível de toda a auditoria, e a correção é apenas adicionar `sx={{ fontFamily: (t) => t.typography.fontFamilyMono }}` ao `Typography` do valor + trocar o import.

2. **[Alto impacto / Baixo esforço] Substituir cores hardcoded de crédito/débito em `TransactionList.jsx`** (`#4CAF50`/`#FF4D6A`/`rgba(76,175,80,...)`/`rgba(255,77,106,...)`, linhas 50-56 e 80-83) por `theme.palette.success.main`/`theme.palette.error.main` (que já mapeiam para `pos #2DD4A7`/`neg #FF5C77` — os tokens corretos do D4). Mudança mecânica de poucas linhas, elimina uma paleta cromática paralela dentro do mesmo card do bento.

3. **[Médio impacto / Baixo esforço] Aplicar fonte mono e tokens de cor em `SaldoLineChart.jsx`** — trocar `formatBRL` local por import de `../ui`, adicionar `fontFamily` ao `contentStyle` do `Tooltip` (linha 68-73), e substituir os hex literais (`#7C6AF7`, `#8B8BA8`, `#1A1A24`, `#0A0A0F`, `rgba(255,255,255,0.04)`) por `theme.palette.primary.main`/`theme.palette.text.secondary`/`theme.palette.surfaces.raised`/`theme.palette.divider` via `useTheme()`. Esforço baixo (são poucas constantes), impacto perceptível ao passar o mouse sobre o gráfico de "Evolução do Saldo".

4. **[Médio impacto / Médio esforço] Resolver as cores "órfãs" fora da paleta D4 no `Sidebar.jsx`** — `#8B8BA8` (cinza de nav inativo, linha 96) e `#FFD700`/`rgba(255,215,0,...)` (badge "Premium", linhas 112-114) não existem em `tokens.colors`. Decidir: (i) mapear `#8B8BA8` para `textDim`/`textFaint` mais próximos, ou (ii) formalizar essas cores como extensão deliberada da paleta (ex.: adicionar `gold`/`premium` a `tokens.colors` e `theme.palette.accent`) para que passem a ser tokens rastreáveis em vez de literais soltos. Esforço médio porque exige decisão de design, não é puramente mecânico.

5. **[Médio impacto / Médio esforço] Mover o bloco de usuário (avatar/nome/plano/sino) da Sidebar para um rodapé fixo equivalente a `.d4-side-foot`** — reorganizar `UserMenu`, `PlanoBadge`, `NotificacoesBadge` para um `Box` com `mt: 'auto'`, estilizado como cartão (`border`, `bgcolor: 'surfaces.surface'`, `borderRadius: 'lg'`), substituindo o atual bloco "AMBIENTE: DEVELOPMENT" como ocupante do rodapé (ou posicionando acima dele). Esforço médio: requer testar se cabe nos 220px sem reintroduzir o problema de overflow que motivou a realocação original — o comentário no código sugere que essa foi uma escolha deliberada para evitar exatamente esse problema, então a correção precisa equilibrar fidelidade visual com a restrição de espaço já identificada pelo desenvolvedor.

6. **[Baixo impacto / Baixo esforço] Remover `PortfolioDonutChart.jsx` (código morto)** — nenhuma referência ativa encontrada no grep. Eliminar reduz a superfície de manutenção e a chance de alguém reativá-lo acidentalmente, perpetuando a divergência visual Recharts vs. SVG D4.

7. **[Baixo impacto / Alto esforço] Unificar `GastosPorCategoriaChart` (Recharts `Pie`) com a linguagem `Donut`/SVG D4** — fora do escopo do bento atual (provavelmente usado em `Orcamento.jsx`), exigiria redesenhar o componente com o primitivo `Donut` e ajustar legendas/tooltips. Maior esforço, impacto visual real porém limitado a uma tela secundária — pode ficar para uma fase 2 do redesign.

8. **[Baixo impacto / Alto esforço] Revisar a estrutura de containers de altura no `Chat`/`Layout`** — remover a redundância `height: 100vh` aninhada (item 2.2). Não é urgente (funciona hoje), mas deveria ser simplificado antes de qualquer mudança futura no `Layout.jsx` ou no `Chat.jsx` que possa expor o problema latente. Esforço alto porque mexe no shell da aplicação inteira (risco de regressão em todas as páginas que passam pelo `Layout`).

---

*Relatório gerado por auditoria combinada (fidelidade de código + fidelidade de design system). Nenhum arquivo de implementação foi alterado.*
