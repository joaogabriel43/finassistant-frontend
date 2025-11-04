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

export const investimentoService = {
  venderAtivo,
};
