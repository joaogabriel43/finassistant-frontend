/**
 * Converte uma string de data (YYYY-MM-DD) para o formato local (pt-BR)
 * sem ser afetado por problemas de fuso horário (timezone).
 */
export const formatarDataLocal = (dataString) => {
  if (!dataString) return '';

  // Quebra a string "YYYY-MM-DD"
  const partes = dataString.split('-');
  if (partes.length !== 3) return dataString; // Retorna a string original se o formato for inesperado

  const [ano, mes, dia] = partes;

  // Cria a data explicitamente com os componentes, tratando o mês (que é 0-indexado)
  const data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));

  // Formata para o padrão brasileiro
  return data.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
};

