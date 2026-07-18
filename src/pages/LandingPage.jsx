import React, { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Chip, Container, Divider, Grid, Link, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CreditCardOffOutlinedIcon from '@mui/icons-material/CreditCardOffOutlined';

/**
 * Landing page pública (ADR-039 — Lote F): porta de entrada para visitantes.
 * Estrutura segue o padrão de conversão de SaaS: headline curta orientada a
 * resultado, UM CTA primário (cadastro — time-to-value imediato), prova visual
 * do produto (placeholder até termos screenshot/vídeo reais), features como
 * benefícios, faixa de segurança/LGPD e CTA final. 100% estática: nenhuma
 * chamada de API, nenhum dado do usuário.
 */

const FEATURES = [
    {
        icon: SmartToyOutlinedIcon,
        titulo: 'Assistente com IA',
        texto: 'Registre gastos e consulte investimentos conversando: "gastei R$ 50 no mercado" vira lançamento na hora.',
    },
    {
        icon: AccountBalanceWalletOutlinedIcon,
        titulo: 'Orçamento inteligente',
        texto: 'Limites por categoria com projeção de estouro, calendário de gastos, cartões virtuais e assinaturas detectadas automaticamente.',
    },
    {
        icon: ShowChartIcon,
        titulo: 'Investimentos e risco',
        texto: 'Carteira consolidada, estratégia por setores, correlação, fronteira eficiente e preço-teto por Bazin e Graham.',
    },
    {
        icon: ReceiptLongOutlinedIcon,
        titulo: 'IR da bolsa sem susto',
        texto: 'Apuração mensal com isenção de R$ 20 mil, compensação de prejuízos e DARF pronto com vencimento.',
    },
    {
        icon: QrCodeScannerIcon,
        titulo: 'Scanner de notas fiscais',
        texto: 'Aponte para o QR Code da NF-e e os itens entram categorizados no seu orçamento.',
    },
    {
        icon: GroupOutlinedIcon,
        titulo: 'Orçamento a dois',
        texto: 'Compartilhe as finanças com quem divide a vida com você — visão unificada, contas separadas.',
    },
];

const PASSOS = [
    { n: '1', titulo: 'Crie sua conta grátis', texto: 'Sem cartão de crédito, sem burocracia.' },
    { n: '2', titulo: 'Conecte sua rotina', texto: 'Lance pelo chat, importe extratos ou escaneie notas.' },
    { n: '3', titulo: 'Decida com clareza', texto: 'Dashboards, alertas e análises trabalham por você.' },
];

/** Placeholder de mídia (imagem/vídeo entram depois — espaço já reservado). */
const MediaPlaceholder = ({ label, icon: Icon, testid }) => {
    const theme = useTheme();
    return (
        <Box
            data-testid={testid}
            role="img"
            aria-label={label}
            sx={{
                width: '100%',
                aspectRatio: '16 / 9',
                borderRadius: '16px',
                border: `1px dashed ${theme.palette.divider}`,
                background: 'linear-gradient(135deg, rgba(124,106,247,0.12) 0%, rgba(124,106,247,0.03) 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
            }}
        >
            <Icon sx={{ fontSize: 56, color: '#7C6AF7', opacity: 0.8 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{label}</Typography>
        </Box>
    );
};

const LandingPage = () => {
    const theme = useTheme();

    useEffect(() => {
        document.title = 'FortunAI — Assistente financeiro com IA';
        return () => { document.title = 'FortunAI'; };
    }, []);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
            {/* Barra superior */}
            <Container maxWidth="lg">
                <Box component="header" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2.5 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#7C6AF7', letterSpacing: '-0.5px' }}>
                        FortunAI
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button component={RouterLink} to="/login" variant="text" data-testid="landing-btn-entrar">
                            Entrar
                        </Button>
                        <Button component={RouterLink} to="/registrar" variant="contained" data-testid="landing-btn-criar-conta">
                            Criar conta grátis
                        </Button>
                    </Box>
                </Box>
            </Container>

            {/* Hero */}
            <Container maxWidth="lg" component="main">
                <Grid container spacing={6} alignItems="center" sx={{ py: { xs: 6, md: 10 } }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Chip
                            label="Orçamento + investimentos + IA em um só lugar"
                            size="small"
                            sx={{ mb: 2, bgcolor: 'rgba(124,106,247,0.15)', color: '#A99DF9', fontWeight: 600 }}
                        />
                        <Typography component="h1" variant="h3" fontWeight={800} sx={{ letterSpacing: '-1px', mb: 2 }}>
                            Suas finanças, guiadas por inteligência artificial
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, mb: 3 }}>
                            Controle gastos, acompanhe investimentos e apure seu IR da bolsa —
                            conversando com um assistente que entende você.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                            <Button component={RouterLink} to="/registrar" variant="contained" size="large"
                                data-testid="landing-cta-hero">
                                Começar grátis
                            </Button>
                            <Button component={RouterLink} to="/login" variant="outlined" size="large">
                                Já tenho conta
                            </Button>
                        </Box>
                        <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: 'text.secondary' }}>
                            Grátis para começar • Sem cartão de crédito
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <MediaPlaceholder
                            label="Prévia do dashboard (imagem em breve)"
                            icon={ShowChartIcon}
                            testid="landing-placeholder-screenshot"
                        />
                    </Grid>
                </Grid>

                {/* Features */}
                <Box component="section" aria-labelledby="landing-features-titulo" sx={{ py: { xs: 4, md: 6 } }}>
                    <Typography id="landing-features-titulo" component="h2" variant="h4" fontWeight={700}
                        sx={{ textAlign: 'center', mb: 1 }}>
                        Tudo o que os apps de finanças fazem. E o que eles não fazem.
                    </Typography>
                    <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 5 }}>
                        Do lançamento por chat à fronteira eficiente de Markowitz.
                    </Typography>
                    <Grid container spacing={3}>
                        {FEATURES.map((f) => (
                            <Grid key={f.titulo} size={{ xs: 12, sm: 6, md: 4 }}>
                                <Paper data-testid="landing-feature-card" sx={{
                                    p: 3, height: '100%', borderRadius: '16px',
                                    border: `1px solid ${theme.palette.divider}`, boxShadow: 'none',
                                }}>
                                    <f.icon sx={{ color: '#7C6AF7', fontSize: 32, mb: 1.5 }} />
                                    <Typography component="h3" variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                                        {f.titulo}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {f.texto}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Como funciona + vídeo */}
                <Box component="section" aria-labelledby="landing-passos-titulo" sx={{ py: { xs: 4, md: 6 } }}>
                    <Typography id="landing-passos-titulo" component="h2" variant="h4" fontWeight={700}
                        sx={{ textAlign: 'center', mb: 5 }}>
                        Como funciona
                    </Typography>
                    <Grid container spacing={4} sx={{ mb: 5 }}>
                        {PASSOS.map((p) => (
                            <Grid key={p.n} size={{ xs: 12, md: 4 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Box sx={{
                                        width: 44, height: 44, borderRadius: '50%', mx: 'auto', mb: 1.5,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        bgcolor: 'rgba(124,106,247,0.15)', color: '#7C6AF7', fontWeight: 800,
                                    }}>
                                        {p.n}
                                    </Box>
                                    <Typography component="h3" variant="subtitle1" fontWeight={700}>{p.titulo}</Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{p.texto}</Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                    <Container maxWidth="md" disableGutters>
                        <MediaPlaceholder
                            label="Vídeo de demonstração (em breve)"
                            icon={PlayCircleOutlineIcon}
                            testid="landing-placeholder-video"
                        />
                    </Container>
                </Box>

                {/* Segurança */}
                <Box component="section" aria-labelledby="landing-seguranca-titulo" sx={{ py: { xs: 4, md: 6 } }}>
                    <Paper sx={{
                        p: { xs: 3, md: 4 }, borderRadius: '16px', boxShadow: 'none',
                        border: `1px solid ${theme.palette.divider}`,
                    }}>
                        <Typography id="landing-seguranca-titulo" component="h2" variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                            Segurança e privacidade por padrão
                        </Typography>
                        <Grid container spacing={3}>
                            {[
                                { icon: ShieldOutlinedIcon, texto: 'LGPD de ponta a ponta: consentimento explícito e exclusão total da conta quando você quiser.' },
                                { icon: LockOutlinedIcon, texto: 'Senha criptografada (bcrypt) e sessão com tokens rotativos de curta duração.' },
                                { icon: CreditCardOffOutlinedIcon, texto: 'Nunca pedimos os dados reais do seu cartão — os cartões do orçamento são 100% virtuais.' },
                            ].map((s, i) => (
                                <Grid key={i} size={{ xs: 12, md: 4 }}>
                                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                        <s.icon sx={{ color: '#7C6AF7' }} />
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{s.texto}</Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Box>

                {/* CTA final */}
                <Box component="section" sx={{ py: { xs: 6, md: 8 }, textAlign: 'center' }}>
                    <Typography component="h2" variant="h4" fontWeight={800} sx={{ mb: 2 }}>
                        Comece a organizar suas finanças hoje
                    </Typography>
                    <Button component={RouterLink} to="/registrar" variant="contained" size="large"
                        data-testid="landing-cta-final">
                        Criar conta grátis
                    </Button>
                </Box>
            </Container>

            {/* Footer */}
            <Divider />
            <Container maxWidth="lg">
                <Box component="footer" sx={{
                    py: 3, display: 'flex', flexWrap: 'wrap', gap: 2,
                    alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        © 2026 FortunAI — Assistente Financeiro
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                        <Link component={RouterLink} to="/termos" variant="body2" underline="hover" color="text.secondary">
                            Termos de Uso
                        </Link>
                        <Link component={RouterLink} to="/privacidade" variant="body2" underline="hover" color="text.secondary">
                            Política de Privacidade
                        </Link>
                        <Link component={RouterLink} to="/status" variant="body2" underline="hover" color="text.secondary">
                            Status
                        </Link>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default LandingPage;
