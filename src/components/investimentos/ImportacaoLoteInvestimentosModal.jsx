import React, { useMemo, useState, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, CircularProgress, Alert, Chip,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  Checkbox, Paper, useTheme, TextField,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { formatBRL } from '../ui';
import { useImportacaoLoteInvestimentos } from '../../hooks/useImportacaoLoteInvestimentos';

const LABEL_OPERACAO = {
  COMPRA: 'Compra',
  VENDA: 'Venda',
  DESDOBRAMENTO: 'Desdobramento',
  GRUPAMENTO: 'Grupamento',
};

const LABEL_FATOR = {
  DESDOBRAMENTO: 'Proporção do desdobramento (ex: 2 para 1:2)',
  GRUPAMENTO: 'Proporção do grupamento (ex: 0.1 para 10:1)',
};

// Ticker normalizado só para comparação — mesmo critério do backend
// (normalizarTickerParaComparacao em ImportacaoLoteInvestimentoService).
const normalizarTicker = (ticker) => {
  if (!ticker) return '';
  const normalizado = ticker.toUpperCase().trim();
  return normalizado.endsWith('.SA') ? normalizado.slice(0, -3) : normalizado;
};

// Desempate cronológico (data, depois linha do CSV) — mesmo critério do FIX de
// ordenação no backend (compararCronologicamente).
const depoisDe = (dataItem, linhaItem, dataEvento, linhaEvento) => {
  if (dataItem !== dataEvento) return dataItem > dataEvento;
  return linhaItem > linhaEvento;
};

// Um evento corporativo só exige fator quando há uma VENDA do MESMO ticker
// depois dele no lote (ADR-052, adendo) — os demais permanecem informativos.
const eventoPrecisaFator = (evento, prontos) => (prontos ?? []).some((item) => (
  item.operacao === 'VENDA'
  && normalizarTicker(item.ticker) === normalizarTicker(evento.ticker)
  && depoisDe(item.data, item.linha, evento.data, evento.linha)
));

const fatorValido = (valor) => {
  if (valor === undefined || valor === null || valor === '') return false;
  const numero = Number(valor);
  return !Number.isNaN(numero) && numero > 0;
};

/**
 * Modal de importação em lote de posições de investimento via CSV (formato
 * Investidor10) — fluxo preview → confirmar (ADR-052), espelhando
 * `ImportacaoExtratoModal` (ADR-010). Diferenças do fluxo de extrato:
 *
 * - O backend segrega o CSV em três grupos independentes: `prontos` (Compra/
 *   Venda válidas), `eventosCorporativos` (Desdobramento/Grupamento — nunca
 *   persistidos automaticamente, apenas informativos) e `erros` (linhas
 *   malformadas, uma linha ruim não aborta o arquivo).
 * - Cada item de `prontos` já carrega o `previewId` emitido pelo servidor
 *   (vínculo SEC-14) — o usuário pode desmarcar itens individualmente antes
 *   de confirmar (o registro no backend aceita qualquer SUBCONJUNTO do que
 *   foi registrado, nunca um superconjunto ou item alterado).
 */
const ImportacaoLoteInvestimentosModal = ({ open, onClose, onImportado }) => {
  const theme = useTheme();
  const mono = theme.typography.fontFamilyMono;
  const {
    preview, loading, confirming, error, resultado,
    analisarArquivo, confirmarImportacao, resetar,
  } = useImportacaoLoteInvestimentos();

  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [selecionados, setSelecionados] = useState({});
  const [fatores, setFatores] = useState({});
  const fileInputRef = useRef(null);

  const handleClose = () => {
    const importouComSucesso = !!resultado;
    setFile(null);
    setDragOver(false);
    setSelecionados({});
    setFatores({});
    resetar();
    onClose();
    if (importouComSucesso) onImportado?.();
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) return;
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const handleAnalisar = async () => {
    if (!file) return;
    await analisarArquivo(file);
  };

  const marcarTodosProntos = (preview?.prontos ?? []).length > 0
    && (preview?.prontos ?? []).every((_item, i) => selecionados[i] !== false);

  useMemo(() => {
    // Ao chegar um novo preview, todos os itens prontos começam selecionados
    // e os fatores de evento corporativo são limpos.
    if (preview?.prontos) {
      setSelecionados(Object.fromEntries(preview.prontos.map((_item, i) => [i, true])));
      setFatores({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview]);

  const itensSelecionados = (preview?.prontos ?? []).filter((_item, i) => selecionados[i] !== false);

  const eventosComStatus = (preview?.eventosCorporativos ?? []).map((evento) => ({
    ...evento,
    precisaFator: eventoPrecisaFator(evento, preview?.prontos),
  }));

  const eventosPendentesDeFator = eventosComStatus.filter(
    (evento) => evento.precisaFator && !fatorValido(fatores[evento.linha]),
  );

  const handleConfirmar = () => {
    if (itensSelecionados.length === 0 || eventosPendentesDeFator.length > 0) return;
    const eventosCorporativos = eventosComStatus
      .filter((evento) => evento.precisaFator)
      .map((evento) => ({
        linha: evento.linha,
        ticker: evento.ticker,
        operacao: evento.operacao,
        data: evento.data,
        fator: Number(fatores[evento.linha]),
      }));
    confirmarImportacao(itensSelecionados, eventosCorporativos);
  };

  const toggleItem = (i) => {
    setSelecionados((prev) => ({ ...prev, [i]: prev[i] === false }));
  };

  const toggleTodos = () => {
    const novoValor = !marcarTodosProntos;
    setSelecionados(Object.fromEntries((preview?.prontos ?? []).map((_item, i) => [i, novoValor])));
  };

  const handleFatorChange = (linha, valor) => {
    setFatores((prev) => ({ ...prev, [linha]: valor }));
  };

  // STEP 3: Sucesso
  if (resultado) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Importação Concluída</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6">
              {resultado.totalImportadas} operações importadas com sucesso!
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleClose} data-testid="btn-fechar-sucesso">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // STEP 2: Preview
  if (preview) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Preview da Importação</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip label={`${preview.totalLinhas} linhas encontradas`} color="primary" />
            <Chip label={`${preview.prontos.length} prontas para importar`} color="success" />
            <Chip
              label={`${preview.eventosCorporativos.length} eventos corporativos (revisão manual)`}
              color={preview.eventosCorporativos.length > 0 ? 'warning' : 'default'}
            />
            <Chip
              label={`${preview.erros.length} com erro`}
              color={preview.erros.length > 0 ? 'error' : 'default'}
            />
          </Box>

          {preview.prontos.length > 0 && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Checkbox
                  checked={marcarTodosProntos}
                  onChange={toggleTodos}
                  data-testid="checkbox-selecionar-todos"
                />
                <Typography variant="body2">Selecionar todas as operações prontas</Typography>
              </Box>
              <TableContainer component={Paper} sx={{ maxHeight: 320, mb: 2 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" />
                      <TableCell>Ticker</TableCell>
                      <TableCell>Operação</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell align="right">Quantidade</TableCell>
                      <TableCell align="right">Preço Unit.</TableCell>
                      <TableCell align="right">Valor Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {preview.prontos.map((item, i) => (
                      <TableRow key={`${item.linha}-${item.ticker}`}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selecionados[i] !== false}
                            onChange={() => toggleItem(i)}
                            data-testid={`checkbox-item-${i}`}
                          />
                        </TableCell>
                        <TableCell>{item.ticker}</TableCell>
                        <TableCell>
                          <Chip
                            label={LABEL_OPERACAO[item.operacao] ?? item.operacao}
                            size="small"
                            color={item.operacao === 'VENDA' ? 'error' : 'success'}
                          />
                        </TableCell>
                        <TableCell>{item.data}</TableCell>
                        <TableCell align="right" sx={{ fontFamily: mono }}>{item.quantidade}</TableCell>
                        <TableCell align="right" sx={{ fontFamily: mono }}>{formatBRL(item.precoUnitario)}</TableCell>
                        <TableCell align="right" sx={{ fontFamily: mono }}>{formatBRL(item.valorTotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {preview.eventosCorporativos.length > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {preview.eventosCorporativos.length} evento(s) corporativo(s) (desdobramento/grupamento)
                não são importados automaticamente — ajuste a quantidade manualmente após a importação:
              </Typography>
              {eventosComStatus.map((item) => (
                <Box key={`${item.linha}-${item.ticker}`} sx={{ mb: item.precisaFator ? 1.5 : 0.5 }}>
                  <Typography variant="caption" component="div">
                    Linha {item.linha}: {item.ticker} — {LABEL_OPERACAO[item.operacao] ?? item.operacao} em {item.data}
                  </Typography>
                  {item.precisaFator && (
                    <Box sx={{ mt: 0.5 }}>
                      <TextField
                        size="small"
                        type="number"
                        label={LABEL_FATOR[item.operacao] ?? 'Fator de ajuste'}
                        value={fatores[item.linha] ?? ''}
                        onChange={(e) => handleFatorChange(item.linha, e.target.value)}
                        error={!fatorValido(fatores[item.linha])}
                        helperText={
                          fatorValido(fatores[item.linha])
                            ? ' '
                            : `Obrigatório: há venda de ${item.ticker} neste lote após este evento.`
                        }
                        required
                        inputProps={{ step: 'any' }}
                        data-testid={`input-fator-evento-${item.linha}`}
                        sx={{ width: 340 }}
                      />
                    </Box>
                  )}
                </Box>
              ))}
            </Alert>
          )}

          {preview.erros.length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {preview.erros.length} linha(s) com erro (não importadas):
              </Typography>
              {preview.erros.map((item) => (
                <Typography key={item.linha} variant="caption" component="div">
                  Linha {item.linha}: {item.erro}
                </Typography>
              ))}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleConfirmar}
            disabled={confirming || itensSelecionados.length === 0 || eventosPendentesDeFator.length > 0}
            data-testid="btn-confirmar-importacao"
          >
            {confirming ? 'Importando...' : `Importar ${itensSelecionados.length} operações`}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // STEP 1: Upload
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Importar Investimentos (CSV)</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>Analisando arquivo...</Typography>
          </Box>
        ) : (
          <Box
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: '2px dashed',
              borderColor: dragOver ? 'primary.main' : 'divider',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: dragOver ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              hidden
              data-testid="file-input"
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />
            <UploadFileIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1">
              {file ? file.name : 'Arraste um arquivo CSV de investimentos aqui'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ou clique para selecionar (formato Investidor10)
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleAnalisar}
          disabled={!file || loading}
          data-testid="btn-analisar"
        >
          Analisar Arquivo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportacaoLoteInvestimentosModal;
