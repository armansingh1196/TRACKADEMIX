import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Grid, Typography } from '@mui/material';
import styled, { keyframes } from 'styled-components';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import AppButton from '../components/common/AppButton';

const Homepage = () => {
    const navigate = useNavigate();

    return (
        <StyledMain>
            <BackgroundDecor />
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
                <Grid container spacing={6} alignItems="center">
                    <Grid item xs={12} md={7}>
                        <ContentBox>
                            <Badge>
                                <RocketLaunchOutlinedIcon sx={{ fontSize: 16 }} />
                                Next-Gen Academic Management
                            </Badge>
                            <MainTitle variant="h1">
                                TRACAD<span>EMIX</span>
                                <br />
                                Institutional Clarity.
                            </MainTitle>
                            <Description variant="body1">
                                The TRACADEMIX Institutional Management system 
                                provides a unified, secure ecosystem for record management, 
                                attendance tracking, and performance analytics.
                            </Description>
                            
                            <ActionButtons>
                                <AppButton 
                                    variant="contained" 
                                    size="large"
                                    onClick={() => navigate('/choose')}
                                    sx={{ 
                                        px: 5, py: 2, fontSize: '1.2rem', 
                                        background: 'var(--gradient-vibrant) !important',
                                        boxShadow: '0 10px 30px rgba(132, 94, 194, 0.4) !important'
                                    }}
                                >
                                    Get Started
                                </AppButton>
                                <AppButton 
                                    variant="outlined" 
                                    size="large"
                                    onClick={() => navigate('/chooseasguest')}
                                    sx={{ 
                                        px: 5, py: 2, fontSize: '1.2rem', 
                                        color: 'white', 
                                        borderColor: 'var(--primary)',
                                        borderWidth: '2px !important',
                                        '&:hover': { background: 'rgba(132, 94, 194, 0.1) !important' }
                                    }}
                                >
                                    Guest Demo
                                </AppButton>
                            </ActionButtons>

                            <SignUpText>
                                Administrator or HOD? <span onClick={() => navigate('/Adminregister')}>Establish your portal</span>
                            </SignUpText>
                        </ContentBox>
                    </Grid>

                    <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
                        <VisualStack>
                            <GlassCard className="top-card">
                                <IconWrapper color="var(--primary)">
                                    <SchoolOutlinedIcon />
                                </IconWrapper>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, fontFamily: 'Outfit' }}>Centralized Control</Typography>
                                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>Manage every department from one unified dashboard.</Typography>
                                </Box>
                            </GlassCard>
                            <GlassCard className="middle-card">
                                <IconWrapper color="var(--secondary)">
                                    <SecurityOutlinedIcon />
                                </IconWrapper>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, fontFamily: 'Outfit' }}>Secure Infrastructure</Typography>
                                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>Bank-grade encryption for all institutional data.</Typography>
                                </Box>
                            </GlassCard>
                            <FloatingStats>
                                <StatBox>
                                    <Typography className="val">24/7</Typography>
                                    <Typography className="lab">Uptime</Typography>
                                </StatBox>
                                <StatBox>
                                    <Typography className="val">100%</Typography>
                                    <Typography className="lab">Secure</Typography>
                                </StatBox>
                            </FloatingStats>
                        </VisualStack>
                    </Grid>
                </Grid>
            </Container>
            
            <GlowBall style={{ top: '5%', right: '5%', background: 'rgba(132, 94, 194, 0.2)' }} />
            <GlowBall style={{ bottom: '10%', left: '5%', background: 'rgba(255, 128, 102, 0.1)' }} />
        </StyledMain>
    );
};

export default Homepage;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
`;

const StyledMain = styled.div`
  height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-main);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
`;

const BackgroundDecor = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 70% 30%, rgba(132, 94, 194, 0.1) 0%, transparent 40%),
              radial-gradient(circle at 20% 80%, rgba(255, 128, 102, 0.05) 0%, transparent 40%);
  z-index: 1;
`;

const ContentBox = styled(Box)`
  position: relative;
  z-index: 2;
  animation: fadeIn 0.8s ease-out;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(132, 94, 194, 0.15);
  border: 1px solid rgba(132, 94, 194, 0.3);
  padding: 10px 20px;
  border-radius: 100px;
  color: var(--primary);
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 32px;
`;

const MainTitle = styled(Typography)`
  font-size: clamp(3rem, 7vw, 5rem) !important;
  line-height: 1 !important;
  margin-bottom: 28px !important;
  font-weight: 900 !important;
  
  span {
    color: var(--primary);
  }
`;

const Description = styled(Typography)`
  font-size: 1.25rem !important;
  color: var(--text-muted) !important;
  max-width: 580px;
  margin-bottom: 56px !important;
  line-height: 1.6 !important;
`;

const ActionButtons = styled(Box)`
  display: flex;
  gap: 24px;
  margin-bottom: 48px;
`;

const SignUpText = styled(Typography)`
  color: var(--text-muted) !important;
  font-size: 1.1rem !important;

  span {
    color: var(--secondary);
    font-weight: 800;
    margin-left: 10px;
    cursor: pointer;
    transition: var(--transition);
    
    &:hover {
      text-decoration: underline;
      filter: brightness(1.2);
    }
  }
`;

const VisualStack = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: flex-end;
`;

const GlassCard = styled(Box)`
  background: rgba(176, 168, 185, 0.05);
  backdrop-filter: blur(24px);
  padding: 32px;
  border-radius: 32px;
  border: 1px solid rgba(176, 168, 185, 0.1);
  display: flex;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: 440px;
  animation: ${float} 6s ease-in-out infinite;

  &.top-card { animation-delay: 0s; }
  &.middle-card { animation-delay: 1.5s; transform: translateX(-40px); }

  &:hover {
    background: rgba(176, 168, 185, 0.1);
    border-color: var(--primary);
    transform: scale(1.02);
  }
`;

const IconWrapper = styled(Box)`
  width: 64px;
  height: 64px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${props => props.color}30;
  svg { font-size: 32px; }
`;

const FloatingStats = styled(Box)`
  display: flex;
  gap: 24px;
  width: 100%;
  max-width: 440px;
  animation: ${float} 6s ease-in-out infinite;
  animation-delay: 3s;
`;

const StatBox = styled(Box)`
  flex: 1;
  background: rgba(132, 94, 194, 0.05);
  padding: 24px;
  border-radius: 28px;
  border: 1px solid rgba(132, 94, 194, 0.1);
  text-align: center;

  .val { font-size: 1.8rem; font-weight: 900; color: white; font-family: 'Outfit'; }
  .lab { font-size: 0.8rem; text-transform: uppercase; color: var(--secondary); font-weight: 800; margin-top: 4px; }
`;

const GlowBall = styled.div`
  position: absolute;
  width: 500px;
  height: 500px;
  filter: blur(160px);
  border-radius: 50%;
  z-index: 1;
  pointer-events: none;
`;
