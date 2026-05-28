import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
} from '@mui/material'
import RepeatIcon from '@mui/icons-material/Repeat'

const FREQUENCIA_LABEL = {
  MENSAL: 'Mensal',
  SEMANAL: 'Semanal',
  ANUAL: 'Anual',
}

const FREQUENCIA_COLOR = {
  MENSAL: 'primary',
  SEMANAL: 'secondary',
  ANUAL: 'success',
}

const formatBRL = (valor) =>
  Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatData = (dataStr) => {
  if (!dataStr) return ''
  return new Date(dataStr + 'T00:00:00').toLocaleDateString('pt-BR')
}

const RecorrenciasCard = ({ recorrencias = [], loading = false }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          Assinaturas Recorrentes
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Gastos recorrentes identificados automaticamente
        </Typography>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && recorrencias.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 4,
              color: 'text.secondary',
            }}
          >
            <RepeatIcon sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
            <Typography variant="body2">
              Nenhuma assinatura detectada ainda
            </Typography>
            <Typography variant="caption" sx={{ mt: 0.5, textAlign: 'center' }}>
              Continue registrando suas transações para detectarmos padrões
            </Typography>
          </Box>
        )}

        {!loading && recorrencias.length > 0 && (
          <List disablePadding>
            {recorrencias.map((rec, idx) => (
              <React.Fragment key={`${rec.nome}-${idx}`}>
                <ListItem
                  alignItems="flex-start"
                  disableGutters
                  secondaryAction={
                    <Chip
                      label={FREQUENCIA_LABEL[rec.frequencia] ?? rec.frequencia}
                      color={FREQUENCIA_COLOR[rec.frequencia] ?? 'default'}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#9c27b0', width: 36, height: 36, fontSize: 16 }}>
                      {rec.nome?.charAt(0)?.toUpperCase() ?? '?'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={rec.nome}
                    secondary={`R$ ${formatBRL(rec.valorMedio)} · Todo dia ${rec.diaRecorrente}`}
                    secondaryTypographyProps={{ component: 'span' }}
                  />
                </ListItem>
                {idx < recorrencias.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  )
}

export default RecorrenciasCard
