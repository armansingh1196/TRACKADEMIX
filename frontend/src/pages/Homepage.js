import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Grid, Typography } from '@mui/material';
import styled, { keyframes } from 'styled-components';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import AppButton from '../components/common/AppButton';

const Homepage = () => {
    const navigate = useNavigate();

    return (
        <StyledMain>
            <Orb style={{ top: '-15%', right: '-8%', width: 700, height: 700, background: 'radial-gradient(circle, rgba(124,77,255,0.4) 0%, rgba(124,77,255,0.1) 50%, transparent 70%)' }} />
            <Orb style={{ bottom: '-20%', left: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(68,138,255,0.3) 0%, rgba(68,138,255,0.08) 55%, transparent 70%)' }} />
            <Orb style={{ top: '35%', left: '25%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(45,212,191,0.15) 0%, rgba(45,212,191,0.04) 55%, transparent 70%)' }} />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'center' }}>
                <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">

                    {/* Left — Hero */}
                    <Grid item xs={12} md={6}>
                        <ContentBox>
                            <PillBadge>
                                <RocketLaunchOutlinedIcon sx={{ fontSize: 12 }} />
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
                                        px: 4.5, py: 1.6,
                                        fontSize: '0.9375rem !important',
                                        borderRadius: '12px !important',
                                        background: '#7C4DFF !important',
                                        boxShadow: '0 8px 32px rgba(124,77,255,0.4) !important',
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
                                        px: 4.5, py: 1.6,
                                        fontSize: '0.9375rem !important',
                                        borderRadius: '12px !important',
                                        color: 'rgba(226,232,255,0.8) !important',
                                        borderColor: 'rgba(124,77,255,0.2) !important',
                                        borderWidth: '1.5px !important',
                                        background: 'rgba(124,77,255,0.04) !important',
                                        '&:hover': {
                                            borderColor: 'rgba(124,77,255,0.4) !important',
                                            background: 'rgba(124,77,255,0.08) !important',
                                        }
                                    }}
                                >
                                    Guest Demo
                                </AppButton>
                            </CTARow>

                            <FooterNote>
                                Administrator or HOD?{' '}
                                <span onClick={() => navigate('/Adminregister')}>Establish your portal →</span>
                            </FooterNote>
                        </ContentBox>
                    </Grid>

                    {/* Right — Glass Cards */}
                    <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
                        <CardsStack>
                            <FeatureCard className="card-1">
                                <CardIcon style={{ background: 'rgba(124,77,255,0.1)', color: '#9B6FF8' }}>
                                    <SchoolOutlinedIcon sx={{ fontSize: 22 }} />
                                </CardIcon>
                                <Box>
                                    <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem', color: '#F5F5FF', letterSpacing: '-0.02em', mb: '2px' }}>
                                        Centralized Control
                                    </Typography>
                                    <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'rgba(226,232,255,0.5)', lineHeight: 1.45, letterSpacing: '-0.011em' }}>
                                        Manage every department from one unified dashboard.
                                    </Typography>
                                </Box>
                            </FeatureCard>

                            <FeatureCard className="card-2">
                                <CardIcon style={{ background: 'rgba(68,138,255,0.1)', color: '#448AFF' }}>
                                    <SecurityOutlinedIcon sx={{ fontSize: 22 }} />
                                </CardIcon>
                                <Box>
                                    <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem', color: '#F5F5FF', letterSpacing: '-0.02em', mb: '2px' }}>
                                        Secure Infrastructure
                                    </Typography>
                                    <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'rgba(226,232,255,0.5)', lineHeight: 1.45, letterSpacing: '-0.011em' }}>
                                        Bank-grade encryption for all institutional data.
                                    </Typography>
                                </Box>
                            </FeatureCard>

                            <FeatureCard className="card-3">
                                <CardIcon style={{ background: 'rgba(45,212,191,0.1)', color: '#2DD4BF' }}>
                                    <InsightsOutlinedIcon sx={{ fontSize: 22 }} />
                                </CardIcon>
                                <Box>
                                    <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem', color: '#F5F5FF', letterSpacing: '-0.02em', mb: '2px' }}>
                                        AI-Powered Analytics
                                    </Typography>
                                    <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'rgba(226,232,255,0.5)', lineHeight: 1.45, letterSpacing: '-0.011em' }}>
                                        Predict performance trends with intelligent insights.
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
  50%       { transform: translateY(-8px); }
`;
const floatB = keyframes`
  0%, 100% { transform: translateX(-20px) translateY(0px); }
  50%       { transform: translateX(-20px) translateY(-6px); }
`;
const floatC = keyframes`
  0%, 100% { transform: translateX(-10px) translateY(0px); }
  50%       { transform: translateX(-10px) translateY(-10px); }
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

  @media (max-width: 600px) {
    padding: 48px 0 40px;
  }

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
  gap: 7px;
  background: rgba(124, 77, 255, 0.06);
  border: 1px solid rgba(124, 77, 255, 0.18);
  padding: 6px 14px;
  border-radius: 100px;
  color: rgba(155, 111, 248, 0.95);
  font-family: var(--font-heading);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 24px;

  @media (max-width: 600px) {
    font-size: 0.625rem;
    padding: 5px 12px;
    gap: 6px;
    margin-bottom: 18px;
  }
`;

const HeroTitle = styled(Typography)`
  font-family: var(--font-display) !important;
  font-size: clamp(2.6rem, 6.5vw, 4.2rem) !important;
  font-weight: 800 !important;
  letter-spacing: -0.045em !important;
  line-height: 1.02 !important;
  color: #F5F5FF !important;
  margin-bottom: 20px !important;
`;

const AccentSpan = styled.span`
  color: #7C4DFF;
`;

const HeroSubtitle = styled(Typography)`
  font-family: var(--font-body) !important;
  font-size: 1.0625rem !important;
  font-weight: 400 !important;
  color: rgba(226, 232, 255, 0.55) !important;
  line-height: 1.65 !important;
  letter-spacing: -0.011em !important;
  max-width: 480px;
  margin-bottom: 32px !important;

  @media (max-width: 600px) {
    font-size: 0.9375rem !important;
    margin-bottom: 24px !important;
  }
`;

const CTARow = styled(Box)`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    gap: 10px;
    margin-bottom: 20px;
  }
`;

const FooterNote = styled(Typography)`
  font-family: var(--font-body) !important;
  font-size: 0.8125rem !important;
  color: rgba(226, 232, 255, 0.3) !important;
  letter-spacing: -0.011em !important;

  span {
    color: rgba(124, 77, 255, 0.85);
    font-weight: 500;
    margin-left: 4px;
    cursor: pointer;
    transition: color 0.2s ease;
    &:hover { color: rgba(155, 111, 248, 1); }
  }
`;

const CardsStack = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FeatureCard = styled(Box)`
  background: rgba(255, 255, 255, 0.045);
  backdrop-filter: blur(32px) saturate(200%) brightness(1.06);
  -webkit-backdrop-filter: blur(32px) saturate(200%) brightness(1.06);
  border: 1px solid rgba(124, 77, 255, 0.1);
  border-radius: 16px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(124,77,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08);
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);

  &.card-1 { animation: ${floatA} 7s ease-in-out infinite; }
  &.card-2 { animation: ${floatB} 8s ease-in-out infinite; animation-delay: 0.5s; }
  &.card-3 { animation: ${floatC} 9s ease-in-out infinite; animation-delay: 1s; }

  &:hover {
    border-color: rgba(124, 77, 255, 0.25);
    background: rgba(255, 255, 255, 0.07);
    transform: scale(1.02);
    box-shadow: 0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(124,77,255,0.1), inset 0 1px 0 rgba(255,255,255,0.12);
  }
`;

const CardIcon = styled(Box)`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StatsRow = styled(Box)`
  display: flex;
  gap: 10px;
`;

const StatPill = styled(Box)`
  flex: 1;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(124, 77, 255, 0.08);
  border-radius: 14px;
  padding: 14px 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 3px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06);
  transition: all 0.3s ease;

  .val {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 800;
    color: #F5F5FF;
    letter-spacing: -0.03em;
    line-height: 1;
  }

  .lab {
    font-family: var(--font-heading);
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(155, 111, 248, 0.75);
  }

  &:hover {
    border-color: rgba(124, 77, 255, 0.2);
    background: rgba(255, 255, 255, 0.06);
    box-shadow: 0 6px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
  }
`;
