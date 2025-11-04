import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import IconButton from '@mui/material/IconButton';
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
                <div style={{ marginTop: '40px' }}>
                    <h3 style={{ textAlign: 'center' }}><Skeleton width={300} /></h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #00C49F' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}><Skeleton width={50} /></th>
                                <th style={{ padding: '10px', textAlign: 'right' }}><Skeleton width={30} /></th>
                                <th style={{ padding: '10px', textAlign: 'right' }}><Skeleton width={80} /></th>
                                <th style={{ padding: '10px', textAlign: 'right' }}><Skeleton width={80} /></th>
                                <th style={{ padding: '10px', textAlign: 'right' }}><Skeleton width={80} /></th>
                                <th style={{ padding: '10px', textAlign: 'right' }}><Skeleton width={100} /></th>
                                <th style={{ padding: '10px', textAlign: 'right' }}><Skeleton width={60} /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 3 }).map((_, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #444' }}>
                                    <td style={{ padding: '10px' }}><Skeleton /></td>
                                    <td style={{ padding: '10px' }}><Skeleton /></td>
                                    <td style={{ padding: '10px' }}><Skeleton /></td>
                                    <td style={{ padding: '10px' }}><Skeleton /></td>
                                    <td style={{ padding: '10px' }}><Skeleton /></td>
                                    <td style={{ padding: '10px' }}><Skeleton /></td>
                                    <td style={{ padding: '10px' }}><Skeleton /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SkeletonTheme>
        );
    }

    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!portfolio || portfolio.length === 0) return <p>Você ainda não possui ativos no seu portfólio.</p>;

    return (
        <div style={{ marginTop: '40px' }}>
            <h3 style={{ textAlign: 'center' }}>Meu Portfólio de Investimentos</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #00C49F' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Ativo</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Qtd.</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Preço Médio</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Preço Atual</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Total</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Lucro/Prejuízo</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {portfolio.map((ativo) => (
                        <tr key={ativo.ticker} style={{ borderBottom: '1px solid #444' }}>
                            <td style={{ padding: '10px', textAlign: 'left' }}>{ativo.ticker}</td>
                            <td style={{ padding: '10px', textAlign: 'right' }}>{ativo.quantidade}</td>
                            <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(ativo.precoMedio)}</td>
                            <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(ativo.precoAtual)}</td>
                            <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(ativo.totalAtual)}</td>
                            <td style={{ padding: '10px', textAlign: 'right', color: (ativo.lucroPrejuizo ?? 0) >= 0 ? '#00C49F' : '#FF8042' }}>
                                {formatCurrency(ativo.lucroPrejuizo)} ({formatPercent(ativo.variacaoPercentual)})
                            </td>
                            <td style={{ padding: '10px', textAlign: 'right' }}>
                                <IconButton color="error" aria-label="vender ativo" onClick={() => onSellRequest(ativo)}>
                                    <DeleteIcon />
                                </IconButton>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PortfolioTable;
