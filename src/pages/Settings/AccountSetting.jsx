import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Slide, Typography } from '@mui/material';

const AccountSetting = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);

  const handleDeleteClick = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmDelete = () => {
    // Add logic to delete account here
    console.log('Account deletion confirmed');
    setOpenDialog(false);
    // After successful deletion, you might want to redirect to login page
    // navigate('/login');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center p-4 bg-white shadow-sm">
        <button 
          onClick={() => navigate("/home")} 
          className="p-1 rounded-lg cursor-pointer active:scale-95 transition-transform duration-200"
        >
          <ArrowBackIosIcon className="text-xl" />
        </button>
        <h1 className="text-xl font-medium mx-auto pr-8">Account Settings</h1>
      </div>

      {/* Account Settings Options */}
      <div className="mt-4">
        {/* Delete Account Section */}
        <div className="bg-white border-t border-b border-gray-200">
          {/* Delete Account Option */}
          <div 
            className="flex items-center justify-between px-6 py-5 cursor-pointer"
            onClick={handleDeleteClick}
          >
            <div className="flex items-center">
              <DeleteOutlineIcon className="text-red-500 mr-3" />
              <span className="text-base font-medium text-black">Delete Account</span>
            </div>
            <span className="text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
          
          {/* Warning Alert */}
          <div className="mx-6 mb-5 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <WarningAmberIcon className="text-red-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">Warning</p>
                <p className="text-xs text-red-600 mt-1">
                  Deleting your account will permanently remove all your data, including order history, 
                  saved addresses, and payment methods. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: {
            borderRadius: '8px',
            padding: '16px',
            maxWidth: '400px',
            width: '90%',
          },
        }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: "up" }}
      >
        <DialogTitle 
          id="alert-dialog-title" 
          className="text-center pt-6 pb-2"
          sx={{ 
            fontWeight: 600,
            fontSize: '1.25rem',
            color: '#1A1A1A'
          }}
        >
          <DeleteOutlineIcon 
            sx={{ 
              color: '#FF3B30', 
              fontSize: '3rem',
              display: 'block',
              margin: '0 auto 16px',
              padding: '12px',
              backgroundColor: '#FFEEEE',
              borderRadius: '50%'
            }} 
          />
          Delete Account?
        </DialogTitle>
        <DialogContent sx={{ padding: '16px 24px' }}>
          <DialogContentText 
            id="alert-dialog-description"
            sx={{ 
              textAlign: 'center',
              color: '#666666',
              fontSize: '0.875rem',
              lineHeight: 1.6
            }}
          >
            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed, including:
          </DialogContentText>
          <ul className="mt-3 text-left list-disc pl-5 text-[#666666] text-sm">
            <li className="mb-1">Order history</li>
            <li className="mb-1">Saved favorites</li>
            <li className="mb-1">Personal information</li>
            <li>Payment methods</li>
          </ul>
        </DialogContent>
        <DialogActions sx={{ padding: '8px 16px 16px', display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, justifyContent: 'center', gap: '12px' }}>
          <Button 
            onClick={handleCloseDialog} 
            variant="outlined"
            fullWidth
            sx={{ 
              borderRadius: '8px', 
              textTransform: 'none',
              padding: '8px 16px',
              fontWeight: 500,
              fontSize: '0.875rem',
              borderColor: '#5046E5',
              color: '#5046E5',
              '&:hover': {
                borderColor: '#3832A0',
                backgroundColor: 'rgba(80, 70, 229, 0.04)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained"
            fullWidth
            sx={{ 
              borderRadius: '8px', 
              textTransform: 'none',
              padding: '8px 16px',
              fontWeight: 500,
              fontSize: '0.875rem',
              backgroundColor: '#FF3B30',
              '&:hover': {
                backgroundColor: '#E02D22'
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AccountSetting;
