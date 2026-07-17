import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Button,
    Select, MenuItem, FormControl, InputLabel, Snackbar, Alert,
    CircularProgress, Divider, Skeleton,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import TableChartIcon from '@mui/icons-material/TableChart';
import AdicionarTransacaoForm from '../components/orcamento/AdicionarTransacaoForm';
import GastosPorCategoriaChart from '../components/dashboard/GastosPorCategoriaChart';
import ListaTransacoes from '../components/orcamento/ListaTransacoes';
import ComparativoCard from '../components/orcamento/ComparativoCard';
import AnomaliaAlert from '../components/orcamento/AnomaliaAlert';
import ImportacaoExtratoModal from '../components/orcamento/ImportacaoExtratoModal';
import NfceScannerModal from '../components/orcamento/NfceScannerModal';
import RecorrenciasCard from '../components/orcamento/RecorrenciasCard';
import OrcamentoLimitesCard from '../components/orcamento/OrcamentoLimitesCard';
import CartoesCard from '../components/orcamento/CartoesCard';
import CalendarioGastosCard from '../components/orcamento/CalendarioGastosCard';
import EntradasSaidasChart from '../components/orcamento/EntradasSaidasChart';
import { useExportacao } from '../hooks/useExportacao';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MESES = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },   { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },   { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro'},  { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro'},  { value: 12, label: 'Dezembro' },
];

const anoAtual = new Date().getFullYear();
const ANOS = [anoAtual - 2, anoAtual - 1, anoAtual, anoAtual + 1];

const Orcamento = () => {
    const { user } = useAuth();
    const [pageLoading, setPageLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [extratoModalOpen, setExtratoModalOpen] = useState(false);
    const [nfceOpen, setNfceOpen] = useState(false);
    const now = new Date();
    const [mesSelecionado, setMesSelecionado] = useState(now.getMonth() + 1);
    const [anoSelecionado, setAnoSelecionado] = useState(now.getFullYear());
    const { loading: exportLoading, error: exportError, downloadArquivo, clearError } = useExportacao();
    const [recorrencias, setRecorrencias] = useState([]);
    const [totalMensalComprometido, setTotalMensalComprometido] = useState(0);
    const [loadingRecorrencias, setLoadingRecorrencias] = useState(true);

    // Skeleton de inicialização — mostra enquanto as transações iniciais carregam
    useEffect(() => {
        if (!user?.id) { setPageLoading(false); return; }
        api.get(`/orcamento/transacoes/${user.id}`)
            .catch(() => { /* silently ignore — child components handle their own errors */ })
            .finally(() => setPageLoading(false));
    }, [user?.id]);

    // Carrega assinaturas recorrentes detectadas automaticamente
    useEffect(() => {
        if (!user?.id) { setLoadingRecorrencias(false); return; }
        setLoadingRecorrencias(true);
        api.get('/orcamento/recorrencias')
            .then((res) => {
                setRecorrencias(res.data?.recorrencias ?? []);
                setTotalMensalComprometido(res.data?.totalMensalComprometido ?? 0);
            })
            .catch(() => {
                setRecorrencias([]);
                setTotalMensalComprometido(0);
            })
            .finally(() => setLoadingRecorrencias(false));
    }, [user?.id]);

    const handleTransacaoAdicionada = () => {
        setRefreshKey((k) => k + 1);
    };

    const handleTransacaoAlterada = () => {
        setRefreshKey((k) => k + 1);
    };

    const handleExtratoImported = () => {
        setRefreshKey((k) => k + 1);
    };

    if (pageLoading) {
        return (
            <Box sx={{ p: { xs: 1.5, md: 3 } }}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} animation="wave" variant="rectangular" height={48}
                        sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Skeleton animation="wave" variant="circular" width={180} height={180}
                        sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', px: { xs: 1.5, md: 3 }, py: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Painel de Orçamento
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<QrCodeScannerIcon />}
                        onClick={() => setNfceOpen(true)}
                        sx={{ borderColor: 'rgba(255,255,255,0.2)' }}
                    >
                        📄 Escanear NF-e
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<UploadFileIcon />}
                        onClick={() => setExtratoModalOpen(true)}
                    >
                        Importar Extrato
                    </Button>
                </Box>
            </Box>

            <ImportacaoExtratoModal
                open={extratoModalOpen}
                onClose={() => setExtratoModalOpen(false)}
                onImported={handleExtratoImported}
            />

            <NfceScannerModal
                open={nfceOpen}
                onClose={() => setNfceOpen(false)}
                onSuccess={() => {
                    setNfceOpen(false);
                    setRefreshKey((k) => k + 1); // recarrega lista de transações
                }}
            />

            {/* Anomalias detectadas */}
            <AnomaliaAlert />

            {/* Top section: form (left) + chart (right) */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <AdicionarTransacaoForm onTransacaoAdicionada={handleTransacaoAdicionada} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <GastosPorCategoriaChart key={refreshKey} />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Orçamento por categoria (ADR-034) */}
            <OrcamentoLimitesCard />

            {/* Cartões de crédito (ADR-035) */}
            <CartoesCard />

            {/* Entradas × Saídas + Calendário de gastos (ADR-036) */}
            <EntradasSaidasChart />
            <CalendarioGastosCard />

            {/* Comparativo Mensal */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <ComparativoCard />
                </CardContent>
            </Card>

            {/* Assinaturas Recorrentes */}
            <Box sx={{ mb: 3 }}>
                <RecorrenciasCard
                    recorrencias={recorrencias}
                    totalMensalComprometido={totalMensalComprometido}
                    loading={loadingRecorrencias}
                />
            </Box>

            {/* Exportar */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Exportar Relatórios
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <InputLabel>Mês</InputLabel>
                            <Select
                                value={mesSelecionado}
                                label="Mês"
                                onChange={(e) => setMesSelecionado(e.target.value)}
                            >
                                {MESES.map((m) => (
                                    <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 100 }}>
                            <InputLabel>Ano</InputLabel>
                            <Select
                                value={anoSelecionado}
                                label="Ano"
                                onChange={(e) => setAnoSelecionado(e.target.value)}
                            >
                                {ANOS.map((a) => (
                                    <MenuItem key={a} value={a}>{a}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                            variant="outlined"
                            startIcon={exportLoading ? <CircularProgress size={16} /> : <PictureAsPdfIcon />}
                            disabled={exportLoading}
                            onClick={() => downloadArquivo(
                                `/api/exportacao/extrato?mes=${mesSelecionado}&ano=${anoSelecionado}`,
                                `extrato_${String(mesSelecionado).padStart(2,'0')}_${anoSelecionado}.pdf`
                            )}
                            data-testid="btn-extrato-pdf"
                        >
                            Exportar Extrato PDF
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={exportLoading ? <CircularProgress size={16} /> : <PictureAsPdfIcon />}
                            disabled={exportLoading}
                            onClick={() => downloadArquivo(
                                `/api/exportacao/mensal?mes=${mesSelecionado}&ano=${anoSelecionado}`,
                                `resumo_mensal_${String(mesSelecionado).padStart(2,'0')}_${anoSelecionado}.pdf`
                            )}
                            data-testid="btn-mensal-pdf"
                        >
                            Exportar Resumo Mensal PDF
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={exportLoading ? <CircularProgress size={16} /> : <TableChartIcon />}
                            disabled={exportLoading}
                            onClick={() => downloadArquivo(
                                `/api/exportacao/transacoes/csv?mes=${mesSelecionado}&ano=${anoSelecionado}`,
                                `transacoes_${String(mesSelecionado).padStart(2,'0')}_${anoSelecionado}.csv`
                            )}
                            data-testid="btn-transacoes-csv"
                        >
                            Exportar Transações CSV
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Bottom: full-width transactions table */}
            <ListaTransacoes refreshKey={refreshKey} onChanged={handleTransacaoAlterada} />

            <Snackbar
                open={!!exportError}
                autoHideDuration={5000}
                onClose={clearError}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="error" onClose={clearError}>{exportError}</Alert>
            </Snackbar>
        </Box>
    );
};

export default Orcamento;
