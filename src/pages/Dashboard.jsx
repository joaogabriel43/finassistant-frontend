import React from 'react';
import GastosPorCategoriaChart from '../components/dashboard/GastosPorCategoriaChart';

const Dashboard = () => {
    const contentWrapperStyle = {
        width: '100%',
        maxWidth: '1200px'
    };

    return (
        <div style={contentWrapperStyle}>
            <h1>Dashboard Financeiro</h1>
            <hr />
            <div style={{ marginTop: '30px' }}>
                <GastosPorCategoriaChart />
            </div>
        </div>
    );
};

export default Dashboard;
