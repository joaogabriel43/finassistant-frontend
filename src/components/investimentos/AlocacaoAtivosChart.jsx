import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Box, Typography } from '@mui/material';

const COLORS = ['#7C6AF7', '#00D4AA', '#FF4D6A', '#FFB547', '#4FC3F7'];

const formatBRL = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const AlocacaoAtivosChart = ({ refreshKey = 0 }) => {
    const [data, setData] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        if (!user || !user.id) return;
        api.get(`/investimentos/alocacao/${user.id}`)
            .then((response) => {
                const formatted = (response.data || []).map((item) => ({ name: item.tipo, value: item.valorTotal }));
                setData(formatted);
            })
            .catch((err) => console.error(err));
    }, [user, refreshKey]);

    return (
        <Box>
            {data && data.length > 1 ? (
                <>
                    <Box sx={{ width: '100%', height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => formatBRL(value)}
                                    contentStyle={{
                                        background: '#1a1a2e',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        borderRadius: 8,
                                    }}
                                    labelStyle={{ color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>

                    {/* CSS legend below the chart */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                        {data.map((entry, index) => (
                            <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box
                                    sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        bgcolor: COLORS[index % COLORS.length],
                                        flexShrink: 0,
                                    }}
                                />
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {entry.name} — {formatBRL(entry.value)}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220 }}>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        Adicione pelo menos dois tipos de ativos diferentes para ver o gráfico de alocação.
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default AlocacaoAtivosChart;
