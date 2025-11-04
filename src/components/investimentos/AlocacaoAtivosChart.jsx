import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Box, Typography } from '@mui/material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
        <div style={{ width: '100%', height: 400 }}>
            <h3 style={{ textAlign: 'center' }}>Alocação por Tipo de Ativo</h3>
            {data && data.length > 1 ? (
                <ResponsiveContainer>
                    <PieChart>
                        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                    <Typography variant="body1" color="text.secondary">
                        Adicione pelo menos dois tipos de ativos diferentes para ver o gráfico de alocação.
                    </Typography>
                </Box>
            )}
        </div>
    );
};

export default AlocacaoAtivosChart;
