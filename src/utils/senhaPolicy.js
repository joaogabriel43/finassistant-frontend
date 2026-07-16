/**
 * Política de senha do registro (espelho do backend — ADR-028):
 * mínimo 8 caracteres, ao menos 1 letra e 1 número.
 *
 * A validação autoritativa é SEMPRE a do backend (Bean Validation no
 * RegistroRequestDTO) — este helper existe só para feedback imediato na UI.
 */

/**
 * Avalia cada regra da política individualmente (para checklist ao vivo).
 * @param {string} senha senha digitada (pode ser vazia)
 * @returns {{ tamanho: boolean, letra: boolean, numero: boolean }}
 */
export const regrasSenha = (senha) => {
  const valor = senha ?? '';
  return {
    tamanho: valor.length >= 8,
    letra: /[A-Za-z]/.test(valor),
    numero: /\d/.test(valor),
  };
};

/**
 * @param {string} senha
 * @returns {boolean} true quando TODAS as regras passam
 */
export const senhaValida = (senha) => {
  const regras = regrasSenha(senha);
  return regras.tamanho && regras.letra && regras.numero;
};
