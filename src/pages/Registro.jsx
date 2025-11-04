import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Registro = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await authService.registrar(email, senha);
            setSuccess('Usuário registrado com sucesso! Redirecionando para o login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data || 'Erro ao registrar. Tente novamente.');
        }
    };

    const containerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        minHeight: '100vh',
        padding: '20px'
    };

    const formStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        backgroundColor: '#2d3748',
        padding: '30px',
        borderRadius: '8px',
        width: '350px',
        color: 'white'
    };
    const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #4a5568', backgroundColor: '#1a202c', color: '#e2e8f0' };
    const buttonStyle = { padding: '10px', borderRadius: '4px', border: 'none', backgroundColor: '#00C49F', color: 'white', fontWeight: 'bold', cursor: 'pointer' };

    return (
        <div style={containerStyle}>
            <form onSubmit={handleRegister} style={formStyle}>
                <h2>Registrar</h2>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
                <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required style={inputStyle} />
                <button type="submit" style={buttonStyle}>Registrar</button>
                {error && <p style={{ color: '#FF8042' }}>{error}</p>}
                {success && <p style={{ color: '#00C49F' }}>{success}</p>}
                <p style={{ textAlign: 'center' }}>Já tem uma conta? <Link to="/login" style={{ color: '#00C49F' }}>Faça login</Link></p>
            </form>
        </div>
    );
};

export default Registro;
