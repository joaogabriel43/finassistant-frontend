import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  MenuItem,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { formatBRL } from '@/components/ui';
import api from '../../services/api';
import { extrairMensagemErroApi } from '../../utils/apiErrorUtils';

/**
 * Cartões de crédito virtuais (ADR-035): lista com fatura aberta e uso do limite,
 * criação de cartão (com aviso anti-PAN) e lançamento de compra parcelada.
 */

const parseValorBR = (texto) => {
  const v = Number(String(texto ?? '').replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(v) ? v : NaN;
};

const CartoesCard = () => {
  const theme = useTheme();
  const [cartoes, setCartoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [dialogNovo, setDialogNovo] = useState(false);
  const [dialogCompra, setDialogCompra] = useState(null); // cartão alvo
  const [salvando, setSalvando] = useState(false);

  const [novo, setNovo] = useState({ nome: '', bandeira: '', limite: '', diaFechamento: '', diaVencimento: '' });
  const [compra, setCompra] = useState({ descricao: '', valor: '', categoria: '', parcelas: '1' });

  // Detalhes da fatura (ADR-040): quebra por categoria + assinaturas do cartão
  const [dialogFatura, setDialogFatura] = useState(null); // cartão alvo
  const [fatura, setFatura] = useState(null);
  const [assinaturas, setAssinaturas] = useState(null);
  const [carregandoFatura, setCarregandoFatura] = useState(false);

  const abrirFatura = async (cartao) => {
    setDialogFatura(cartao);
    setCarregandoFatura(true);
    setFatura(null);
    setAssinaturas(null);
    const agora = new Date();
    try {
      const [fat, ass] = await Promise.all([
        api.get(`/cartoes/${cartao.id}/fatura?mes=${agora.getMonth() + 1}&ano=${agora.getFullYear()}`),
        api.get(`/cartoes/${cartao.id}/assinaturas`).catch(() => ({ data: null })),
      ]);
      setFatura(fat.data);
      setAssinaturas(ass.data);
    } catch (e) {
      setErro(extrairMensagemErroApi(e, 'Não foi possível carregar a fatura.'));
      setDialogFatura(null);
    } finally {
      setCarregandoFatura(false);
    }
  };

  const excluirParcelamento = async (parcelamentoId) => {
    try {
      await api.delete(`/cartoes/parcelamentos/${parcelamentoId}`);
      // recarrega a fatura aberta E o resumo dos cartões
      if (dialogFatura) await abrirFatura(dialogFatura);
      carregar();
    } catch (e) {
      setErro(extrairMensagemErroApi(e, 'Não foi possível excluir o parcelamento.'));
    }
  };

  const carregar = useCallback(() => {
    setCarregando(true);
    api.get('/cartoes')
      .then(({ data }) => { setCartoes(data); setErro(''); })
      .catch((e) => setErro(extrairMensagemErroApi(e, 'Não foi possível carregar seus cartões.')))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const criarCartao = async () => {
    const limite = novo.limite ? parseValorBR(novo.limite) : null;
    setSalvando(true);
    try {
      await api.post('/cartoes', {
        nome: novo.nome.trim(),
        bandeira: novo.bandeira.trim() || null,
        limiteTotal: limite && limite > 0 ? limite : null,
        diaFechamento: Number(novo.diaFechamento),
        diaVencimento: Number(novo.diaVencimento),
      });
      setDialogNovo(false);
      setNovo({ nome: '', bandeira: '', limite: '', diaFechamento: '', diaVencimento: '' });
      setErro('');
      carregar();
    } catch (e) {
      setErro(extrairMensagemErroApi(e, 'Não foi possível criar o cartão.'));
    } finally {
      setSalvando(false);
    }
  };

  const lancarCompra = async () => {
    const valor = parseValorBR(compra.valor);
    if (!Number.isFinite(valor) || valor <= 0) {
      setErro('Informe um valor de compra maior que zero.');
      return;
    }
    setSalvando(true);
    try {
      await api.post('/cartoes/compra', {
        cartaoId: dialogCompra.id,
        descricao: compra.descricao.trim() || 'Compra no cartão',
        valor,
        categoria: compra.categoria.trim() || null,
        parcelas: Number(compra.parcelas) || 1,
      });
      setDialogCompra(null);
      setCompra({ descricao: '', valor: '', categoria: '', parcelas: '1' });
      setErro('');
      carregar();
    } catch (e) {
      setErro(extrairMensagemErroApi(e, 'Não foi possível lançar a compra.'));
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (id) => {
    try {
      await api.delete(`/cartoes/${id}`);
      carregar();
    } catch (e) {
      setErro(extrairMensagemErroApi(e, 'Não foi possível excluir o cartão.'));
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CreditCardIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Cartões de crédito</Typography>
          </Box>
          <Button size="small" startIcon={<AddIcon />} onClick={() => setDialogNovo(true)}>
            Novo cartão
          </Button>
        </Box>

        {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}

        {carregando ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={26} />
          </Box>
        ) : cartoes.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Cadastre seus cartões (apenas um apelido — nunca o número real) para acompanhar
            a fatura aberta e o uso do limite.
          </Typography>
        ) : (
          cartoes.map((c) => (
            <Box key={c.id} sx={{ mb: 2, p: 1.5, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{c.nome}</Typography>
                  {c.bandeira && <Chip size="small" variant="outlined" label={c.bandeira} />}
                </Box>
                <Box>
                  <IconButton size="small" aria-label={`detalhes da fatura ${c.nome}`} onClick={() => abrirFatura(c)}>
                    <ReceiptLongIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" aria-label="lançar compra" onClick={() => setDialogCompra(c)}>
                    <ShoppingCartIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" aria-label="excluir cartão" onClick={() => excluir(c.id)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary"
                          sx={{ fontFamily: theme.typography.fontFamilyMono }}>
                Fatura aberta: {formatBRL(c.faturaAberta)}
                {c.limiteTotal != null && ` de ${formatBRL(c.limiteTotal)}`}
              </Typography>
              {c.percentualLimite != null && (
                <LinearProgress variant="determinate"
                                value={Math.min(100, Number(c.percentualLimite))}
                                color={Number(c.percentualLimite) >= 80 ? 'error' : 'primary'}
                                sx={{ height: 6, borderRadius: 3, mt: 0.5 }} />
              )}
              <Typography variant="caption" color="text.secondary" component="div">
                Fecha dia {c.diaFechamento} · vence dia {c.diaVencimento}
              </Typography>
            </Box>
          ))
        )}
      </CardContent>

      {/* Dialog: novo cartão */}
      <Dialog open={dialogNovo} onClose={() => setDialogNovo(false)} fullWidth maxWidth="xs">
        <DialogTitle>Novo cartão</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Use apenas um apelido (ex.: "Nubank Roxinho"). Nunca digite o número real do cartão —
            nenhum dado sensível é armazenado.
          </Alert>
          <TextField fullWidth margin="dense" label="Apelido do cartão"
                     value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} />
          <TextField fullWidth margin="dense" label="Bandeira (opcional)"
                     value={novo.bandeira} onChange={(e) => setNovo({ ...novo, bandeira: e.target.value })} />
          <TextField fullWidth margin="dense" label="Limite (opcional, R$)"
                     inputProps={{ inputMode: 'decimal' }}
                     value={novo.limite} onChange={(e) => setNovo({ ...novo, limite: e.target.value })} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField margin="dense" label="Dia fechamento" type="number"
                       inputProps={{ min: 1, max: 28 }}
                       value={novo.diaFechamento} onChange={(e) => setNovo({ ...novo, diaFechamento: e.target.value })} />
            <TextField margin="dense" label="Dia vencimento" type="number"
                       inputProps={{ min: 1, max: 28 }}
                       value={novo.diaVencimento} onChange={(e) => setNovo({ ...novo, diaVencimento: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogNovo(false)}>Cancelar</Button>
          <Button variant="contained" disabled={salvando} onClick={criarCartao}>Criar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: detalhes da fatura — por categoria, assinaturas e parcelamentos (ADR-040) */}
      <Dialog open={Boolean(dialogFatura)} onClose={() => setDialogFatura(null)} fullWidth maxWidth="sm">
        <DialogTitle>Fatura {dialogFatura ? `— ${dialogFatura.nome}` : ''}</DialogTitle>
        <DialogContent>
          {carregandoFatura ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={26} />
            </Box>
          ) : fatura && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Ciclo {fatura.inicioCiclo} a {fatura.fechamento} · vence em {fatura.vencimento}
              </Typography>
              <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamilyMono, mb: 2 }}>
                {formatBRL(fatura.total)}
              </Typography>

              {fatura.porCategoria?.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Por categoria</Typography>
                  {fatura.porCategoria.map((cat) => (
                    <Box key={cat.categoria} data-testid={`fatura-cat-${cat.categoria}`}
                         sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{cat.categoria}</Typography>
                      <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamilyMono }}>
                        {formatBRL(cat.total)}
                      </Typography>
                    </Box>
                  ))}
                </>
              )}

              {assinaturas?.recorrencias?.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>
                    Assinaturas neste cartão
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    {assinaturas.recorrencias.map((r) => (
                      <Chip key={r.nome} size="small" variant="outlined"
                            label={`${r.nome} · ${formatBRL(r.valorMedio)}`} />
                    ))}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Comprometimento mensal estimado: {formatBRL(assinaturas.totalMensalComprometido)}
                  </Typography>
                </>
              )}

              {fatura.itens?.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2, mb: 1 }}>Lançamentos</Typography>
                  {fatura.itens.map((item) => (
                    <Box key={item.transacaoId}
                         sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ flexGrow: 1 }} noWrap>
                        {item.descricao}
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamilyMono, mx: 1 }}>
                        {formatBRL(item.valor)}
                      </Typography>
                      {item.parcelada && item.parcelamentoId && (
                        <IconButton size="small"
                                    aria-label={`excluir parcelamento de ${item.descricao}`}
                                    title="Excluir TODAS as parcelas deste parcelamento"
                                    onClick={() => {
                                      if (window.confirm('Excluir TODAS as parcelas deste parcelamento?')) {
                                        excluirParcelamento(item.parcelamentoId);
                                      }
                                    }}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogFatura(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: lançar compra */}
      <Dialog open={Boolean(dialogCompra)} onClose={() => setDialogCompra(null)} fullWidth maxWidth="xs">
        <DialogTitle>Lançar compra {dialogCompra ? `— ${dialogCompra.nome}` : ''}</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="dense" label="Descrição"
                     value={compra.descricao} onChange={(e) => setCompra({ ...compra, descricao: e.target.value })} />
          <TextField fullWidth margin="dense" label="Valor total (R$)"
                     inputProps={{ inputMode: 'decimal' }}
                     value={compra.valor} onChange={(e) => setCompra({ ...compra, valor: e.target.value })} />
          <TextField fullWidth margin="dense" label="Categoria (opcional)"
                     value={compra.categoria} onChange={(e) => setCompra({ ...compra, categoria: e.target.value })} />
          <TextField fullWidth margin="dense" label="Parcelas" select
                     value={compra.parcelas} onChange={(e) => setCompra({ ...compra, parcelas: e.target.value })}>
            {[1, 2, 3, 4, 5, 6, 10, 12, 18, 24].map((n) => (
              <MenuItem key={n} value={String(n)}>{n}×</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogCompra(null)}>Cancelar</Button>
          <Button variant="contained" disabled={salvando} onClick={lancarCompra}>Lançar</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default CartoesCard;
