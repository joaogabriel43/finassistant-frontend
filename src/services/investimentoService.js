import api from './api';

// Serviço de investimentos: inclui chamada para vender um ativo
// venderRequest deve ser um objeto { ticker, quantidade }
const venderAtivo = async (venderRequest) => {
  try {
    const response = await api.post('/investimentos/vender', venderRequest);
    return response.data;
  } catch (error) {
    // Log detalhado e rethrow para tratamento pelo chamador
    // eslint-disable-next-line no-console
    console.error('Erro ao vender ativo:', error.response?.data || error.message);
    throw error;
  }
};

// Cadastro manual de ativo no portfólio.
// payload: { ticker, quantidade, precoCompra, tipoAtivo?, dataCompra? ("yyyy-MM-dd") }
// Ticker já existente = RE-COMPRA: o backend recalcula o preço médio ponderado.
const adicionarAtivo = async (payload) => {
  try {
    const response = await api.post('/investimentos/portfolio/ativos', payload);
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erro ao adicionar ativo:', error.response?.data || error.message);
    throw error;
  }
};

// Edição ABSOLUTA de uma posição existente (correção de quantidade/preço médio).
// Não é re-compra: os valores enviados substituem os atuais.
// payload: { quantidade, precoMedio }
const editarAtivo = async (ticker, payload) => {
  try {
    const response = await api.put(
      `/investimentos/portfolio/ativos/${encodeURIComponent(ticker)}`,
      payload,
    );
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erro ao editar ativo:', error.response?.data || error.message);
    throw error;
  }
};

// Remove completamente um ativo do portfólio (todas as unidades).
const removerAtivo = async (ticker) => {
  try {
    await api.delete(`/investimentos/portfolio/ativos/${encodeURIComponent(ticker)}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erro ao remover ativo:', error.response?.data || error.message);
    throw error;
  }
};

// Renda passiva mês a mês: histórico de proventos agrupado por mês.
// tipo opcional ∈ { DIVIDENDO, JCP, RENDIMENTO } — quando ausente, retorna todos.
const getRendaPassiva = async (tipo) => {
  try {
    const url = tipo
      ? `/investimentos/renda-passiva?tipo=${tipo}`
      : '/investimentos/renda-passiva';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erro ao buscar renda passiva:', error.response?.data || error.message);
    throw error;
  }
};

// Rentabilidade da carteira: ganho absoluto (R$) e percentual, por ativo e
// consolidado, retorno total com proventos e série de evolução temporal.
// Toda a agregação vem do backend — o front apenas consome e formata.
const getRentabilidade = async () => {
  try {
    const response = await api.get('/investimentos/rentabilidade');
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erro ao buscar rentabilidade:', error.response?.data || error.message);
    throw error;
  }
};

// Comparação vs benchmarks por janela temporal (MES, ANO, DOZE_MESES,
// DESDE_INICIO). Retorna, para cada janela, a rentabilidade da carteira e dos
// índices (CDI/IBOV/IPCA) + alpha e flags `superou*`; além de 4 séries de 12
// pontos para o gráfico multi-série sobreposto.
// Toda a agregação vem do backend — o front apenas consome e formata.
const getBenchmarkJanelas = async () => {
  try {
    const response = await api.get('/benchmarks/janelas');
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erro ao buscar benchmarks por janela:', error.response?.data || error.message);
    throw error;
  }
};

// Calendário de proventos com projeção futura: meses futuros com os eventos
// de proventos esperados (confirmados = data-com anunciada; projetados =
// estimativa baseada em histórico). Toda a projeção vem do backend — o front
// apenas consome e formata.
const getCalendarioProventos = async () => {
  try {
    const response = await api.get('/investimentos/calendario-proventos');
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erro ao buscar calendário de proventos:', error.response?.data || error.message);
    throw error;
  }
};

// Agenda de eventos corporativos: linha do tempo dos eventos corporativos dos
// ativos da carteira (data-com, data-ex, desdobramento, JCP, etc.), em ordem
// cronológica crescente, com flag `proximo` (próximos 7 dias) vinda do backend.
// tipo opcional ∈ { DATA_COM, DATA_EX, DESDOBRAMENTO, GRUPAMENTO, AMORTIZACAO,
// JCP, BONIFICACAO, SUBSCRICAO } — quando ausente, retorna todos os tipos.
const getEventosCorporativos = async (tipo) => {
  try {
    const url = tipo
      ? `/investimentos/eventos-corporativos?tipo=${tipo}`
      : '/investimentos/eventos-corporativos';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erro ao buscar eventos corporativos:', error.response?.data || error.message);
    throw error;
  }
};

// ── Gestão estratégica por setores (tetos de alocação) ─────────────────────

// Tetos configurados por dimensão. Shape:
// { porClasse: {ACAO: 30}, porSetor: {FINANCEIRO: 25}, porGeografia: {BRASIL: 80} }
// Mapas vazios quando o usuário nunca configurou.
const obterTetos = async () => {
  try {
    const response = await api.get('/investimentos/estrategia/tetos');
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erro ao buscar tetos de alocação:', error.response?.data || error.message);
    throw error;
  }
};

// SUBSTITUIÇÃO COMPLETA dos tetos (dimensão omitida/nula = limpa a dimensão).
// Cada teto deve satisfazer 0 < teto ≤ 100; tetos NÃO precisam somar 100
// (são limites independentes, diferente do alvo legado que é partição).
const salvarTetos = async (payload) => {
  try {
    const response = await api.put('/investimentos/estrategia/tetos', payload);
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erro ao salvar tetos de alocação:', error.response?.data || error.message);
    throw error;
  }
};

// Breakdown da carteira A CUSTO (quantidade × preço médio) por dimensão:
// { valorTotal, porClasse: [item], porSetor: [item], porSubsetor: [item],
//   porGeografia: [item] } com item = { chave, valor, percentualReal,
//   percentualAlvo, percentualTeto, excedeuTeto }. Carteira vazia = listas vazias.
const obterBreakdown = async () => {
  try {
    const response = await api.get('/investimentos/estrategia/breakdown');
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erro ao buscar breakdown estratégico:', error.response?.data || error.message);
    throw error;
  }
};

export const investimentoService = {
  venderAtivo,
  adicionarAtivo,
  editarAtivo,
  removerAtivo,
  getRendaPassiva,
  getRentabilidade,
  getBenchmarkJanelas,
  getCalendarioProventos,
  getEventosCorporativos,
  obterTetos,
  salvarTetos,
  obterBreakdown,
};
