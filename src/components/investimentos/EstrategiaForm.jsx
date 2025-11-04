import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const TIPOS = [
  { key: 'ACAO', label: 'Ações' },
  { key: 'FUNDO_IMOBILIARIO', label: 'Fundos Imobiliários' },
  { key: 'RENDA_FIXA', label: 'Renda Fixa' },
  { key: 'CRIPTOMOEDA', label: 'Criptomoedas' },
];

const linhaStyle = { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 };
const inputStyle = { width: 90, padding: '6px 8px', borderRadius: 4, border: '1px solid #2d3748', background: '#0f172a', color: '#e2e8f0' };
const selectStyle = { padding: '6px 8px', borderRadius: 4, border: '1px solid #2d3748', background: '#0f172a', color: '#e2e8f0' };
const btnStyle = { padding: '8px 12px', borderRadius: 4, border: 'none', cursor: 'pointer' };

export default function EstrategiaForm() {
  const { user } = useAuth();
  const [linhas, setLinhas] = useState([]); // [{tipo:"ACAO", pct:25}]
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [analise, setAnalise] = useState([]);

  const soma = useMemo(() => linhas.reduce((acc, l) => acc + (Number(l.pct) || 0), 0), [linhas]);
  const valido = Math.abs(soma - 100) <= 0.5 && linhas.length > 0 && linhas.every(l => l.pct >= 0 && l.pct <= 100);

  const carregar = async () => {
    if (!user?.id) return;
    console.log('EstrategiaForm.jsx: Tentando carregar. Token no localStorage:', localStorage.getItem('authToken'));
    try {
      // Atualizado para endpoint legacy
      const res = await api.get(`/investimentos/estrategia-legacy`);
      const mapa = res.data?.alocacaoAlvo || {};
      const novas = Object.entries(mapa).map(([k, v]) => ({ tipo: k, pct: Math.round((v || 0) * 10000) / 100 }));
      if (novas.length === 0) {
        setLinhas([{ tipo: 'ACAO', pct: 25 }, { tipo: 'FUNDO_IMOBILIARIO', pct: 25 }, { tipo: 'RENDA_FIXA', pct: 50 }]);
      } else {
        setLinhas(novas);
      }
    } catch (e) {
      console.error('EstrategiaForm.jsx: Falha ao carregar estratégia', e);
      setLinhas([{ tipo: 'ACAO', pct: 25 }, { tipo: 'FUNDO_IMOBILIARIO', pct: 25 }, { tipo: 'RENDA_FIXA', pct: 50 }]);
    }
  };

  useEffect(() => { carregar(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const addLinha = () => setLinhas(prev => [...prev, { tipo: 'ACAO', pct: 0 }]);
  const rmLinha = (idx) => setLinhas(prev => prev.filter((_, i) => i !== idx));
  const changeTipo = (idx, tipo) => setLinhas(prev => prev.map((l, i) => i === idx ? { ...l, tipo } : l));
  const changePct = (idx, pct) => setLinhas(prev => prev.map((l, i) => i === idx ? { ...l, pct: Number(pct) } : l));

  const salvar = async () => {
    if (!user?.id) return;
    setMensagem(null);
    setAnalise([]);
    if (!valido) {
      setMensagem('A soma deve ser 100% e todos valores entre 0 e 100.');
      return;
    }
    setSalvando(true);
    try {
      const mapa = Object.fromEntries(linhas.map(l => [l.tipo, (Number(l.pct) || 0) / 100]));
      // Atualizado para endpoint legacy; payload sem usuarioId
      await api.post(`/investimentos/estrategia-legacy`, { alocacaoAlvo: mapa });
      setMensagem('Estratégia salva com sucesso.');
    } catch (e) {
      console.error(e);
      setMensagem('Falha ao salvar estratégia.');
    } finally {
      setSalvando(false);
    }
  };

  const executarAnalise = async () => {
    if (!user?.id) return;
    setAnalise([]);
    try {
      // Atualizado para endpoint legacy
      const res = await api.get(`/investimentos/estrategia-legacy/analise`);
      const mensagens = Array.isArray(res.data) ? res.data : (res.data?.mensagens || []);
      setAnalise(mensagens);
    } catch (e) {
      console.error(e);
      setAnalise(['Não foi possível gerar a análise agora.']);
    }
  };

  return (
    <div style={{ marginTop: 24 }}>
      <h3>Minha Estratégia</h3>
      <p style={{ color: '#a0aec0', marginBottom: 8 }}>Defina sua alocação-alvo por classe (deve somar 100%).</p>
      {linhas.map((l, idx) => (
        <div key={idx} style={linhaStyle}>
          <select value={l.tipo} onChange={(e) => changeTipo(idx, e.target.value)} style={selectStyle}>
            {TIPOS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <input type="number" min={0} max={100} step={0.5} value={l.pct} onChange={(e) => changePct(idx, e.target.value)} style={inputStyle} />
          <span>%</span>
          <button onClick={() => rmLinha(idx)} style={{ ...btnStyle, background: '#e53e3e', color: '#fff' }}>Remover</button>
        </div>
      ))}
      <div style={{ ...linhaStyle, justifyContent: 'space-between' }}>
        <button onClick={addLinha} style={{ ...btnStyle, background: '#3182ce', color: '#fff' }}>Adicionar Classe</button>
        <div style={{ color: valido ? '#00C49F' : '#FF8042' }}>Soma: {soma.toFixed(1)}%</div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <button disabled={!valido || salvando} onClick={salvar} style={{ ...btnStyle, background: valido ? '#38a169' : '#4a5568', color: '#fff' }}>{salvando ? 'Salvando...' : 'Salvar Estratégia'}</button>
        <button onClick={executarAnalise} style={{ ...btnStyle, background: '#805ad5', color: '#fff' }}>Analisar Rebalanceamento</button>
      </div>
      {mensagem && <p style={{ marginTop: 8 }}>{mensagem}</p>}
      {analise.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4>Sugestões</h4>
          <ul>
            {analise.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
