import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const questions = [
    { text: 'Qual seu principal objetivo ao investir?', options: ['Preservar meu patrimônio', 'Aumentar meu capital gradualmente', 'Maximizar o retorno, mesmo com riscos'] },
    { text: 'Por quanto tempo você pretende manter seus investimentos?', options: ['Menos de 2 anos', 'Entre 2 e 5 anos', 'Mais de 5 anos'] },
    { text: 'Como você reagiria a uma queda de 20% no valor dos seus investimentos?', options: ['Venderia tudo para evitar mais perdas', 'Manteria, mas ficaria preocupado', 'Compraria mais, aproveitando a oportunidade'] },
    { text: 'Qual sua familiaridade com produtos de investimento complexos?', options: ['Nenhuma, prefiro o básico', 'Alguma, entendo os conceitos gerais', 'Alta, invisto e estudo ativamente'] }
];

const Questionario = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Log para depuração ao carregar o componente com a rota atual
    useEffect(() => {
        console.log('Componente Questionario carregado na rota:', window.location.pathname);
    }, []);

    useEffect(() => {
        // Se usuário já tem perfil definido, redireciona, exceto quando estiver na rota de refazer questionário
        const caminho = window.location.pathname;
        const ehRefazer = caminho === '/questionario-perfil';
        if (!ehRefazer && user && user.perfilInvestidor && user.perfilInvestidor !== 'INDEFINIDO') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleAnswer = (questionIndex, score) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: score }));
    };

    const handleNext = () => {
        if (answers[currentStep] === undefined) {
            alert('Por favor, selecione uma opção.');
            return;
        }
        setCurrentStep(prev => prev + 1);
    };

    const handlePrevious = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        if (!user) {
            alert('Usuário ainda não carregado. Aguarde um instante.');
            return;
        }
        if (answers[currentStep] === undefined) {
            alert('Por favor, selecione uma opção.');
            return;
        }
        const respostasNum = questions.map((_, i) => answers[i]); // garante ordem
        if (respostasNum.some(r => r === undefined)) {
            alert('Existem perguntas sem resposta.');
            return;
        }
        try {
            setSubmitting(true);
            await api.post(`/usuario/questionario/${user.id}`, { respostas: respostasNum });
            await updateUser();
            navigate('/dashboard');
        } catch (error) {
            console.error('Erro ao salvar perfil', error?.response || error);
            alert(`Ocorreu um erro ao salvar seu perfil. Código: ${error?.response?.status || 'desconhecido'}`);
        } finally {
            setSubmitting(false);
        }
    };

    // Render placeholder enquanto user não carregado
    if (!user) {
        return <div style={{ color: '#fff', textAlign: 'center', marginTop: '40px' }}>Carregando usuário...</div>;
    }

    const isLastStep = currentStep === questions.length - 1;

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '650px', backgroundColor: '#2d3748', padding: '40px', borderRadius: '10px', color: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>
                <h2 style={{ marginTop: 0 }}>Descubra seu Perfil de Investidor ({currentStep + 1}/{questions.length})</h2>
                <div>
                    <h4 style={{ fontWeight: 'normal' }}>{questions[currentStep].text}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                        {questions[currentStep].options.map((opt, optIndex) => {
                            const score = optIndex + 1;
                            return (
                                <button
                                    key={optIndex}
                                    onClick={() => handleAnswer(currentStep, score)}
                                    disabled={submitting}
                                    style={{
                                        padding: '14px 16px',
                                        border: answers[currentStep] === score ? '2px solid #00C49F' : '2px solid #4a5568',
                                        backgroundColor: answers[currentStep] === score ? 'rgba(0,196,159,0.15)' : 'transparent',
                                        color: 'white',
                                        textAlign: 'left',
                                        cursor: submitting ? 'not-allowed' : 'pointer',
                                        borderRadius: '8px',
                                        transition: 'all .2s',
                                        opacity: submitting ? 0.6 : 1
                                    }}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '35px' }}>
                    {currentStep > 0 && <button onClick={handlePrevious} disabled={submitting} style={{ background: '#4a5568', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>Anterior</button>}
                    {!isLastStep && <button onClick={handleNext} disabled={submitting} style={{ marginLeft: 'auto', background: '#3182ce', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>Próxima</button>}
                    {isLastStep && <button onClick={handleSubmit} disabled={submitting} style={{ marginLeft: 'auto', background: '#00C49F', color: '#1a202c', fontWeight: 'bold', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>{submitting ? 'Salvando...' : 'Finalizar'}</button>}
                </div>
            </div>
        </div>
    );
};

export default Questionario;
