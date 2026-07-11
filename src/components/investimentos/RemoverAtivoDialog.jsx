import React, { useEffect, useState } from 'react';
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import { investimentoService } from '../../services/investimentoService';
import { extrairMensagemErroApi } from '../../utils/apiErrorUtils';

/**
 * Confirmação de remoção COMPLETA de um ativo do portfólio.
 * DELETE /api/investimentos/portfolio/ativos/{ticker}
 */
const RemoverAtivoDialog = ({ open, ativo, onClose, onRemoved }) => {
    const [error, setError] = useState('');
    const [removing, setRemoving] = useState(false);

    useEffect(() => {
        if (open) setError('');
    }, [open, ativo]);

    const handleConfirmar = async () => {
        setError('');
        try {
            setRemoving(true);
            await investimentoService.removerAtivo(ativo.ticker);
            if (onRemoved) onRemoved(`Ativo ${ativo.ticker} removido do portfólio.`);
            onClose();
        } catch (err) {
            const fallback = err?.response?.status === 404
                ? 'Ativo não encontrado no portfólio.'
                : 'Falha ao remover o ativo. Tente novamente.';
            setError(extrairMensagemErroApi(err, fallback));
        } finally {
            setRemoving(false);
        }
    };

    return (
        <Dialog open={!!open} onClose={onClose} data-testid="remover-ativo-dialog">
            <DialogTitle>Remover ativo</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Tem certeza que deseja remover {ativo?.ticker} do seu portfólio?
                    Todas as unidades serão excluídas. Esta ação não pode ser desfeita.
                </DialogContentText>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit" disabled={removing}>
                    Cancelar
                </Button>
                <Button
                    onClick={handleConfirmar}
                    color="error"
                    variant="contained"
                    disabled={removing}
                    autoFocus
                    data-testid="btn-confirmar-remocao-ativo"
                >
                    {removing ? 'Removendo...' : 'Remover'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RemoverAtivoDialog;
