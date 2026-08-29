import React from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button
} from '@mui/material'

const ConfirmarExclusaoDialog = ({ open, onConfirm, onCancel }) => {
  return (
    <Dialog
      open={!!open}
      onClose={onCancel}
      data-testid="confirmar-exclusao-dialog"
    >
      <DialogTitle>Confirmar exclusão</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="inherit">
          Cancelar
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmarExclusaoDialog
