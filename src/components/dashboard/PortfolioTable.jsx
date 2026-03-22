import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {
    Box,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const PortfolioTable = ({ onSellRequest = () => {}, refreshKey = 0 }) => {
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const fetchPortfolio = useCallback(async () => {
        if (!user || !user.id) return;
        try {
            setLoading(true);
            const response = await api.get(`/investimentos/dashboard/${user.id}`);
            setPortfolio(response.data || []);
            setError(null);
        } catch (err) {
            setError('Não foi possível carregar os dados do portfólio.');
            // eslint-disable-next-line no-console
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchPortfolio();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchPortfolio, refreshKey]);

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    const formatPercent = (value) => new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2 }).format((value ?? 0));

    if (!user || !user.id) {
        return (
            <SkeletonTheme baseColor="#202020" highlightColor="#444">
                <p><Skeleton width={200} /></p>
            </SkeletonTheme>
        );
    }

    if (loading) {
        return (
            <SkeletonTheme baseColor="#202020" highlightColor="#444">
                <Box sx={{ mt: 2 }}>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} height={40} style={{ marginBottom: 8 }} />
                    ))}
                </Box>
            </SkeletonTheme>
        );
    }

    if (error) {
        return (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {error}
            </Typography>
        );
    }

    if (!portfolio || portfolio.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Você ainda não possui ativos no seu portfólio.
            </Typography>
        );
    }

    return (
        <TableContainer sx={{ mt: 1 }}>
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ '& th': { borderBottom: '1px solid rgba(255,255,255,0.12)', color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' } }}>
                        <TableCell>Ticker</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell align="right">Qtd</TableCell>
                        <TableCell align="right">Preço Médio</TableCell>
                        <TableCell align="right">Valor Atual</TableCell>
                        <TableCell align="right">Lucro/Prejuízo</TableCell>
                        <TableCell align="right">Ações</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {portfolio.map((ativo) => {
                        const lucro = ativo.lucroPrejuizo ?? 0;
                        return (
                            <TableRow
                                key={ativo.ticker}
                                sx={{
                                    '& td': { borderBottom: '1px solid rgba(255,255,255,0.06)', py: 1.25 },
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                                }}
                            >
                                <TableCell sx={{ fontWeight: 600 }}>{ativo.ticker}</TableCell>
                                <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{ativo.tipoAtivo || '—'}</TableCell>
                                <TableCell align="right">{ativo.quantidade}</TableCell>
                                <TableCell align="right">{formatCurrency(ativo.precoMedio)}</TableCell>
                                <TableCell align="right">{formatCurrency(ativo.totalAtual)}</TableCell>
                                <TableCell
                                    align="right"
                                    sx={{
                                        color: lucro >= 0 ? 'success.main' : 'error.main',
                                        fontWeight: 600,
                                    }}
                                >
                                    {formatCurrency(lucro)} ({formatPercent(ativo.variacaoPercentual)})
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        color="error"
                                        aria-label="vender ativo"
                                        size="small"
                                        onClick={() => onSellRequest(ativo)}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PortfolioTable;
