import React, { useState, useEffect } from 'react';
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    TextField,
} from '@mui/material';
import { investimentoService } from '../../services/investimentoService';
import { extrairMensagemErroApi } from '../../utils/apiErrorUtils';
import ClassificacaoAtivoSelects from './ClassificacaoAtivoSelects';

/**
 * Dialog de EDIÇÃO ABSOLUTA de uma posição do portfólio (correção manual).
 * PUT /api/investimentos/portfolio/ativos/{ticker} — quantidade/preço médio
 * SUBSTITUEM os atuais (não é re-compra; preço médio não é ponderado aqui).
 * Setor/subsetor/geografia seguem semântica MERGE no backend: campo omitido
 * (null) mantém a classificação atual.
 */
const EditarAtivoDialog = ({ open, ativo, onClose, onSaved }) => {
    const [quantidade, setQuantidade] = useState('');
    const [precoMedio, setPrecoMedio] = useState('');
    const [classificacao, setClassificacao] = useState({ setor: '', subsetor: '', geografia: '' });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    // Pré-preenche com a posição atual sempre que um novo ativo é selecionado.
    useEffect(() => {
        if (open && ativo) {
            setQuantidade(ativo.quantidade != null ? String(ativo.quantidade) : '');
            setPrecoMedio(ativo.precoMedio != null ? String(ativo.precoMedio) : '');
            setClassificacao({
                setor: ativo.setor || '',
                subsetor: ativo.subsetor || '',
                geografia: ativo.geografia || '',
            });
            setError('');
        }
    }, [open, ativo]);

    const validar = () => {
        const qtd = parseFloat(quantidade);
        if (Number.isNaN(qtd) || qtd <= 0) return 'A quantidade deve ser maior que zero.';
        const preco = parseFloat(precoMedio);
        if (Number.isNaN(preco) || preco <= 0) return 'O preço médio deve ser maior que zero.';
        return '';
    };

    const handleSalvar = async () => {
        setError('');
        const mensagemValidacao = validar();
        if (mensagemValidacao) {
            setError(mensagemValidacao);
            return;
        }
        try {
            setSaving(true);
            const payload = {
                quantidade: parseFloat(quantidade),
                precoMedio: parseFloat(precoMedio),
            };
            // MERGE no backend: só envia classificação selecionada; campo
            // omitido (null) mantém o valor atual do ativo.
            if (classificacao.setor) payload.setor = classificacao.setor;
            if (classificacao.subsetor) payload.subsetor = classificacao.subsetor;
            if (classificacao.geografia) payload.geografia = classificacao.geografia;
            await investimentoService.editarAtivo(ativo.ticker, payload);
            if (onSaved) onSaved(`Posição de ${ativo.ticker} atualizada.`);
            onClose();
        } catch (err) {
            const fallback = err?.response?.status === 404
                ? 'Ativo não encontrado no portfólio.'
                : 'Falha ao atualizar a posição. Tente novamente.';
            setError(extrairMensagemErroApi(err, fallback));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={!!open} onClose={onClose} data-testid="editar-ativo-dialog" fullWidth maxWidth="xs">
            <DialogTitle>Editar posição {ativo?.ticker}</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2, fontSize: '0.85rem' }}>
                    Correção manual da posição: os valores informados substituem os atuais.
                </DialogContentText>
                <TextField
                    label="Quantidade"
                    type="number"
                    size="small"
                    fullWidth
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    inputProps={{ 'data-testid': 'input-editar-quantidade', min: 0, step: 'any' }}
                    sx={{ mt: 0.5 }}
                />
                <TextField
                    label="Preço médio (R$)"
                    type="number"
                    size="small"
                    fullWidth
                    value={precoMedio}
                    onChange={(e) => setPrecoMedio(e.target.value)}
                    inputProps={{ 'data-testid': 'input-editar-preco-medio', min: 0, step: '0.01' }}
                    sx={{ mt: 2 }}
                />
                {/* Classificação estratégica (setor/subsetor/geografia) — merge no backend */}
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <ClassificacaoAtivoSelects
                        value={classificacao}
                        onChange={setClassificacao}
                        gridSize={{ xs: 12 }}
                    />
                </Grid>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit" disabled={saving}>
                    Cancelar
                </Button>
                <Button
                    onClick={handleSalvar}
                    variant="contained"
                    disabled={saving}
                    data-testid="btn-salvar-edicao-ativo"
                >
                    {saving ? 'Salvando...' : 'Salvar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditarAtivoDialog;
