import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authLogout } from '../redux/userRelated/userSlice';
import styled, { keyframes } from 'styled-components';
import { Box, Typography, Avatar, Dialog, DialogContent, Stack } from '@mui/material';
import AppButton from '../components/common/AppButton';

const Logout = () => {
    const currentUser = useSelector(state => state.user.currentUser);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(authLogout());
        navigate('/');
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <Dialog 
            open={true} 
            onClose={handleCancel}
            PaperProps={{
                sx: {
                    background: 'transparent',
                    boxShadow: 'none',
                    maxWidth: '440px',
                    width: '100%',
                    overflow: 'visible',
                    margin: '16px'
                }
            }}
            BackdropProps={{
                sx: {
                    backgroundColor: 'rgba(10, 9, 12, 0.95)',
                    backdropFilter: 'blur(20px)'
                }
            }}
        >
            <DialogContent sx={{ p: 0, overflow: 'visible' }}>
                <LogoutCard>
                    <AvatarGlow>
                        <StyledAvatar sx={{ background: 'var(--gradient-vibrant)' }}>
                            {String(currentUser?.name).charAt(0)}
                        </StyledAvatar>
                    </AvatarGlow>
                    
                    <Box sx={{ mb: 5, textAlign: 'center', zIndex: 1 }}>
                        <Typography variant="h4" sx={{ 
                            fontWeight: 900, 
                            fontFamily: 'Outfit', 
                            color: 'white',
                            mb: 1.5,
                            letterSpacing: '-0.5px'
                        }}>
                            Sign Out?
                        </Typography>
                        <Typography variant="body1" sx={{ 
                            color: 'rgba(255,255,255,0.6)', 
                            maxWidth: '280px',
                            mx: 'auto',
                            lineHeight: 1.6,
                            fontWeight: 500
                        }}>
                            Hey <span style={{ color: 'var(--primary-light)' }}>{currentUser?.name}</span>, are you sure you want to end your session?
                        </Typography>
                    </Box>

                    <ActionStack>
                        <AppButton 
                            variant="contained" 
                            fullWidth 
                            onClick={handleLogout}
                            sx={{ 
                                py: 2, 
                                background: 'var(--gradient-vibrant) !important',
                                fontWeight: 800,
                                fontSize: '1rem',
                                borderRadius: '18px',
                                boxShadow: '0 12px 30px rgba(255, 128, 102, 0.3)'
                            }}
                        >
                            Sign Out Securely
                        </AppButton>
                        <AppButton 
                            variant="text" 
                            fullWidth 
                            onClick={handleCancel}
                            sx={{ 
                                py: 1.5,
                                color: 'rgba(255,255,255,0.4)', 
                                fontWeight: 700,
                                '&:hover': { color: 'white' }
                            }}
                        >
                            Cancel
                        </AppButton>
                    </ActionStack>
                </LogoutCard>
            </DialogContent>
        </Dialog>
    );
};

export default Logout;

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.9) translateY(30px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
`;

const LogoutCard = styled.div`
  background: rgba(30, 28, 36, 0.6);
  backdrop-filter: blur(40px) saturate(180%);
  padding: 60px 40px 40px;
  border-radius: 48px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6);
  animation: ${scaleIn} 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const AvatarGlow = styled.div`
  position: relative;
  margin-bottom: 32px;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120%;
    height: 120%;
    background: var(--gradient-vibrant);
    filter: blur(30px);
    opacity: 0.3;
    z-index: 0;
  }
`;

const StyledAvatar = styled(Avatar)`
  width: 96px;
  height: 96px;
  position: relative;
  z-index: 1;
  border: 4px solid rgba(255,255,255,0.1);
  font-weight: 900;
  font-family: 'Outfit';
  font-size: 2.5rem;
`;

const ActionStack = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 1;
`;


