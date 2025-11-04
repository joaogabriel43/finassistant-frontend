import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';

const Layout = () => {
    const layoutStyle = {
        display: 'flex',
        height: '100vh',
        width: '100vw'
    };

    const mainContentStyle = {
        flexGrow: 1,
        padding: '2rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    };

    return (
        <div style={layoutStyle}>
            <Sidebar />
            <main style={mainContentStyle}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
