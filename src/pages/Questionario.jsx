import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    IconButton,
    LinearProgress,
    Typography,
    Button,
    CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const questions = [
    { text: 'Qual seu principal objetivo ao investir?', options: ['Preservar meu patrimônio', 'Aumentar meu capital gradualmente', 'Maximizar o retorno, mesmo com riscos'] },
    { text: 'Por quanto tempo você pretende manter seus investimentos?', options: ['Menos de 2 anos', 'Entre 2 e 5 anos', 'Mais de 5 anos'] },
    { text: 'Como você reagiria a uma queda de 20% no valor dos seus investimentos?', options: ['Venderia tudo para evitar mais perdas', 'Manteria, mas ficaria preocupado', 'Compraria mais, aproveitando a oportunidade'] },
    { text: 'Qual sua familiaridade com produtos de investimento complexos?', options: ['Nenhuma, prefiro o básico', 'Alguma, entendo os conceitos gerais', 'Alta, invisto e estudo ativamente'] },
];

const Questionario = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const caminho = window.location.pathname;
        const ehRefazer = caminho === '/questionario-perfil';
        if (!ehRefazer && user && user.perfilInvestidor && user.perfilInvestidor !== 'INDEFINIDO') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleAnswer = (questionIndex, score) => {
        setAnswers((prev) => ({ ...prev, [questionIndex]: score }));
    };

    const handleNext = () => {
        if (answers[currentStep] === undefined) return;
        setCurrentStep((prev) => prev + 1);
    };

    const handlePrevious = () => {
        setCurrentStep((prev) => prev - 1);
    };

    const handleClose = () => {
        navigate('/investimentos');
    };

    const handleSubmit = async () => {
        if (!user) return;
        if (answers[currentStep] === undefined) return;
        const respostasNum = questions.map((_, i) => answers[i]);
        if (respostasNum.some((r) => r === undefined)) return;
        try {
            setSubmitting(true);
            await api.post(`/usuario/questionario/${user.id}`, { respostas: respostasNum });
            await updateUser();
            navigate('/dashboard');
        } catch (error) {
            console.error('Erro ao salvar perfil', error?.response || error);
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#0a0a0f' }}>
                <CircularProgress sx={{ color: '#7C6AF7' }} />
            </Box>
        );
    }

    const isLastStep = currentStep === questions.length - 1;
    const progress = ((currentStep + 1) / questions.length) * 100;

    return (
        <Box sx={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            minHeight: '100vh', bgcolor: '#0a0a0f', p: 2,
        }}>
            <Box sx={{ width: '100%', maxWidth: 640 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Pergunta {currentStep + 1} de {questions.length}
                    </Typography>
                    <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary' }} aria-label="fechar questionário">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                {/* Progress bar */}
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                        mb: 3, height: 4, borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.08)',
                        '& .MuiLinearProgress-bar': { bgcolor: '#7C6AF7', borderRadius: 2 },
                    }}
                />

                {/* Question card */}
                <Card sx={{ mb: 3, p: 1 }}>
                    <CardContent>
                        <Typography variant="body2" sx={{ color: '#7C6AF7', fontWeight: 600, mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.72rem' }}>
                            Perfil de Investidor
                        </Typography>
                        <Typography variant="h6" fontWeight={600}>
                            {questions[currentStep].text}
                        </Typography>
                    </CardContent>
                </Card>

                {/* Option cards */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                    {questions[currentStep].options.map((opt, optIndex) => {
                        const score = optIndex + 1;
                        const selected = answers[currentStep] === score;
                        return (
                            <Card
                                key={optIndex}
                                onClick={() => !submitting && handleAnswer(currentStep, score)}
                                sx={{
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    border: selected
                                        ? '1px solid rgba(124,106,247,0.6)'
                                        : '1px solid rgba(255,255,255,0.08)',
                                    bgcolor: selected
                                        ? 'rgba(124,106,247,0.12)'
                                        : 'rgba(255,255,255,0.02)',
                                    transition: 'all 0.2s',
                                    opacity: submitting ? 0.6 : 1,
                                    '&:hover': !submitting ? {
                                        border: '1px solid rgba(124,106,247,0.4)',
                                        bgcolor: 'rgba(124,106,247,0.06)',
                                    } : {},
                                }}
                            >
                                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: '14px !important' }}>
                                    <Typography variant="body1">{opt}</Typography>
                                    {selected && <CheckCircleIcon sx={{ color: '#7C6AF7', fontSize: 20, flexShrink: 0, ml: 1 }} />}
                                </CardContent>
                            </Card>
                        );
                    })}
                </Box>

                {/* Navigation */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    {currentStep > 0 ? (
                        <Button variant="outlined" onClick={handlePrevious} disabled={submitting}>
                            Anterior
                        </Button>
                    ) : (
                        <Box />
                    )}
                    {!isLastStep ? (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={submitting || answers[currentStep] === undefined}
                        >
                            Próxima
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={submitting || answers[currentStep] === undefined}
                            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
                        >
                            {submitting ? 'Salvando...' : 'Finalizar'}
                        </Button>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default Questionario;
