"use client"
import React from 'react'
import { Dialog, DialogTitle, DialogContent, IconButton, Box } from '@mui/material'
import { Close } from '@mui/icons-material'

type Props = {
  title: string,
  onClose: () => void,
  onOk: () => void,
  children: React.ReactNode,
  popupVisible: boolean
}

export default function CustomDialog({ title, onClose, onOk, children, popupVisible }: Props) {
  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog 
      open={popupVisible} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 2
      }}>
        <Box component="h2" sx={{ m: 0, fontSize: '1.5rem', fontWeight: 600 }}>
          {title}
        </Box>
        <IconButton 
          onClick={handleClose}
          sx={{ color: 'white' }}
          aria-label="Close dialog"
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, maxHeight: '70vh', overflow: 'auto' }}>
        {children}
      </DialogContent>
    </Dialog>
  )
}
