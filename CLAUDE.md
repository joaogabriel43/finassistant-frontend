# CLAUDE.md — FortunAI Dev Guide

> **Leia este arquivo inteiro antes de tocar em qualquer código.**
> Este é o contrato de desenvolvimento do FortunAI. Toda decisão técnica deve ser compatível com ele.

---

## 1. Identidade do Projeto

**FortunAI** é um assistente financeiro pessoal inteligente que unifica gerenciamento de orçamento e investimentos por meio de uma interface conversacional (chatbot). O diferencial central é o **roteamento híbrido**: comandos transacionais simples são processados localmente sem custo de IA; apenas consultas complexas acionam o Google Gemini.

- **Repositório backend:** `finassistant` (este repositório)
- **Frontend:** `finassistant-frontend` (React + MUI, repo separado)
- **Deploy:** Backend → Render | Frontend → Vercel
- **Stack:** Java 17 + Spring Boot 3.5.5 + PostgreSQL + React

---

## 2. Stack e Dependências

### Backend
| Tecnologia | Versão | Papel |
|---|---|---|
| Java | 17 | Linguagem principal |
| Spring Boot | 3.5.5 | Framework principal |
| Spring Security | (boot managed) | Autenticação JWT |
| Spring Data JPA | (boot managed) | Persistência |
| PostgreSQL | 15+ (Docker dev) | Banco de dados |
| jjwt | 0.11.5 | Geração/validação JWT |
| Caffeine | (boot managed) | Cache de cotações |
| Apache Commons Math | 3.6.1 | Algoritmo Markowitz |
| Lombok | 1.18.36 | Redução de boilerplate |
| SpringDoc OpenAPI | 2.5.0 | Documentação Swagger |
| H2 | (test scope) | Banco em memória para testes |

### Serviços Externos
| Serviço | Responsabilidade | Regra de Ouro |
|---|---|---|
| **Google Gemini** | NLU — interpreta intenção do usuário (subjetivo) | NUNCA use como fonte de dados financeiros |
| **Alpha Vantage** | Dados de mercado reais (cotações, histórico) | SEMPRE cachear; delay de 15min no plano gratuito |

**⚠️ REGRA INVIOLÁVEL:** Gemini interpreta. Alpha Vantage informa. Nunca inverta esse contrato.

---

## 3. Arquitetura — Visão Geral

O projeto segue **Arquitetura Hexagonal (Ports & Adapters)** com **Domain-Driven Design (DDD)**.

```
HTTP Request
    ↓
Controller (Adapter IN)
    ↓
UseCase / Service (Application Layer)
    ↓
Domain (pure business logic)
    ↓
Port (interface) → Adapter OUT (JPA / Gemini / AlphaVantage)
```

### Bounded Contexts

| Contexto | Package | Responsabilidade |
|---|---|---|
| **Interação** | `interacao` | ChatService, roteamento NLU, sessão de chat |
| **Orçamento** | `orcamento` | Transações, categorias, saldo, análises |
| **Investimentos** | `investimentos` | Portfólio, preço médio, Markowitz, cotações |
| **Usuário** | `usuario` | Autenticação JWT, perfil investidor, questionário |
| **Dashboard** | `dashboard` | Agregação de read-models para UI |
| **Núcleo Compartilhado** | domain classes | `Dinheiro` (VO), `ClockPort` (fuso horário) |

### Package Base
```
com.tcc.finassistant
```

---

## 4. Estrutura de Pastas

```
src/main/java/com/tcc/finassistant/
├── config/                    # SecurityConfig, AppConfig, OpenApiConfig, etc.
├── security/                  # JwtAuthenticationFilter
├── interacao/
│   ├── application/service/   # ChatService, ChatSessionCache
│   ├── domain/                # NluResponseDTO, ports/in, ports/out
│   └── infrastructure/
│       ├── adapter/in/web/    # ChatController + DTOs
│       └── providers/         # GeminiAdapter, FakeLlmProviderAdapter, NoopLlmAdapter
├── investimentos/
│   ├── application/service/   # InvestimentoService, EstrategiaService
│   ├── domain/                # Ativo, Portfolio, Ticker, TipoAtivo, EstrategiaDeAlocacao
│   │   ├── ports/in/          # UseCases (interfaces)
│   │   ├── ports/out/         # Repositories + MarketDataProviderPort
│   │   └── service/           # MarkowitzPortfolioOptimizer, PortfolioOptimizer
│   ├── domain/services/       # PortfolioOptimizationService (Monte Carlo)
│   └── infrastructure/
│       ├── adapter/in/web/    # InvestimentoController, EstrategiaController + DTOs
│       ├── adapter/out/       # FakeHistoricoAtivosProviderAdapter, Persistence adapters
│       ├── persistence/       # PortfolioRepositoryAdapter
│       └── providers/         # AlphaVantageAdapter, FakeMarketDataProviderAdapter
├── orcamento/
│   ├── application/service/   # OrcamentoService
│   ├── controller/            # (legacy DTOs)
│   ├── domain/                # ContaFinanceira, Transacao, Dinheiro
│   │   ├── ports/in/          # UseCases
│   │   └── ports/out/         # ContaFinanceiraRepository, AgregadorBancarioPort
│   └── infrastructure/adapter/
│       ├── in/web/            # OrcamentoController + DTOs
│       └── out/               # ContaFinanceiraRepositoryAdapter, FakeAgregadorBancarioAdapter
├── usuario/
│   ├── application/services/  # AutenticacaoService, TokenService, UsuarioService
│   ├── controller/            # QuestionarioController
│   ├── domain/                # Usuario, PerfilInvestidor
│   └── infrastructure/adapter/in/web/ # AuthController + DTOs
└── dashboard/
    ├── application/services/  # ObterDashboardSummaryUseCase, ObterComposicaoPortfolioUseCase, etc.
    └── infrastructure/adapter/in/web/ # DashboardController + DTOs
```

---

## 5. Profiles Spring

| Profile | Quando usar | Adapters ativos |
|---|---|---|
| `dev` | Desenvolvimento local | FakeMarketDataProviderAdapter, FakeHistoricoAtivosProviderAdapter, GeminiAdapter |
| `test` | Testes automatizados | FakeLlmProviderAdapter (Primary), FakeMarketDataProviderAdapter, H2 |
| `prod` | Deploy Render | AlphaVantageAdapter, AlphaVantageHistoricoAdapter, GeminiAdapter |

**Regra:** Nunca ative `prod` localmente. Nunca faça chamadas reais a Gemini ou Alpha Vantage em testes.

---

## 6. Variáveis de Ambiente

Defina em `.env` na raiz (nunca versionar):

```
DB_USER=seu_usuario_postgres
DB_PASSWORD=sua_senha_postgres
DB_PORT=5432
DB_NAME=finassistant
GEMINI_API_KEY=sua_chave_gemini
ALPHA_VANTAGE_API_KEY=sua_chave_alpha_vantage
JWT_SECRET=seu_secret_jwt
```

**⚠️ NUNCA** coloque credenciais em `application.properties`, código-fonte ou commits.

---

## 7. Como Rodar Localmente

```bash
# 1. Subir banco de dados
docker compose up -d

# 2. Rodar backend (IntelliJ com EnvFile plugin, ou):
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# 3. Frontend (repositório separado)
cd finassistant-frontend
npm install && npm run dev
# Disponível em http://localhost:5173
```

```bash
# Rodar testes
./mvnw test
```

---

## 8. Pilares Técnicos Inegociáveis

### 8.1 Arquitetura

- **Controllers são FINOS.** Lógica de negócio vive nos Services. Se um controller tem mais de 20 linhas de lógica, algo está errado.
- **Camada de domínio é PURA.** Entidades e VOs do domínio NÃO importam classes de infraestrutura (JPA annotations são exceção pragmática).
- **Comunicação por Portas.** Services do domínio dependem de interfaces (`Port`), nunca de implementações concretas (Adapters).
- **Um Repositório por Aggregate Root.** `ContaFinanceira`, `Portfolio`, `Usuario`, `EstrategiaDeAlocacao` — cada um com seu repositório.

### 8.2 Código

- **Java 17:** Use Records, Pattern Matching, Text Blocks, Sealed Classes quando fizer sentido.
- **SOLID, DRY, KISS, YAGNI** em toda solução.
- **Nomenclatura:** Código em inglês. Comentários explicando decisões não óbvias em português.
- **Lombok:** Use com moderação. Prefira Records para DTOs imutáveis.
- **@Transactional:** APENAS em Services, nunca em Controllers.

### 8.3 Segurança

- **Prompt Injection:** Todo input do usuário deve ser sanitizado antes de enviar ao Gemini. Use `escapeJson()` do GeminiAdapter como referência.
- **JWT Secret:** Via variável de ambiente `jwt.secret`. Nunca hardcoded.
- **Bean Validation:** `@Valid` em todos os DTOs de entrada dos controllers.
- **Princípio do menor privilégio:** Endpoints protegidos por padrão (`anyRequest().authenticated()`).

### 8.4 Testes

- **Mocks obrigatórios** para Gemini e Alpha Vantage. Nunca chamadas reais em testes.
- Use `@ActiveProfiles("test")` em todos os testes de integração.
- **JUnit 5 + Mockito** para unit tests. **MockMvc** para testes de controller.
- H2 em memória para testes de integração (`spring.jpa.hibernate.ddl-auto=create-drop`).

### 8.5 Performance

- **Cache Caffeine** para cotações Alpha Vantage (TTL: 1h cotação, 7 dias histórico).
- **Evitar N+1:** Use `LEFT JOIN FETCH` nas queries JPQL. Veja `ContaFinanceiraRepositoryAdapter`.
- **Fetch EAGER** em coleções pequenas e frequentemente acessadas (ativos do portfolio). Reavaliar se crescer.

---

## 9. Fluxos Críticos

### 9.1 Fluxo do Chat (ChatService)

```
Mensagem do usuário
    ↓
construirPromptSimples() → Gemini
    ↓ (se LLM retornar vazio)
fallbackHeuristico() → processa localmente
    ↓ (se LLM responder)
parseNluResponse() → extrai intent + entities
    ↓
aplicarHeuristicasCorrecaoIntencao() → corrige erros do LLM
    ↓
rotearIntent() → delega ao service correto
```

**Intents conhecidas:**
- `ADICIONAR_TRANSACAO` → OrcamentoService
- `ADICIONAR_ATIVO` → InvestimentoService
- `CONSULTAR_COTACAO` → InvestimentoService (com fallback 3 níveis)
- `CONSULTAR_PORTFOLIO` → InvestimentoService
- `OTIMIZAR_PORTFOLIO` → InvestimentoService (análise via Gemini)
- `CONSULTAR_ANALISE_GASTOS` → OrcamentoService
- `DESCONHECIDO` → fallback heurístico

### 9.2 Fallback de Cotação (3 Níveis)

```
1. AlphaVantageAdapter (com cache Caffeine)
    ↓ (se falhar)
2. CatalogoAtivoService (CSV local — preço estático)
    ↓ (se falhar)
3. Gemini como último recurso (com rate limiting)
```

### 9.3 Fallback do Dashboard

Se AlphaVantage falhar ao carregar portfólio, o `InvestimentoService` usa `ativo.getPrecoMedio()` como fallback, garantindo que o dashboard SEMPRE carregue.

---

## 10. Anti-Padrões — Alerta Imediato

Antes de submeter qualquer código, verifique:

| Anti-padrão | Sinal de alerta |
|---|---|
| **Fat Controller** | Lógica de negócio dentro de `@RestController` |
| **God Service** | Um Service com mais de uma responsabilidade clara |
| **Credencial exposta** | Qualquer key/secret/token hardcoded no código |
| **N+1 Query** | Loop com chamada a repository dentro |
| **Prompt Injection** | Input do usuário enviado ao Gemini sem sanitização |
| **Gemini como fonte de verdade** | Resposta do Gemini usada como dado financeiro direto |
| **@Transactional em Controller** | Transações gerenciadas fora da camada de Service |
| **Chamada real em teste** | Chamada real ao Gemini ou Alpha Vantage em teste unitário |
| **Fetch EAGER em coleção grande** | `@OneToMany(fetch = EAGER)` em entidade com coleção potencialmente grande |

---

## 11. Convenções de Código

### Commits (Conventional Commits)
```
feat(chat): adicionar intent CONSULTAR_HISTORICO
fix(investimento): corrigir calculo de preco medio em re-compra
refactor(orcamento): extrair logica de saldo para domain service
test(markowitz): adicionar teste para portfolio com ativo unico
chore: atualizar dependencia commons-math para 3.6.1
```

**Tipos:** `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `perf`, `ci`

### Nomenclatura de Arquivos
- Controllers: `[Contexto]Controller.java`
- Services: `[Contexto]Service.java` ou `[Acao][Entidade]UseCase.java`
- Adapters: `[Tecnologia][Contexto]Adapter.java`
- DTOs: `[Entidade]DTO.java` ou `[Acao]RequestDTO.java` / `[Acao]ResponseDTO.java`
- Ports (in): `[Acao][Entidade]UseCase.java`
- Ports (out): `[Entidade]Repository.java` ou `[Provedor]Port.java`

---

## 12. Endpoints da API

Todos os endpoints requerem `Authorization: Bearer <token>` exceto os de auth.

| Método | Path | Descrição |
|---|---|---|
| POST | `/api/auth/registrar` | Registro de novo usuário |
| POST | `/api/auth/login` | Login, retorna JWT |
| GET | `/api/auth/me` | Dados do usuário autenticado |
| POST | `/api/chat/enviar` | Enviar mensagem ao assistente |
| GET | `/api/investimentos/portfolio` | Portfólio detalhado |
| POST | `/api/investimentos/portfolio/ativos` | Adicionar ativo manualmente |
| GET | `/api/investimentos/cotacao/{ticker}` | Cotação de um ativo |
| GET | `/api/investimentos/dashboard/{usuarioId}` | Dados enriquecidos para dashboard |
| GET | `/api/investimentos/alocacao/{usuarioId}` | Distribuição por tipo |
| GET/POST | `/api/investimentos/estrategia-legacy` | CRUD da estratégia de alocação alvo |
| GET | `/api/investimentos/estrategia-legacy/analise` | Análise de rebalanceamento |
| POST | `/api/orcamento/sincronizar` | Sincronizar transações externas |
| POST | `/api/orcamento/transacao/{usuarioId}` | Adicionar transação manualmente |
| GET | `/api/orcamento/transacoes/{usuarioId}` | Listar todas as transações |
| PUT | `/api/orcamento/transacao/{usuarioId}/{transacaoId}` | Editar transação |
| DELETE | `/api/orcamento/transacao/{usuarioId}/{transacaoId}` | Excluir transação |
| GET | `/api/orcamento/analise-mensal/{usuarioId}` | Gastos do mês por categoria |
| GET | `/api/orcamento/analise-historica/{usuarioId}` | Histórico completo de gastos |
| GET | `/api/orcamento/categorias/{usuarioId}` | Categorias distintas do usuário |
| GET | `/api/dashboard/summary` | Resumo do dashboard |
| GET | `/api/dashboard/portfolio-composition` | Composição do portfólio |
| GET | `/api/dashboard/expenses-by-category` | Despesas por categoria |
| POST | `/api/usuario/questionario/{usuarioId}` | Salvar respostas do questionário |

Swagger disponível em: `http://localhost:8080/swagger-ui.html`

---

## 13. Modelo de Dados Resumido

### Entidades Principais

```
Usuario (usuarios)
  id UUID PK
  email STRING UNIQUE
  senha STRING (bcrypt)
  perfilInvestidor ENUM(CONSERVADOR, MODERADO, ARROJADO, INDEFINIDO)
  questionarioRespondido BOOLEAN

ContaFinanceira (contas_financeiras)
  id UUID PK
  idUsuario UUID UNIQUE
  saldoAtual (Dinheiro embedded: quantia, moeda)
  transacoes → List<Transacao> (OneToMany EAGER)

Transacao (transacoes)
  id UUID PK
  descricao STRING
  valor (Dinheiro embedded)
  categoria STRING
  data LocalDate
  tipo STRING (DEBIT | CREDIT)
  conta_financeira_id FK

Portfolio (portfolios)
  id UUID PK
  idUsuario UUID UNIQUE
  ativos → Set<Ativo> (OneToMany EAGER)

Ativo (ativos)
  id UUID PK
  ticker (Ticker embedded: codigo)
  quantidade DOUBLE
  precoMedio (Dinheiro embedded)
  tipoAtivo ENUM(ACAO, FUNDO_IMOBILIARIO, RENDA_FIXA, CRIPTOMOEDA)
  portfolio_id FK

EstrategiaDeAlocacao (estrategias_alocacao)
  id UUID PK
  usuarioId UUID UNIQUE
  alocacaoAlvo → Map<TipoAtivo, Double> (ElementCollection)
```

### Value Objects
- `Dinheiro` — quantia (BigDecimal) + moeda (String). Imutável. Operações: adicionar(), subtrair().
- `Ticker` — código normalizado (uppercase, trim). Imutável. equals/hashCode por código.

---

## 14. Decisões Arquiteturais Registradas

### ADR-001: Separação Gemini / Alpha Vantage
**Decisão:** Gemini processa linguagem natural. Alpha Vantage fornece dados factuais.
**Motivo:** Dados financeiros exigem precisão. LLMs podem alucinar preços.
**Consequência:** Nunca usar resposta do Gemini como cotação/dado de mercado.

### ADR-002: Roteamento Híbrido no ChatService
**Decisão:** Comandos com ticker válido no catálogo local vão direto ao InvestimentoService sem chamar IA.
**Motivo:** Redução de custo e latência. A IA é cara e lenta.
**Consequência:** CatalogoAtivoService deve estar sempre atualizado com os tickers suportados.

### ADR-003: ClockPort para Fuso Horário
**Decisão:** `LocalDate.now()` é abstraído por `ClockPort` forçando `America/Sao_Paulo`.
**Motivo:** Bug real em produção — transações com datas erradas por diferença de fuso no servidor.
**Consequência:** Nunca use `LocalDate.now()` diretamente no backend. Injete o clock.

### ADR-004: Fallback em 3 Níveis para Cotações
**Decisão:** AlphaVantage → CSV Catálogo → Gemini.
**Motivo:** Alpha Vantage bloqueou IPs do Render no plano gratuito durante testes com usuários reais.
**Consequência:** O sistema nunca falha completamente por indisponibilidade de cotação.

### ADR-005: Markowitz com Dados Estáticos (Limitação Conhecida)
**Decisão:** A otimização usa dados estáticos/simulados em dev e histórico básico em prod.
**Motivo:** APIs de dados históricos detalhados têm custo. Inviável para prototipagem.
**Consequência:** Resultados de otimização são indicativos, não precisos. Trabalho futuro: integrar série histórica real da Alpha Vantage.

### ADR-006: equals/hashCode em Ativo
**Decisão:** `Ativo` e `Ticker` implementam equals/hashCode por `codigo`.
**Motivo:** Bug crítico em produção — Hibernate não identificava o mesmo ativo para update, causando duplicação no Set.
**Consequência:** Ao adicionar mais unidades de um ativo existente, a lógica deve buscar pelo ticker e mutar a entidade, nunca remover e inserir.

---

## 15. Metas de Desenvolvimento (Backlog Priorizado)

### Prioridade Alta 🔴
- [ ] **Atualização de posição existente (re-compra):** `Portfolio.adicionarAtivo()` hoje ignora re-compras com log `"Ativo já existe"`. Implementar lógica de preço médio ponderado: `(qtdExistente * preçoMédioAtual + qtdNova * preçoNovo) / (qtdExistente + qtdNova)`.
- [ ] **Remoção de ativo do portfólio:** Não existe endpoint. Implementar `RemoverAtivoUseCase`.
- [ ] **RateLimitingService para Gemini:** O TCC menciona controle de uso diário, mas a implementação atual é básica. Implementar rate limiting robusto por usuário.

### Prioridade Média 🟡
- [ ] **Testes de unidade para ChatService:** O serviço mais crítico do sistema tem cobertura baixa. Priorizar testes para `rotearIntent()`, `parseNluResponse()`, `aplicarHeuristicasCorrecaoIntencao()`.
- [ ] **Markowitz com dados reais:** Integrar `AlphaVantageHistoricoAdapter` para buscar séries temporais reais e alimentar o algoritmo.
- [ ] **CORS em produção:** `WebConfig` permite apenas `localhost:5173/5174`. Adicionar origins de produção (Vercel URL) via variável de ambiente.
- [ ] **Endpoint de exclusão de ativo:** Implementar `DELETE /api/investimentos/portfolio/ativos/{ticker}`.

### Prioridade Baixa 🟢
- [ ] **Histórico de conversas persistido:** `ChatSessionCache` é in-memory. Se o servidor reiniciar, o contexto de conversa se perde.
- [ ] **GitHub Actions CI/CD:** O badge no README aponta para workflow inexistente. Criar pipeline básico com `./mvnw test`.
- [ ] **Micrometer + observabilidade:** Os 4 Golden Signals (latência, tráfego, erros, saturação) mencionados nos docs de arquitetura.
- [ ] **Swagger acessível em prod:** Atualmente pode estar exposto sem autenticação em produção.

---

## 16. Workflow de Desenvolvimento

### Fluxo Padrão
```
1. [Claude Chat + Gemini] → Discutir a feature/decisão arquitetural
2. [Claude Chat] → Gerar o código e/ou o prompt para Claude Code
3. [Claude Code] → Implementar no repositório local
4. [Claude Chat] → Code Review com estrutura: ✅ Ponto forte | ⚠️ Risco | 🔧 Refatoração | 📚 Aprendizado
5. ./mvnw test → Validar que todos os testes passam
6. git commit (Conventional Commits) → Push
```

### Prompt Padrão para Claude Code
Ao final de cada discussão técnica, um bloco copiável será gerado neste formato:
```
// PROMPT PARA CLAUDE CODE
// Arquivo/Camada: [ex: Application Service — InvestimentoService.java]
// Tarefa: [descrição objetiva]
// Restrições: [pilares técnicos relevantes, padrões a seguir]
// Contexto: [o que mudamos na discussão que Code precisa saber]
// Input/Output esperado: [quando aplicável]
```

---

## 17. Notas de Infraestrutura

- **Docker:** `docker-compose.yml` sobe PostgreSQL 15 e RabbitMQ (RabbitMQ está configurado mas **desabilitado** — `finassistant.rabbitmq.enabled=false`).
- **RabbitMQ:** Infraestrutura preparada para processamento assíncrono de otimização, mas desligado. Não ativar sem implementar consumer.
- **PerfilInvestidorMigrationRunner:** Roda no startup para garantir que usuários antigos com perfil nulo recebam `CONSERVADOR`. Usa arquivo `perfil_migration_done.flag` para idempotência.
- **DataInitializer:** Cria conta financeira para o UUID de teste `f47ac10b-58cc-4372-a567-0e02b2c3d479` se não existir. Ativo apenas em perfis `!test`.

---

## 18. Referências Rápidas

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- H2 Console (testes): não exposto por padrão
- Logs de diagnóstico: buscar por `>>> DIAGNÓSTICO` nos logs de startup e runtime

