import React from 'react';
import { useSelector } from 'react-redux';
import { Container, Paper, Box, Avatar, Grid, Divider, Typography } from '@mui/material';
import styled from 'styled-components';
import AppHeader from '../../components/common/AppHeader';
import AppButton from '../../components/common/AppButton';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';

const StudentProfile = () => {
    const { currentUser } = useSelector((state) => state.user);
    const sclassName = currentUser.sclassName;
    const studentSchool = currentUser.school;

    return (
        <Container maxWidth="md" sx={{ mt: 2, mb: 4 }}>
            <AppHeader 
                title="Student Profile" 
                subtitle="View your academic credentials and institutional records." 
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
                        <StyledAvatar sx={{ width: 120, height: 120, mb: 3, background: 'var(--gradient-vibrant)' }}>
                            <Typography variant="h3" sx={{ fontWeight: 900, color: 'white', fontFamily: 'Outfit' }}>
                                {String(currentUser.name).charAt(0)}
                            </Typography>
                        </StyledAvatar>
                        <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5, fontFamily: 'Outfit', color: 'white' }}>{currentUser?.name}</Typography>
                        <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                            Student Scholar
                        </Typography>
                        
                        <Box sx={{ mt: 5, width: '100%', px: 2 }}>
                            <AppButton variant="contained" fullWidth sx={{ 
                                mb: 2, 
                                background: 'var(--gradient-primary) !important',
                                boxShadow: '0 8px 20px rgba(132, 94, 194, 0.2)'
                            }}>
                                Report Issue
                            </AppButton>
                            <AppButton variant="outlined" fullWidth sx={{ 
                                color: 'white', 
                                borderColor: 'var(--border)',
                                '&:hover': { borderColor: 'var(--primary)' }
                            }}>
                                Security
                            </AppButton>
                        </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={8}>
                        <SectionTitle variant="h6">Academic Identity</SectionTitle>
                        <InfoGrid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <InfoLabel>Scholar Name</InfoLabel>
                                <InfoValue>
                                    <PersonOutlineIcon />
                                    {currentUser?.name}
                                </InfoValue>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InfoLabel>Registration Number</InfoLabel>
                                <InfoValue>
                                    <BadgeOutlinedIcon />
                                    #{currentUser?.rollNum}
                                </InfoValue>
                            </Grid>
                            
                            <Grid item xs={12}>
                                <Divider sx={{ my: 1, borderColor: 'var(--border)' }} />
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <InfoLabel>Assigned Class</InfoLabel>
                                <InfoValue>
                                    <SchoolOutlinedIcon />
                                    {sclassName?.sclassName}
                                </InfoValue>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InfoLabel>Institutional Branch</InfoLabel>
                                <InfoValue>
                                    <BusinessOutlinedIcon />
                                    {studentSchool?.schoolName}
                                </InfoValue>
                            </Grid>
                        </InfoGrid>

                        <Box sx={{ mt: 6, p: 3, borderRadius: '20px', background: 'rgba(255, 128, 102, 0.03)', border: '1px solid rgba(255, 128, 102, 0.1)' }}>
                            <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                                Verified Scholar of {studentSchool?.schoolName}. Access provided by TRACADEMIX.
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </ProfilePaper>
        </Container>
    );
}

export default StudentProfile;

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
  box-shadow: 0 12px 32px rgba(255, 128, 102, 0.3);
  border: 4px solid var(--bg-surface);
`;

const SectionTitle = styled(Typography)`
  font-family: 'Outfit', sans-serif !important;
  font-weight: 800 !important;
  color: var(--secondary) !important;
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
    color: var(--secondary);
    font-size: 22px;
  }
`;