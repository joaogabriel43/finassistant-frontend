import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
    MenuItem, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LabelIcon from '@mui/icons-material/Label';
import api from '../../services/api';
import { extrairMensagemErroApi } from '../../utils/apiErrorUtils';

/**
 * Gestão de categorias personalizadas (ADR-038 — Lote D).
 * Dicionário do usuário: nome + cor + 1 nível de subcategoria. As transações
 * continuam aceitando texto livre — aqui só se define o vocabulário e as
 * cores usadas nos gráficos e no autocomplete do formulário.
 */
const FORM_VAZIO = { nome: '', cor: '#7C6AF7', categoriaPaiId: '' };

const MinhasCategoriasCard = () => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editando, setEditando] = useState(null); // categoria em edição ou null (nova)
    const [form, setForm] = useState(FORM_VAZIO);
    const [salvando, setSalvando] = useState(false);
    const [confirmarExclusao, setConfirmarExclusao] = useState(null);

    const carregar = useCallback(() => {
        setLoading(true);
        api.get('/orcamento/categorias-gerenciadas')
            .then((res) => { setCategorias(res.data ?? []); setErro(''); })
            .catch((err) => setErro(extrairMensagemErroApi(err, 'Erro ao carregar categorias.')))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { carregar(); }, [carregar]);

    const abrirNova = () => { setEditando(null); setForm(FORM_VAZIO); setDialogOpen(true); };

    const abrirEdicao = (cat) => {
        setEditando(cat);
        setForm({ nome: cat.nome, cor: cat.cor, categoriaPaiId: cat.categoriaPaiId ?? '' });
        setDialogOpen(true);
    };

    const salvar = async () => {
        setSalvando(true);
        setErro('');
        const payload = {
            nome: form.nome,
            cor: form.cor,
            categoriaPaiId: form.categoriaPaiId || null,
        };
        try {
            if (editando) {
                await api.put(`/orcamento/categorias-gerenciadas/${editando.id}`, payload);
            } else {
                await api.post('/orcamento/categorias-gerenciadas', payload);
            }
            setDialogOpen(false);
            carregar();
        } catch (err) {
            setErro(extrairMensagemErroApi(err, 'Erro ao salvar categoria.'));
        } finally {
            setSalvando(false);
        }
    };

    const excluir = async (cat) => {
        setErro('');
        try {
            await api.delete(`/orcamento/categorias-gerenciadas/${cat.id}`);
            setConfirmarExclusao(null);
            carregar();
        } catch (err) {
            setConfirmarExclusao(null);
            setErro(extrairMensagemErroApi(err, 'Erro ao excluir categoria.'));
        }
    };

    const raizes = categorias.filter((c) => !c.categoriaPaiId);
    const filhasDe = (id) => categorias.filter((c) => c.categoriaPaiId === id);

    const linhaCategoria = (cat, isFilha = false) => (
        <Box key={cat.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, pl: isFilha ? 4 : 0 }}>
            <Chip
                size="small"
                icon={<LabelIcon sx={{ '&&': { color: cat.cor } }} />}
                label={cat.nome}
                data-testid={`cat-chip-${cat.nome}`}
                sx={{
                    bgcolor: `${cat.cor}22`,
                    color: '#fff',
                    border: `1px solid ${cat.cor}66`,
                    fontWeight: 600,
                }}
            />
            <Box sx={{ flexGrow: 1 }} />
            <IconButton size="small" aria-label={`Editar ${cat.nome}`} onClick={() => abrirEdicao(cat)}>
                <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" aria-label={`Excluir ${cat.nome}`} onClick={() => setConfirmarExclusao(cat)}>
                <DeleteOutlineIcon fontSize="small" />
            </IconButton>
        </Box>
    );

    return (
        <Card sx={{ mb: 3 }} data-testid="minhas-categorias-card">
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Minhas Categorias
                    </Typography>
                    <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={abrirNova}
                        data-testid="btn-nova-categoria">
                        Nova Categoria
                    </Button>
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                    Defina nomes, cores e subcategorias — as cores aparecem nos gráficos e o
                    lançamento de transações continua aceitando qualquer texto.
                </Typography>

                {erro && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErro('')}>{erro}</Alert>}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : raizes.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Nenhuma categoria personalizada ainda.
                    </Typography>
                ) : (
                    raizes.map((raiz) => (
                        <Box key={raiz.id}>
                            {linhaCategoria(raiz)}
                            {filhasDe(raiz.id).map((filha) => linhaCategoria(filha, true))}
                        </Box>
                    ))
                )}
            </CardContent>

            {/* Dialog criar/editar */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>{editando ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
                    <TextField
                        label="Nome"
                        size="small"
                        value={form.nome}
                        onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                        inputProps={{ maxLength: 40, 'data-testid': 'input-nome-categoria' }}
                        autoFocus
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="body2">Cor:</Typography>
                        <input
                            type="color"
                            value={form.cor}
                            onChange={(e) => setForm((f) => ({ ...f, cor: e.target.value.toUpperCase() }))}
                            data-testid="input-cor-categoria"
                            style={{ width: 48, height: 32, border: 'none', background: 'transparent', cursor: 'pointer' }}
                        />
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{form.cor}</Typography>
                    </Box>
                    <TextField
                        select
                        label="Categoria pai (opcional)"
                        size="small"
                        value={form.categoriaPaiId}
                        onChange={(e) => setForm((f) => ({ ...f, categoriaPaiId: e.target.value }))}
                        helperText="Subcategorias têm apenas 1 nível"
                    >
                        <MenuItem value="">Nenhuma (categoria raiz)</MenuItem>
                        {raizes
                            .filter((r) => !editando || r.id !== editando.id)
                            .map((r) => (
                                <MenuItem key={r.id} value={r.id}>{r.nome}</MenuItem>
                            ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} disabled={salvando}>Cancelar</Button>
                    <Button variant="contained" onClick={salvar}
                        disabled={salvando || !form.nome.trim()}
                        data-testid="btn-salvar-categoria">
                        {salvando ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirmação de exclusão */}
            <Dialog open={!!confirmarExclusao} onClose={() => setConfirmarExclusao(null)} maxWidth="xs">
                <DialogTitle>Excluir categoria?</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">
                        “{confirmarExclusao?.nome}” será removida. As transações já lançadas
                        com esse nome NÃO são alteradas.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmarExclusao(null)}>Cancelar</Button>
                    <Button color="error" variant="contained" onClick={() => excluir(confirmarExclusao)}
                        data-testid="btn-confirmar-exclusao">
                        Excluir
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default MinhasCategoriasCard;
