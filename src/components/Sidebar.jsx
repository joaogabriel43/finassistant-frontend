import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    const sidebarStyle = {
        width: '240px',
        flexShrink: 0,
        backgroundColor: '#1a202c',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        boxSizing: 'border-box',
        borderRight: '1px solid #2d3748'
    };

    const navLinkStyle = {
        color: '#a0aec0',
        textDecoration: 'none',
        padding: '10px 15px',
        borderRadius: '5px',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center'
    };

    const activeLinkStyle = {
        backgroundColor: '#2d3748',
        color: 'white',
        fontWeight: 'bold'
    };

    const bottomContainerStyle = {
        marginTop: 'auto',
        borderTop: '1px solid #2d3748',
        paddingTop: '15px'
    };

    const environmentStyle = { padding: '10px 0', color: '#718096', fontSize: '0.8rem', textAlign: 'center' };
    const logoutButtonStyle = { width: '100%', padding: '10px 15px', borderRadius: '5px', border: 'none', backgroundColor: '#e53e3e', color: 'white', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center' };

    return (
        <aside style={sidebarStyle}>
            <nav style={{ display: 'flex', flexDirection: 'column' }}>
                <NavLink
                    to="/dashboard"
                    style={({ isActive }) => ({ ...navLinkStyle, ...(isActive ? activeLinkStyle : {}) })}
                >
                    Dashboard
                </NavLink>
                <NavLink
                    to="/chat"
                    style={({ isActive }) => ({ ...navLinkStyle, ...(isActive ? activeLinkStyle : {}) })}
                >
                    Chat
                </NavLink>
                <NavLink
                    to="/orcamento"
                    style={({ isActive }) => ({ ...navLinkStyle, ...(isActive ? activeLinkStyle : {}) })}
                >
                    Orçamento
                </NavLink>
                <NavLink
                    to="/investimentos"
                    style={({ isActive }) => ({ ...navLinkStyle, ...(isActive ? activeLinkStyle : {}) })}
                >
                    Investimentos
                </NavLink>
            </nav>

            <div style={bottomContainerStyle}>
                <div style={environmentStyle}>
                    Ambiente: {import.meta.env.MODE.toUpperCase()}
                </div>
                <button style={logoutButtonStyle} onClick={handleLogout}>
                    Sair
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
