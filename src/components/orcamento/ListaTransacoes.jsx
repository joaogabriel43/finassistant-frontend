import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Typography,
    Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import EditarTransacaoModal from './EditarTransacaoModal';
import ConfirmarExclusaoDialog from './ConfirmarExclusaoDialog';
import { formatarDataLocal } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/formatters';
import { logErroSeguro } from '../../utils/apiErrorUtils';

const formatBRL = (value) => formatCurrency(value);

const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : ''

const ListaTransacoes = ({ refreshKey, onChanged }) => {
    const { user } = useAuth();
    const [transacoes, setTransacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [transacaoSelecionada, setTransacaoSelecionada] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [transacaoParaExcluir, setTransacaoParaExcluir] = useState(null);

    const fetchTransacoes = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await api.get(`/orcamento/transacoes/${user.id}`);
            const list = Array.isArray(res.data) ? res.data : [];
            setTransacoes(list.sort((a, b) => new Date(b.data) - new Date(a.data)));
        } catch (e) {
            logErroSeguro('Falha ao carregar transações', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTransacoes(); }, [user?.id, refreshKey]);

    const handleDelete = (transacaoId) => {
        setTransacaoParaExcluir(transacaoId);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        setDeleteDialogOpen(false);
        try {
            await api.delete(`/orcamento/transacao/${user.id}/${transacaoParaExcluir}`);
            setTransacoes(prev => prev.filter(t => t.id !== transacaoParaExcluir));
            if (onChanged) onChanged();
        } catch (error) {
            logErroSeguro('Falha ao excluir transação', error);
        } finally {
            setTransacaoParaExcluir(null);
        }
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setTransacaoParaExcluir(null);
    };

    const openModal = (t) => { setTransacaoSelecionada(t); setModalIsOpen(true); };
    const closeModal = () => { setModalIsOpen(false); setTransacaoSelecionada(null); };

    const handleUpdated = async () => {
        // Recarrega a lista e informa ao pai para atualizar o gráfico
        await fetchTransacoes();
        if (onChanged) onChanged();
    };

    return (
        <Box sx={{ mt: 4, width: '100%' }}>
            {loading ? (
                <p>Carregando transações...</p>
            ) : (
                <>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Últimas Transações
                    </Typography>

                    <TableContainer
                        component={Paper}
                        sx={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                    >
                        <Table size="small">
                            <TableHead>
                                <TableRow
                                    sx={{
                                        '& th': {
                                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                                            fontWeight: 600,
                                            fontSize: 12,
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5,
                                            color: 'text.secondary',
                                        },
                                    }}
                                >
                                    <TableCell>Data</TableCell>
                                    <TableCell>Descrição</TableCell>
                                    <TableCell>Categoria</TableCell>
                                    <TableCell align="right">Valor</TableCell>
                                    <TableCell align="center">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {transacoes.map(t => (
                                    <TableRow key={t.id} hover>
                                        <TableCell>{formatarDataLocal(t.data)}</TableCell>
                                        <TableCell>{t.descricao}</TableCell>
                                        <TableCell>{capitalize(t.categoria)}</TableCell>
                                        <TableCell
                                            align="right"
                                            sx={{
                                                color: t.tipo === 'CREDIT' ? 'success.main' : 'error.main',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {t.tipo === 'CREDIT' ? '+ ' : '- '}{formatBRL(t.valor?.quantia ?? t.valor)}
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" color="primary" onClick={() => openModal(t)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDelete(t.id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {transacoes.length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            align="center"
                                            sx={{ py: 3, color: 'text.secondary' }}
                                        >
                                            Nenhuma transação encontrada.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <EditarTransacaoModal
                        isOpen={modalIsOpen}
                        onRequestClose={closeModal}
                        transacao={transacaoSelecionada}
                        onUpdate={handleUpdated}
                    />
                </>
            )}

            <ConfirmarExclusaoDialog
                open={deleteDialogOpen}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </Box>
    );
};

export default ListaTransacoes;
