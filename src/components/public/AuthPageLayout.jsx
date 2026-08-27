import React from 'react';
import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PublicHeader from './PublicHeader';

const AuthPageLayout = ({ children }) => (
  <Box
    data-testid="auth-page-shell"
    sx={{
      height: '100vh',
      '@supports (height: 100dvh)': { height: '100dvh' },
      bgcolor: 'background.default',
      color: 'text.primary',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}
  >
    <PublicHeader variant="auth" />
    <Box
      component="main"
      sx={{
        position: 'relative',
        flex: 1,
        width: '100%',
        display: 'grid',
        placeItems: 'center',
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 5 },
      }}
    >
      <Box
        aria-hidden
        sx={(theme) => ({
          position: 'absolute',
          top: -180,
          right: -180,
          width: { xs: 360, md: 520 },
          height: { xs: 360, md: 520 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 68%)`,
          pointerEvents: 'none',
        })}
      />
      <Box sx={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>
        {children}
      </Box>
    </Box>
  </Box>
);

export default AuthPageLayout;
