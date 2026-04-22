import React, { useState } from 'react';
import { Box, Avatar, Menu, MenuItem, ListItemIcon, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import { Settings, Logout, PersonOutline } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const AccountMenu = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();

    const { currentRole, currentUser } = useSelector(state => state.user);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                <Tooltip title="Account Settings">
                    <IconButton
                        onClick={handleClick}
                        size="small"
                        sx={{ ml: 2, border: '1px solid var(--border)' }}
                        aria-controls={open ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                    >
                        <Avatar sx={{ 
                            width: 32, 
                            height: 32, 
                            background: 'var(--gradient-primary)',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            fontFamily: 'Outfit'
                        }}>
                            {String(currentUser?.name).charAt(0)}
                        </Avatar>
                    </IconButton>
                </Tooltip>
            </Box>
            <StyledMenu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 8px 24px rgba(0,0,0,0.5))',
                        mt: 1.5,
                        bgcolor: 'var(--bg-surface) !important',
                        border: '1px solid var(--border)',
                        borderRadius: '16px',
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'var(--bg-surface)',
                            borderLeft: '1px solid var(--border)',
                            borderTop: '1px solid var(--border)',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'white', fontFamily: 'Outfit' }}>
                        {currentUser?.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                        {currentUser?.email || currentUser?.rollNum}
                    </Typography>
                </Box>
                <Divider sx={{ borderColor: 'var(--border)' }} />
                
                <MenuItem onClick={() => { handleClose(); navigate(`/${currentRole}/profile`); }} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                        <PersonOutline fontSize="small" sx={{ color: 'var(--primary-light)' }} />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>My Profile</Typography>
                </MenuItem>

                <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                        <Settings fontSize="small" sx={{ color: 'var(--text-muted)' }} />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Settings</Typography>
                </MenuItem>

                <Divider sx={{ borderColor: 'var(--border)' }} />

                <MenuItem onClick={() => { handleClose(); navigate('/logout'); }} sx={{ py: 1.5, '&:hover': { color: 'var(--error)' } }}>
                    <ListItemIcon>
                        <Logout fontSize="small" sx={{ color: 'inherit' }} />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Logout</Typography>
                </MenuItem>
            </StyledMenu>
        </>
    );
}

export default AccountMenu

const StyledMenu = styled(Menu)`
  & .MuiMenuItem-root {
    color: var(--text-secondary);
    transition: var(--transition);
    margin: 4px 8px;
    border-radius: 8px;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.03);
      color: white;
    }
  }
`;