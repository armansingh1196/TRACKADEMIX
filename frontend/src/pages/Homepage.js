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
            <Orb style={{ top: '-15%', right: '-8%', width: 700, height: 700, background: 'radial-gradient(circle, rgba(110,63,243,0.45) 0%, rgba(110,63,243,0.1) 50%, transparent 70%)' }} />
            <Orb style={{ bottom: '-20%', left: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(10,132,255,0.35) 0%, rgba(10,132,255,0.08) 55%, transparent 70%)' }} />
            <Orb style={{ top: '35%', left: '25%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(45,212,191,0.18) 0%, rgba(45,212,191,0.04) 55%, transparent 70%)' }} />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
                <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">

                    {/* Left — Hero */}
                    <Grid item xs={12} md={7}>
                        <ContentBox>
                            <PillBadge>
                                <RocketLaunchOutlinedIcon sx={{ fontSize: 13 }} />
                                Next-Gen Academic Management
                            </PillBadge>

                            <HeroTitle>
                                TRACAD<AccentSpan>EMIX</AccentSpan>
                                <br />
                                Institutional<br />Clarity.
                            </HeroTitle>

                            <HeroSubtitle>
                                A unified, secure ecosystem for record management,
                                attendance tracking, and AI-powered performance analytics.
                            </HeroSubtitle>

                            <CTARow>
                                <AppButton
                                    variant="contained"
                                    size="large"
                                    onClick={() => navigate('/choose')}
                                    sx={{
                                        px: 4, py: 1.75,
                                        fontSize: '1rem !important',
                                        borderRadius: '14px !important',
                                        background: '#6E3FF3 !important',
                                        boxShadow: '0 8px 32px rgba(110,63,243,0.45) !important',
                                        fontWeight: 600,
                                    }}
                                >
                                    Get Started
                                </AppButton>
                                <AppButton
                                    variant="outlined"
                                    size="large"
                                    onClick={() => navigate('/chooseasguest')}
                                    sx={{
                                        px: 4, py: 1.75,
                                        fontSize: '1rem !important',
                                        borderRadius: '14px !important',
                                        color: 'rgba(235,235,245,0.8) !important',
                                        borderColor: 'rgba(84,84,88,0.7) !important',
                                        background: 'rgba(120,120,128,0.1) !important',
                                        '&:hover': {
                                            borderColor: 'rgba(110,63,243,0.5) !important',
                                            background: 'rgba(110,63,243,0.08) !important',
                                        }
                                    }}
                                >
                                    Guest Demo
                                </AppButton>
                            </CTARow>

                            <FooterNote>
                                Administrator or HOD?{' '}
                                <span onClick={() => navigate('/Adminregister')}>Establish your portal</span>
                            </FooterNote>
                        </ContentBox>
                    </Grid>

                    {/* Right — Glass Cards */}
                    <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
                        <CardsStack>
                            <FeatureCard className="card-1">
                                <CardIcon style={{ background: 'rgba(110,63,243,0.14)', color: '#9B6FF8' }}>
                                    <SchoolOutlinedIcon sx={{ fontSize: 28 }} />
                                </CardIcon>
                                <Box>
                                    <Typography sx={{ fontFamily: 'var(--font-sf)', fontWeight: 600, fontSize: '1rem', color: '#fff', letterSpacing: '-0.02em', mb: '3px' }}>
                                        Centralized Control
                                    </Typography>
                                    <Typography sx={{ fontFamily: 'var(--font-sf)', fontSize: '0.875rem', color: 'rgba(235,235,245,0.45)', lineHeight: 1.4 }}>
                                        Manage every department from one unified dashboard.
                                    </Typography>
                                </Box>
                            </FeatureCard>

                            <FeatureCard className="card-2">
                                <CardIcon style={{ background: 'rgba(10,132,255,0.14)', color: '#0A84FF' }}>
                                    <SecurityOutlinedIcon sx={{ fontSize: 28 }} />
                                </CardIcon>
                                <Box>
                                    <Typography sx={{ fontFamily: 'var(--font-sf)', fontWeight: 600, fontSize: '1rem', color: '#fff', letterSpacing: '-0.02em', mb: '3px' }}>
                                        Secure Infrastructure
                                    </Typography>
                                    <Typography sx={{ fontFamily: 'var(--font-sf)', fontSize: '0.875rem', color: 'rgba(235,235,245,0.45)', lineHeight: 1.4 }}>
                                        Bank-grade encryption for all institutional data.
                                    </Typography>
                                </Box>
                            </FeatureCard>

                            <StatsRow>
                                <StatPill>
                                    <span className="val">24/7</span>
                                    <span className="lab">Uptime</span>
                                </StatPill>
                                <StatPill>
                                    <span className="val">100%</span>
                                    <span className="lab">Secure</span>
                                </StatPill>
                                <StatPill>
                                    <span className="val">AI</span>
                                    <span className="lab">Powered</span>
                                </StatPill>
                            </StatsRow>
                        </CardsStack>
                    </Grid>
                </Grid>
            </Container>
        </StyledMain>
    );
};

export default Homepage;

/* ── Animations ── */
const floatA = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-12px); }
`;
const floatB = keyframes`
  0%, 100% { transform: translateX(-30px) translateY(0px); }
  50%       { transform: translateX(-30px) translateY(-8px); }
`;

/* ── Styled Components ── */
const StyledMain = styled.div`
  min-height: 100vh;
  background: transparent;
  color: #FFFFFF;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 80px 0;

  @media (min-width: 900px) {
    height: 100vh;
    padding: 0;
  }
`;

const Orb = styled.div`
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
`;

const ContentBox = styled(Box)`
  position: relative;
  z-index: 2;
  animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both;
`;

const PillBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(110, 63, 243, 0.1);
  border: 1px solid rgba(110, 63, 243, 0.28);
  padding: 7px 16px;
  border-radius: 100px;
  color: rgba(155, 111, 248, 0.95);
  font-family: var(--font-sf);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 28px;
`;

const HeroTitle = styled(Typography)`
  font-family: var(--font-sf) !important;
  font-size: clamp(2.8rem, 7vw, 4.5rem) !important;
  font-weight: 700 !important;
  letter-spacing: -0.04em !important;
  line-height: 1.0 !important;
  color: #FFFFFF !important;
  margin-bottom: 24px !important;
`;

const AccentSpan = styled.span`
  color: #6E3FF3;
`;

const HeroSubtitle = styled(Typography)`
  font-family: var(--font-sf) !important;
  font-size: 1.0625rem !important;
  font-weight: 400 !important;
  color: rgba(235, 235, 245, 0.5) !important;
  line-height: 1.55 !important;
  max-width: 520px;
  margin-bottom: 40px !important;
`;

const CTARow = styled(Box)`
  display: flex;
  gap: 14px;
  margin-bottom: 36px;
  flex-wrap: wrap;
`;

const FooterNote = styled(Typography)`
  font-family: var(--font-sf) !important;
  font-size: 0.9375rem !important;
  color: rgba(235, 235, 245, 0.35) !important;

  span {
    color: rgba(110, 63, 243, 0.9);
    font-weight: 500;
    margin-left: 6px;
    cursor: pointer;
    transition: color 0.2s ease;
    &:hover { color: rgba(155, 111, 248, 1); }
  }
`;

const CardsStack = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FeatureCard = styled(Box)`
  background: rgba(255, 255, 255, 0.055);
  backdrop-filter: blur(32px) saturate(200%) brightness(1.06);
  -webkit-backdrop-filter: blur(32px) saturate(200%) brightness(1.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

  &.card-1 { animation: ${floatA} 7s ease-in-out infinite; }
  &.card-2 { animation: ${floatB} 8s ease-in-out infinite; animation-delay: 1s; }

  &:hover {
    border-color: rgba(110, 63, 243, 0.4);
    background: rgba(255, 255, 255, 0.08);
    transform: scale(1.02);
    box-shadow: 0 16px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.16);
  }
`;

const CardIcon = styled(Box)`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StatsRow = styled(Box)`
  display: flex;
  gap: 12px;
`;

const StatPill = styled(Box)`
  flex: 1;
  background: rgba(255, 255, 255, 0.055);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 18px 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
  transition: all 0.3s ease;

  .val {
    font-family: var(--font-sf);
    font-size: 1.5rem;
    font-weight: 700;
    color: #FFFFFF;
    letter-spacing: -0.03em;
    line-height: 1;
  }

  .lab {
    font-family: var(--font-sf);
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: rgba(139, 92, 246, 0.9);
  }

  &:hover {
    border-color: rgba(110, 63, 243, 0.35);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.14);
  }
`;
