import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

Modal.setAppElement('#root');

const EditarTransacaoModal = ({ isOpen, onRequestClose, transacao, onUpdate }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({ valor: '', categoria: '', descricao: '', tipo: 'SAIDA' });

    useEffect(() => {
        if (transacao) {
            setFormData({
                valor: transacao?.valor?.quantia ?? '',
                categoria: transacao?.categoria ?? '',
                descricao: transacao?.descricao ?? '',
                tipo: transacao?.tipo === 'CREDIT' ? 'ENTRADA' : 'SAIDA',
            });
        }
    }, [transacao]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?.id || !transacao?.id) return;
        try {
            await api.put(`/orcamento/transacao/${user.id}/${transacao.id}`, formData);
            if (onUpdate) onUpdate();
            onRequestClose();
        } catch (error) {
            console.error('Erro ao editar transação', error);
            alert('Falha ao editar a transação.');
        }
    };

    const modalStyles = {
        content: {
            maxWidth: '520px',
            margin: 'auto',
            background: '#2d3748',
            color: '#e2e8f0',
            border: '1px solid #4a5568'
        },
        overlay: { backgroundColor: 'rgba(0,0,0,0.5)' }
    };

    const inputStyle = { padding: 10, borderRadius: 6, border: '1px solid #4a5568', background: '#1a202c', color: '#e2e8f0', width: '100%' };
    const formGrid = { display: 'grid', gap: 12 };
    const actions = { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 };
    const saveBtn = { padding: '8px 12px', borderRadius: 6, background: '#00C49F', border: 'none', color: '#0b1513', fontWeight: 700, cursor: 'pointer' };
    const cancelBtn = { padding: '8px 12px', borderRadius: 6, background: '#4a5568', border: 'none', color: '#e2e8f0', cursor: 'pointer' };

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={modalStyles}>
            <h2 style={{ marginTop: 0 }}>Editar Transação</h2>
            <form onSubmit={handleSubmit} style={formGrid}>
                <input type="number" step="0.01" name="valor" placeholder="Valor" value={formData.valor} onChange={handleChange} required style={inputStyle} />
                <input type="text" name="categoria" placeholder="Categoria" value={formData.categoria} onChange={handleChange} required style={inputStyle} />
                <input type="text" name="descricao" placeholder="Descrição" value={formData.descricao} onChange={handleChange} required style={inputStyle} />
                <select name="tipo" value={formData.tipo} onChange={handleChange} style={inputStyle}>
                    <option value="SAIDA">Despesa</option>
                    <option value="ENTRADA">Receita</option>
                </select>
                <div style={actions}>
                    <button type="button" onClick={onRequestClose} style={cancelBtn}>Cancelar</button>
                    <button type="submit" style={saveBtn}>Salvar Alterações</button>
                </div>
            </form>
        </Modal>
    );
};

export default EditarTransacaoModal;
