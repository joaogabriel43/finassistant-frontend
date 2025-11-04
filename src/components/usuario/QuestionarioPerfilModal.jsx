import React, { useState } from 'react';
import Modal from 'react-modal';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

Modal.setAppElement('#root');

const questions = [
  { text: 'Qual seu principal objetivo ao investir?', options: ['Preservar meu patrimônio (1)', 'Aumentar meu capital gradualmente (2)', 'Maximizar o retorno, mesmo com riscos (3)'] },
  { text: 'Por quanto tempo você pretende manter seus investimentos?', options: ['Menos de 2 anos (1)', 'Entre 2 e 5 anos (2)', 'Mais de 5 anos (3)'] },
  { text: 'Como você reagiria a uma queda de 20% no valor dos seus investimentos?', options: ['Venderia tudo para evitar mais perdas (1)', 'Manteria, mas ficaria preocupado (2)', 'Compraria mais, aproveitando a oportunidade (3)'] },
];

const modalStyles = {
  content: {
    maxWidth: '700px',
    inset: '50% auto auto 50%',
    transform: 'translate(-50%, 50px)',
    padding: '30px',
    borderRadius: '12px',
    background: '#1f2733',
    color: '#f7fafc',
    border: '1px solid #2d3748'
  },
  overlay: { background: 'rgba(0,0,0,0.6)' }
};

export default function QuestionarioPerfilModal({ isOpen, onFinish }) {
  const { user } = useAuth();
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleAnswer = (index, score) => setAnswers(prev => ({ ...prev, [index]: score }));

  const allAnswered = Object.keys(answers).length === questions.length;

  const handleSubmit = async () => {
    if (!user) return;
    if (!allAnswered) { alert('Responda todas as perguntas.'); return; }
    setSubmitting(true);
    try {
      const respostasNum = questions.map((_, i) => answers[i]);
      await api.post(`/api/usuario/questionario/${user.id}`, { respostas: respostasNum });
      onFinish?.();
    } catch (e) {
      console.error('Erro ao salvar perfil', e);
      alert('Não foi possível salvar seu perfil agora.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} style={modalStyles} contentLabel="Questionário de Perfil">
      <h2 style={{ marginTop: 0 }}>Descubra seu Perfil de Investidor</h2>
      <p style={{ fontSize: '0.9rem', color: '#a0aec0' }}>Responda rapidamente para personalizarmos recomendações.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {questions.map((q, qi) => (
          <div key={qi} style={{ background: '#2d3748', padding: '16px', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>{qi + 1}. {q.text}</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => handleAnswer(qi, oi + 1)}
                  style={{
                    background: answers[qi] === oi + 1 ? '#3182ce' : '#4a5568',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >{opt}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          style={{
            background: allAnswered ? '#38a169' : '#2f855a',
            opacity: submitting ? 0.7 : 1,
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: allAnswered && !submitting ? 'pointer' : 'not-allowed'
          }}
        >{submitting ? 'Salvando...' : 'Finalizar Questionário'}</button>
      </div>
    </Modal>
  );
}
