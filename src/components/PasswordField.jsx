import React, { useState } from 'react';
import { TextField, IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

/**
 * Campo de senha compartilhado entre Login e Registro, com ícone de
 * mostrar/ocultar (olho). Encapsula o toggle de `type` para que nenhuma
 * tela precise duplicar essa lógica — qualquer prop de TextField é
 * repassada normalmente (label, value, onChange, sx, slotProps, etc.).
 *
 * Estado 100% local e client-side: nenhuma chamada de rede, nenhuma
 * mudança de contrato com o backend.
 */
const PasswordField = ({ slotProps, ...props }) => {
  const [visivel, setVisivel] = useState(false);

  const alternarVisibilidade = () => setVisivel((atual) => !atual);

  return (
    <TextField
      {...props}
      type={visivel ? 'text' : 'password'}
      slotProps={{
        ...slotProps,
        input: {
          ...slotProps?.input,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={alternarVisibilidade}
                edge="end"
                tabIndex={-1}
                sx={{ color: 'text.secondary' }}
              >
                {visivel ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default PasswordField;
