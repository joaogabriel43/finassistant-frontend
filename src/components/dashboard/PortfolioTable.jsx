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
    Tooltip,
    Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SellIcon from '@mui/icons-material/Sell';
import { formatBRL } from '../ui';

const PortfolioTable = ({
    onSellRequest = () => {},
    onEditRequest = null,
    onRemoveRequest = null,
    refreshKey = 0,
}) => {
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

    const formatPercent = (value) => new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2 }).format((value ?? 0));

    // Regra do design system D4: valores monetários usam formatBRL + fonte mono.
    const monoSx = { fontFamily: (theme) => theme.typography.fontFamilyMono };

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
        <TableContainer sx={{ mt: 1, overflowX: 'auto' }}>
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
                                <TableCell align="right" sx={monoSx}>{formatBRL(ativo.precoMedio)}</TableCell>
                                <TableCell align="right" sx={monoSx}>{formatBRL(ativo.totalAtual)}</TableCell>
                                <TableCell
                                    align="right"
                                    sx={{
                                        ...monoSx,
                                        color: lucro >= 0 ? 'success.main' : 'error.main',
                                        fontWeight: 600,
                                    }}
                                >
                                    {formatBRL(lucro)} ({formatPercent(ativo.variacaoPercentual)})
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                    {onEditRequest && (
                                        <Tooltip title="Editar posição">
                                            <IconButton
                                                aria-label={`editar ${ativo.ticker}`}
                                                size="small"
                                                onClick={() => onEditRequest(ativo)}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    <Tooltip title="Vender">
                                        <IconButton
                                            color="warning"
                                            aria-label={`vender ${ativo.ticker}`}
                                            size="small"
                                            onClick={() => onSellRequest(ativo)}
                                        >
                                            <SellIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    {onRemoveRequest && (
                                        <Tooltip title="Remover ativo">
                                            <IconButton
                                                color="error"
                                                aria-label={`remover ${ativo.ticker}`}
                                                size="small"
                                                onClick={() => onRemoveRequest(ativo)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
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
