import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Box, TextField, Button, Paper, List, ListItem, Typography, IconButton, Skeleton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrencyInText } from '../utils/formatters';
import UploadComprovanteModal from './comprovantes/UploadComprovanteModal';

const MENSAGEM_BEM_VINDO = { text: 'Olá! Eu sou o Fortunai. Como posso te ajudar hoje?', sender: 'bot' };

// API helpers para histórico de chat persistido no backend
const buscarHistorico = async (limite = 50) => {
    const res = await api.get(`/chat/historico?limite=${limite}`);
    return res.data;
};

const limparHistoricoBackend = async () => {
    await api.delete('/chat/historico');
};

const Chat = () => {
    const { user } = useAuth();
    const userKey = user?.id ?? user?.email ?? user?.username ?? 'anon';

    const keySession = (k) => `chatSessionId:${k}`;

    // Cleanup de chaves legadas sem escopo de usuário
    useEffect(() => {
        try {
            if (localStorage.getItem('chatHistory')) localStorage.removeItem('chatHistory');
            if (localStorage.getItem('chatSessionId')) localStorage.removeItem('chatSessionId');
        } catch (_) { /* ignore */ }
    }, []);

    // Helper de reidratação de sessão por usuário (mantido em localStorage — é leve e efêmero)
    const loadSessionId = (k) => {
        try {
            return localStorage.getItem(keySession(k)) || uuidv4();
        } catch (_) {
            return uuidv4();
        }
    };

    // Estados
    const [sessionId, setSessionId] = useState(() => loadSessionId(userKey));
    const [messages, setMessages] = useState([MENSAGEM_BEM_VINDO]);
    const [loadingHistorico, setLoadingHistorico] = useState(true);
    const [loadingResposta, setLoadingResposta] = useState(false);
    const [input, setInput] = useState('');
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Carrega histórico do backend ao montar (ou quando o usuário mudar).
    // Usa flag de cancelamento para não sobrescrever mensagens caso o usuário
    // já tenha interagido com o chat enquanto o histórico carregava.
    useEffect(() => {
        if (!user?.id) return;

        setSessionId(loadSessionId(userKey));

        let cancelado = false;

        const carregarHistorico = async () => {
            try {
                setLoadingHistorico(true);
                const historico = await buscarHistorico(50);
                if (cancelado) return;
                // Mapeia ChatHistoricoDTO → formato local { text, sender }
                const mensagens = historico.map((dto) => ({
                    id: dto.id,
                    text: dto.conteudo,
                    sender: dto.role === 'user' ? 'user' : 'bot',
                    timestamp: dto.criadoEm,
                    sessaoId: dto.sessaoId,
                }));
                // Só sobrescreve se o usuário ainda não iniciou a conversa (evita race condition)
                setMessages((prev) => {
                    const apenasBoasVindas = prev.length === 1 && prev[0].text === MENSAGEM_BEM_VINDO.text;
                    if (!apenasBoasVindas) return prev;
                    return mensagens.length ? mensagens : [MENSAGEM_BEM_VINDO];
                });
            } catch (e) {
                if (cancelado) return;
                console.warn('Falha ao carregar histórico — iniciando chat vazio', e);
                // Não altera estado em erro — a mensagem de boas-vindas já está lá como fallback
            } finally {
                if (!cancelado) setLoadingHistorico(false);
            }
        };

        carregarHistorico();

        return () => { cancelado = true; };
    }, [user?.id]);

    // Persiste sessionId por usuário
    useEffect(() => {
        try {
            localStorage.setItem(keySession(userKey), sessionId);
        } catch (_) { /* ignore */ }
    }, [sessionId, userKey]);

    // Scroll automático ao final quando mensagens mudam
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const userMessage = { text: input, sender: 'user' };
        setMessages((prev) => [...prev, userMessage]);
        const currentInput = input;
        setInput('');

        const typingMessage = { text: 'Assistente está digitando...', sender: 'bot', typing: true };
        setMessages((prev) => [...prev, typingMessage]);
        setLoadingResposta(true);

        try {
            const response = await api.post('/chat/enviar', {
                mensagem: currentInput,
                idSessao: sessionId,
            });
            const data = response.data;
            const botMessage = { text: data.resposta, sender: 'bot' };
            setMessages((prev) => [...prev.filter((m) => !m.typing), botMessage]);
        } catch (error) {
            console.error('Falha ao enviar mensagem:', error);
            const errorMessage = { text: 'Desculpe, não consegui me conectar ao assistente.', sender: 'bot' };
            setMessages((prev) => [...prev.filter((m) => !m.typing), errorMessage]);
        } finally {
            setLoadingResposta(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) { alert('Arquivo deve ter no maximo 5MB.'); return; }
        const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
        if (!allowed.includes(file.type)) { alert('Apenas PDF, PNG ou JPG.'); return; }
        setUploadFile(file);
        setUploadModalOpen(true);
        e.target.value = '';
    };

    const limparChat = async () => {
        try {
            await limparHistoricoBackend();
        } catch (e) {
            console.warn('Falha ao limpar histórico no backend', e);
            // Continua — limpa estado local mesmo assim
        }
        setMessages([MENSAGEM_BEM_VINDO]);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                maxWidth: 900,
                mx: 'auto',
                px: { xs: 1.5, md: 3 },
                py: 2,
                width: '100%',
            }}
        >
            <Typography variant="h5" gutterBottom>
                Fortunai
            </Typography>

            <Paper
                elevation={3}
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    p: 2,
                    mb: 2,
                }}
            >
                {loadingHistorico && (
                    <Box sx={{ px: 2, py: 1 }}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Box key={i} sx={{ display: 'flex', mb: 1.5,
                                justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start' }}>
                                <Skeleton
                                    animation="wave"
                                    variant="rectangular"
                                    height={60}
                                    width={`${55 + (i * 10)}%`}
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.05)',
                                        borderRadius: i % 2 === 0
                                            ? '18px 18px 4px 18px'
                                            : '18px 18px 18px 4px',
                                    }}
                                />
                            </Box>
                        ))}
                    </Box>
                )}
                <List>
                    {messages.map((msg, index) => (
                        <ListItem key={index} sx={{ justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                            <Paper
                                elevation={2}
                                sx={{
                                    bgcolor: msg.sender === 'user' ? 'primary.main' : 'background.paper',
                                    color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                                    p: 1.5,
                                    borderRadius: 2,
                                    maxWidth: '75%'
                                }}
                            >
                                <Typography component="span" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {msg.typing ? 'Assistente está digitando...' : (msg.sender === 'bot' ? formatCurrencyInText(msg.text) : msg.text)}
                                </Typography>
                            </Paper>
                        </ListItem>
                    ))}
                </List>
                <div ref={messagesEndRef} />
            </Paper>

            <Box component="form" onSubmit={handleSend} sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Digite sua mensagem..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    autoFocus
                />
                <Button type="submit" variant="contained" sx={{ ml: 1, p: '15px' }} endIcon={<SendIcon />} disabled={loadingResposta}>
                    Enviar
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileSelect}
                />
                <IconButton
                    color="primary"
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ ml: 1 }}
                    aria-label="upload comprovante"
                    title="Enviar comprovante"
                >
                    <AttachFileIcon />
                </IconButton>
                <IconButton
                    color="secondary"
                    onClick={limparChat}
                    sx={{ ml: 1 }}
                    aria-label="limpar chat"
                    title="Limpar chat"
                >
                    <DeleteIcon />
                </IconButton>
            </Box>

            <UploadComprovanteModal
                open={uploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                file={uploadFile}
            />
        </Box>
    );
};
export default Chat;
