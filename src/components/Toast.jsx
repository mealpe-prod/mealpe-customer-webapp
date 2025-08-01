import React from 'react';
import { toast } from 'react-hot-toast';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error'; 
import WarningIcon from '@mui/icons-material/Warning';

const Toast = {
  position: {
    'top-left': 'top-left',
    'top-right': 'top-right',
    'top-center': 'top-center', 
    'bottom-left': 'bottom-left',
    'bottom-right': 'bottom-right',
    'bottom-center': 'bottom-center'
  },

  success: (message, position = 'top-center') => {
    toast.success(message, {
      position,
      duration: 4000,
      style: {
        padding: '16px',
        color: '#1b5e20',
        backgroundColor: '#f1f8e9',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '14px',
        fontWeight: 500,
        border: '1px solid #c8e6c9',
        minWidth: '300px'
      },
      icon: <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 22 }} />,
      iconTheme: {
        primary: '#2e7d32',
        secondary: '#fff'
      }
    });
  },

  error: (message, position = 'top-center') => {
    toast.error(message, {
      position, 
      duration: 5000,
      style: {
        padding: '16px',
        color: '#b71c1c',
        backgroundColor: '#ffebee',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '14px',
        fontWeight: 500,
        border: '1px solid #ffcdd2',
        minWidth: '300px'
      },
      icon: <ErrorIcon sx={{ color: '#d32f2f', fontSize: 22 }} />,
      iconTheme: {
        primary: '#d32f2f',
        secondary: '#fff'
      }
    });
  },

  warning: (message, position = 'top-center') => {
    toast(message, {
      position,
      duration: 4500,
      style: {
        padding: '16px',
        color: '#e65100',
        backgroundColor: '#fff3e0',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', 
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '14px',
        fontWeight: 500,
        border: '1px solid #ffe0b2',
        minWidth: '300px'
      },
      icon: <WarningIcon sx={{ color: '#ed6c02', fontSize: 22 }} />,
      iconTheme: {
        primary: '#ed6c02',
        secondary: '#fff'
      }
    });
  }
};

export default Toast;
