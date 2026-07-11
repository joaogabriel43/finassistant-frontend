/**
 * Extrai uma mensagem humana de um erro Axios vindo do backend FortunAI.
 *
 * Formatos conhecidos do GlobalExceptionHandler:
 *  - 400 Bean Validation: { status, error: "Validation Failed", fields: { campo: mensagem } }
 *  - 404 / demais:        { status, error, message }
 *
 * @param {unknown} error erro capturado (Axios ou genérico)
 * @param {string} fallback mensagem padrão quando o corpo não é reconhecido
 * @returns {string}
 */
export const extrairMensagemErroApi = (error, fallback) => {
  const data = error?.response?.data;
  if (data) {
    if (data.fields && typeof data.fields === 'object') {
      const mensagens = Object.values(data.fields).filter(Boolean);
      if (mensagens.length > 0) return mensagens.join(' ');
    }
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }
  }
  return fallback;
};
