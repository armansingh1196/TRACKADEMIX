import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authLogout } from '../redux/userRelated/userSlice';
import styled, { keyframes } from 'styled-components';
import { Box, Typography, Avatar } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
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
        <LogoutPage>
            <LogoutCard>
                <IconWrapper>
                    <ExitToAppIcon sx={{ fontSize: 40, color: 'var(--primary)' }} />
                </IconWrapper>
                
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <StyledAvatar sx={{ background: 'var(--gradient-primary)', mx: 'auto', mb: 2 }}>
                        {String(currentUser?.name).charAt(0)}
                    </StyledAvatar>
                    <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'Outfit', color: 'white' }}>
                        {currentUser?.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)', mt: 0.5 }}>
                        Are you sure you want to end your session?
                    </Typography>
                </Box>

                <ActionStack>
                    <AppButton 
                        variant="contained" 
                        fullWidth 
                        onClick={handleLogout}
                        sx={{ 
                            py: 1.5, 
                            background: 'var(--gradient-vibrant) !important',
                            fontWeight: 800,
                            boxShadow: '0 8px 24px rgba(255, 128, 102, 0.2)'
                        }}
                    >
                        Sign Out
                    </AppButton>
                    <AppButton 
                        variant="text" 
                        fullWidth 
                        onClick={handleCancel}
                        sx={{ color: 'var(--text-muted)', fontWeight: 700 }}
                    >
                        Keep Browsing
                    </AppButton>
                </ActionStack>
            </LogoutCard>
        </LogoutPage>
    );
};

export default Logout;

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const LogoutPage = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-main);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
`;

const LogoutCard = styled.div`
  background: rgba(176, 168, 185, 0.03);
  backdrop-filter: blur(24px);
  padding: 48px;
  border-radius: 40px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 420px;
  animation: ${fadeIn} 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(132, 94, 194, 0.1);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  border: 1px solid rgba(132, 94, 194, 0.2);
`;

const StyledAvatar = styled(Avatar)`
  width: 64px;
  height: 64px;
  border: 3px solid var(--bg-surface);
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  font-weight: 800;
  font-family: 'Outfit';
`;

const ActionStack = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
`;
