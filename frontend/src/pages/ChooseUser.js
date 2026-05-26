import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, CircularProgress, Backdrop, Typography } from '@mui/material';
import styled, { keyframes } from 'styled-components';
import { useSelector } from 'react-redux';
import Popup from '../components/Popup';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

/* ── Role definitions with unique visual identities ── */
const ROLES = [
    {
        name: 'Admin',
        label: 'Administrator',
        tagline: 'Institution Control',
        icon: AdminPanelSettingsOutlinedIcon,
        desc: 'Full control over institutional data, student records, faculty assignments, and system configuration.',
        permissions: ['Manage Users', 'View Reports', 'System Settings'],
        gradient: 'linear-gradient(135deg, #7C4DFF 0%, #B07AFE 100%)',
        glow: 'rgba(124, 77, 255, 0.35)',
        border: 'rgba(124, 77, 255, 0.3)',
        chip: 'rgba(124, 77, 255, 0.12)',
        chipBorder: 'rgba(124, 77, 255, 0.25)',
        chipColor: '#B07AFE',
    },
    {
        name: 'Student',
        label: 'Student',
        tagline: 'Academic Portal',
        icon: SchoolOutlinedIcon,
        desc: 'Access your courses, attendance records, exam results, and AI-driven performance insights.',
        permissions: ['View Marks', 'Attendance', 'AI Insights'],
        gradient: 'linear-gradient(135deg, #448AFF 0%, #82B1FF 100%)',
        glow: 'rgba(68, 138, 255, 0.35)',
        border: 'rgba(68, 138, 255, 0.3)',
        chip: 'rgba(68, 138, 255, 0.12)',
        chipBorder: 'rgba(68, 138, 255, 0.25)',
        chipColor: '#82B1FF',
    },
    {
        name: 'Teacher',
        label: 'Educator',
        tagline: 'Faculty Dashboard',
        icon: MenuBookOutlinedIcon,
        desc: 'Manage class sessions, track student progress, mark attendance, and evaluate assignments.',
        permissions: ['Mark Attendance', 'Grade Students', 'View Classes'],
        gradient: 'linear-gradient(135deg, #2DD4BF 0%, #5EEAD4 100%)',
        glow: 'rgba(45, 212, 191, 0.3)',
        border: 'rgba(45, 212, 191, 0.28)',
        chip: 'rgba(45, 212, 191, 0.1)',
        chipBorder: 'rgba(45, 212, 191, 0.22)',
        chipColor: '#5EEAD4',
    },
];

const ChooseUser = () => {
    const navigate = useNavigate();
    const { status, currentUser, currentRole } = useSelector(state => state.user);
    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState('');
    const [hovered, setHovered] = useState(null);

    const navigateHandler = (user) => {
        if (user === 'Admin') navigate('/Adminlogin');
        else if (user === 'Student') navigate('/Studentlogin');
        else if (user === 'Teacher') navigate('/Teacherlogin');
    };

    useEffect(() => {
        if (status === 'success' || currentUser !== null) {
            if (currentRole === 'Admin') navigate('/Admin/dashboard');
            else if (currentRole === 'Student') navigate('/Student/dashboard');
            else if (currentRole === 'Teacher') navigate('/Teacher/dashboard');
        } else if (status === 'error') {
            setLoader(false);
            setMessage('Network Error');
            setShowPopup(true);
        }
    }, [status, currentRole, navigate, currentUser]);

    return (
        <PageRoot>
            {/* Ambient background orbs */}
            <Orb style={{ top: '-10%', right: '-5%', width: 700, height: 700, background: 'radial-gradient(circle, rgba(124,77,255,0.22) 0%, transparent 65%)' }} />
            <Orb style={{ bottom: '-15%', left: '-8%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(68,138,255,0.18) 0%, transparent 65%)' }} />
            <Orb style={{ top: '30%', left: '45%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(45,212,191,0.1) 0%, transparent 65%)' }} />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>

                {/* Back button */}
                <BackRow>
                    <BackBtn onClick={() => navigate('/')}>
                        <ArrowBackIosNewIcon sx={{ fontSize: 12 }} />
                        Back
                    </BackBtn>
                </BackRow>

                {/* Header */}
                <Header>
                    <EyebrowLabel>TRACKADEMIX PLATFORM</EyebrowLabel>
                    <PageTitle>
                        Choose Your{' '}
                        <GradientSpan>Portal</GradientSpan>
                    </PageTitle>
                    <PageSub>
                        Select your institutional role to access your personalised dashboard.
                    </PageSub>
                </Header>

                {/* Role cards grid */}
                <CardsGrid>
                    {ROLES.map((role, i) => {
                        const Icon = role.icon;
                        const isHovered = hovered === role.name;
                        return (
                            <RoleCard
                                key={role.name}
                                delay={i * 0.1}
                                glow={role.glow}
                                border={role.border}
                                isHovered={isHovered}
                                onClick={() => navigateHandler(role.name)}
                                onMouseEnter={() => setHovered(role.name)}
                                onMouseLeave={() => setHovered(null)}
                            >
                                {/* Shimmer sweep on hover */}
                                <Shimmer />

                                {/* Hero icon area */}
                                <IconHero gradient={role.gradient} glow={role.glow}>
                                    <IconRing gradient={role.gradient}>
                                        <Icon sx={{ fontSize: 36, color: 'white' }} />
                                    </IconRing>
                                    {/* Decorative blobs inside hero */}
                                    <HeroBlob style={{ top: '-20%', right: '-15%', width: 120, height: 120, background: 'rgba(255,255,255,0.06)' }} />
                                    <HeroBlob style={{ bottom: '-10%', left: '-10%', width: 80, height: 80, background: 'rgba(255,255,255,0.04)' }} />
                                </IconHero>

                                {/* Card body */}
                                <CardBody>
                                    <RoleTagline style={{ color: role.chipColor }}>{role.tagline}</RoleTagline>
                                    <RoleName>{role.label}</RoleName>
                                    <RoleDesc>{role.desc}</RoleDesc>

                                    {/* Permission chips */}
                                    <ChipRow>
                                        {role.permissions.map(p => (
                                            <PermChip key={p} bg={role.chip} border={role.chipBorder} color={role.chipColor}>
                                                {p}
                                            </PermChip>
                                        ))}
                                    </ChipRow>

                                    {/* CTA */}
                                    <CTARow gradient={role.gradient} glow={role.glow}>
                                        <CTALabel>Enter Portal</CTALabel>
                                        <ArrowForwardIcon sx={{ fontSize: 16, transition: 'transform 0.2s ease' }} />
                                    </CTARow>
                                </CardBody>
                            </RoleCard>
                        );
                    })}
                </CardsGrid>
            </Container>

            <Backdrop
                sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1, backdropFilter: 'blur(8px)', background: 'rgba(6,8,24,0.7)' }}
                open={loader}
            >
                <CircularProgress sx={{ color: '#7C4DFF' }} />
                <Typography sx={{ ml: 2, fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                    Authenticating…
                </Typography>
            </Backdrop>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </PageRoot>
    );
};

export default ChooseUser;

/* ── Keyframes ── */
const fadeUp = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
`;

const shimmerSlide = keyframes`
    from { transform: translateX(-100%) skewX(-15deg); }
    to   { transform: translateX(300%) skewX(-15deg); }
`;

const orbDrift = keyframes`
    0%, 100% { transform: translate(0, 0); }
    33%       { transform: translate(20px, -15px); }
    66%       { transform: translate(-15px, 10px); }
`;

/* ── Layout ── */
const PageRoot = styled.div`
    min-height: 100vh;
    background: transparent;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 0 64px;

    @media (max-width: 600px) {
        padding: 28px 0 48px;
        align-items: flex-start;
    }
`;

const Orb = styled.div`
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    animation: ${orbDrift} 18s ease-in-out infinite;
`;

/* ── Header ── */
const BackRow = styled.div`
    display: flex;
    margin-bottom: 40px;
    animation: ${fadeUp} 0.5s cubic-bezier(0.16,1,0.3,1) both;
`;

const BackBtn = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(124,77,255,0.12);
    border-radius: 100px;
    color: rgba(226,232,255,0.55);
    font-family: 'Inter', sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 7px 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    letter-spacing: -0.01em;

    &:hover {
        background: rgba(124,77,255,0.1);
        border-color: rgba(124,77,255,0.25);
        color: #F5F5FF;
    }
`;

const Header = styled.div`
    text-align: center;
    margin-bottom: 56px;
    animation: ${fadeUp} 0.6s 0.05s cubic-bezier(0.16,1,0.3,1) both;

    @media (max-width: 600px) {
        margin-bottom: 36px;
    }
`;

const EyebrowLabel = styled.div`
    font-family: 'Inter', sans-serif;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: rgba(124,77,255,0.8);
    margin-bottom: 14px;
    text-transform: uppercase;
`;

const PageTitle = styled.div`
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: clamp(2.2rem, 5.5vw, 3.4rem);
    font-weight: 800;
    letter-spacing: -0.04em;
    color: #F5F5FF;
    line-height: 1.08;
    margin-bottom: 14px;
`;

const GradientSpan = styled.span`
    background: linear-gradient(135deg, #7C4DFF 0%, #82B1FF 50%, #5EEAD4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
`;

const PageSub = styled.div`
    font-family: 'Inter', sans-serif;
    font-size: 0.9375rem;
    color: rgba(226,232,255,0.4);
    font-weight: 400;
    letter-spacing: -0.011em;
    max-width: 400px;
    margin: 0 auto;
    line-height: 1.6;
`;

/* ── Cards grid ── */
const CardsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
        max-width: 420px;
        margin: 0 auto;
        gap: 16px;
    }
`;

/* ── Role Card ── */
const RoleCard = styled.div`
    position: relative;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid ${p => p.isHovered ? p.border : 'rgba(255,255,255,0.06)'};
    border-radius: 24px;
    overflow: hidden;
    cursor: pointer;
    animation: ${fadeUp} 0.65s ${p => p.delay || 0}s cubic-bezier(0.16, 1, 0.3, 1) both;
    transition: border-color 0.3s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease, background 0.3s ease;
    display: flex;
    flex-direction: column;

    &:hover {
        transform: translateY(-10px) scale(1.015);
        background: rgba(255,255,255,0.045);
        box-shadow: 0 30px 60px rgba(0,0,0,0.5), 0 0 40px ${p => p.glow || 'rgba(124,77,255,0.2)'};
    }

    &:hover .card-shimmer {
        animation: ${shimmerSlide} 0.65s ease forwards;
    }

    &:active {
        transform: translateY(-6px) scale(1.008);
    }
`;

/* Shimmer overlay */
const Shimmer = styled.div.attrs({ className: 'card-shimmer' })`
    position: absolute;
    top: 0;
    left: 0;
    width: 40%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
    transform: translateX(-100%) skewX(-15deg);
    pointer-events: none;
    z-index: 10;
`;

/* ── Icon Hero ── */
const IconHero = styled.div`
    position: relative;
    overflow: hidden;
    height: 160px;
    background: ${p => p.gradient};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 40px;
        background: linear-gradient(to bottom, transparent, rgba(6,8,24,0.6));
    }
`;

const IconRing = styled.div`
    width: 72px;
    height: 72px;
    border-radius: 20px;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3);
    position: relative;
    z-index: 2;
    transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);

    ${RoleCard}:hover & {
        transform: scale(1.1) rotate(-3deg);
    }
`;

const HeroBlob = styled.div`
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
`;

/* ── Card Body ── */
const CardBody = styled.div`
    padding: 22px 22px 24px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
`;

const RoleTagline = styled.div`
    font-family: 'Inter', sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
`;

const RoleName = styled.div`
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1.375rem;
    font-weight: 800;
    color: #F5F5FF;
    letter-spacing: -0.025em;
    line-height: 1.15;
`;

const RoleDesc = styled.div`
    font-family: 'Inter', sans-serif;
    font-size: 0.8125rem;
    color: rgba(226,232,255,0.45);
    line-height: 1.6;
    letter-spacing: -0.011em;
    flex: 1;
`;

/* ── Permission chips ── */
const ChipRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
`;

const PermChip = styled.div`
    font-family: 'Inter', sans-serif;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    padding: 3px 9px;
    border-radius: 100px;
    background: ${p => p.bg};
    border: 1px solid ${p => p.border};
    color: ${p => p.color};
    white-space: nowrap;
`;

/* ── CTA row ── */
const CTARow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 11px 16px;
    border-radius: 12px;
    background: ${p => p.gradient};
    box-shadow: 0 4px 16px ${p => p.glow || 'rgba(124,77,255,0.25)'};
    margin-top: 4px;
    transition: box-shadow 0.25s ease, transform 0.25s ease;

    ${RoleCard}:hover & {
        box-shadow: 0 8px 28px ${p => p.glow || 'rgba(124,77,255,0.4)'};
        transform: translateY(-1px);
    }

    svg {
        ${RoleCard}:hover & {
            transform: translateX(4px);
        }
    }
`;

const CTALabel = styled.div`
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.8125rem;
    font-weight: 700;
    color: white;
    letter-spacing: -0.01em;
`;