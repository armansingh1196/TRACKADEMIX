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
    const sclassName = currentUser?.sclassName;
    const studentSchool = currentUser?.school;

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
                            <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)' }}>
                                {String(currentUser.name).charAt(0)}
                            </Typography>
                        </StyledAvatar>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, fontFamily: 'var(--font-display)', color: '#F5F5FF' }}>{currentUser?.name}</Typography>
                        <Typography variant="body2" sx={{ color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                            Student Scholar
                        </Typography>
                        
                        <Box sx={{ mt: 5, width: '100%', px: 2 }}>
                            <AppButton variant="contained" fullWidth sx={{ 
                                mb: 2, 
                                background: 'var(--gradient-primary) !important',
                                boxShadow: '0 8px 20px rgba(124, 77, 255, 0.2)'
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
  padding: 40px 44px;
  border-radius: 24px !important;
  border: 1px solid rgba(124,77,255,0.1) !important;
  background: rgba(255, 255, 255, 0.055) !important;
  backdrop-filter: blur(40px) saturate(200%) brightness(1.06) !important;
  -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.06) !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(124,77,255,0.06), inset 0 1px 0 rgba(255,255,255,0.1) !important;
  animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;

  @media (max-width: 600px) {
    padding: 24px 16px;
    border-radius: 18px !important;
  }
`;

const StyledAvatar = styled(Avatar)`
  box-shadow: 0 8px 28px rgba(124,77,255,0.3);
  border: 3px solid rgba(124,77,255,0.35);
  background: linear-gradient(135deg, #7C4DFF 0%, #448AFF 100%) !important;
`;

const SectionTitle = styled(Typography)`
  font-family: var(--font-heading) !important;
  font-weight: 700 !important;
  color: rgba(124,77,255,0.9) !important;
  margin-bottom: 20px !important;
  font-size: 0.6875rem !important;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const InfoGrid = styled(Grid)`
  padding-top: 8px;
`;

const InfoLabel = styled(Typography)`
  font-family: var(--font-heading) !important;
  font-size: 0.6875rem !important;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(226,232,255,0.4) !important;
  font-weight: 700 !important;
  margin-bottom: 5px !important;
`;

const InfoValue = styled(Box)`
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 0.875rem;
  color: rgba(226,232,255,0.85);
  letter-spacing: -0.011em;
  word-break: break-word;
  overflow-wrap: anywhere;

  svg {
    color: rgba(124,77,255,0.75);
    font-size: 20px;
    flex-shrink: 0;
  }
`;