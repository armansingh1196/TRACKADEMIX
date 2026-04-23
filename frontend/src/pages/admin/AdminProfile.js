import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Paper, Box, Avatar, Grid, Divider, Typography } from '@mui/material';
import styled from 'styled-components';
import AppHeader from '../../components/common/AppHeader';
import AppButton from '../../components/common/AppButton';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const AdminProfile = () => {
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);

    return (
        <Container maxWidth="md" sx={{ mt: 2, mb: 4 }}>
            <AppHeader 
                title="Account Settings" 
                subtitle="Manage your institutional profile and personal information." 
            />
            
            <ProfilePaper elevation={0}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4} sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        borderRight: { md: '1px solid var(--border)' },
                        textAlign: 'center'
                    }}>
                        <StyledAvatar sx={{ width: 120, height: 120, mb: 3, background: 'var(--gradient-primary)' }}>
                            <AccountCircleIcon sx={{ fontSize: 80, color: 'white' }} />
                        </StyledAvatar>
                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5, fontFamily: 'Outfit', color: 'white' }}>{currentUser?.name}</Typography>
                        <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                            {currentUser?.role || "Administrator"}
                        </Typography>
                        
                        <Box sx={{ mt: 5, width: '100%', px: 2 }}>
                            <AppButton 
                                variant="contained" 
                                fullWidth 
                                onClick={() => navigate("/Admin/editprofile")}
                                sx={{ 
                                    mb: 2, 
                                    background: 'var(--gradient-vibrant) !important',
                                    boxShadow: '0 8px 20px rgba(132, 94, 194, 0.2)'
                                }}
                            >
                                Edit Profile
                            </AppButton>
                            <AppButton 
                                variant="outlined" 
                                fullWidth 
                                onClick={() => navigate("/Admin/settings")}
                                sx={{ 
                                    color: 'white', 
                                    borderColor: 'var(--border)',
                                    '&:hover': { borderColor: 'var(--primary)' }
                                }}
                            >
                                Security Settings
                            </AppButton>
                        </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={8}>
                        <SectionTitle variant="h6">Institutional Identity</SectionTitle>
                        <InfoGrid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <InfoLabel>Full Name</InfoLabel>
                                <InfoValue>
                                    <PersonOutlineIcon />
                                    {currentUser?.name}
                                </InfoValue>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InfoLabel>Email Address</InfoLabel>
                                <InfoValue>
                                    <MailOutlineIcon />
                                    {currentUser?.email}
                                </InfoValue>
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Divider sx={{ my: 1, borderColor: 'var(--border)' }} />
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <InfoLabel>Department / Institution</InfoLabel>
                                <InfoValue>
                                    <BusinessOutlinedIcon />
                                    {currentUser?.schoolName}
                                </InfoValue>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InfoLabel>Assigned Branch</InfoLabel>
                                <InfoValue>
                                    <BusinessOutlinedIcon />
                                    {currentUser?.branch || "General Admin"}
                                </InfoValue>
                            </Grid>
                        </InfoGrid>

                        <Box sx={{ mt: 6, p: 3, borderRadius: '20px', background: 'rgba(132, 94, 194, 0.03)', border: '1px solid rgba(132, 94, 194, 0.1)' }}>
                            <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                                Account created on: {new Date().toLocaleDateString()} • Your access is protected with institutional-grade encryption.
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </ProfilePaper>
        </Container>
    );
}

export default AdminProfile;

const ProfilePaper = styled(Paper)`
  padding: 48px;
  border-radius: 32px !important;
  border: 1px solid var(--border) !important;
  background: rgba(176, 168, 185, 0.03) !important;
  backdrop-filter: blur(20px);
  box-shadow: var(--shadow-xl) !important;
  animation: fadeIn 0.8s ease-out;
`;

const StyledAvatar = styled(Avatar)`
  box-shadow: 0 12px 32px rgba(132, 94, 194, 0.3);
  border: 4px solid var(--bg-surface);
`;

const SectionTitle = styled(Typography)`
  font-family: 'Outfit', sans-serif !important;
  font-weight: 800 !important;
  color: var(--primary-light) !important;
  margin-bottom: 28px !important;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-size: 0.9rem !important;
`;

const InfoGrid = styled(Grid)`
  padding-top: 8px;
`;

const InfoLabel = styled(Typography)`
  font-size: 0.7rem !important;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--text-muted) !important;
  font-weight: 800 !important;
  margin-bottom: 8px !important;
`;

const InfoValue = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  color: white;
  font-size: 1.1rem;
  font-family: 'Outfit', sans-serif;
  
  svg {
    color: var(--primary);
    font-size: 22px;
  }
`;