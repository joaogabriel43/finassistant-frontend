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

export const investimentoService = {
  venderAtivo,
  getRendaPassiva,
  getRentabilidade,
  getBenchmarkJanelas,
  getCalendarioProventos,
};
