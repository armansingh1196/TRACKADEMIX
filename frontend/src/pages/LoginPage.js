import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Checkbox, FormControlLabel, CssBaseline, IconButton, InputAdornment, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff, EmailOutlined, LockOutlined, PersonOutlined, BadgeOutlined } from '@mui/icons-material';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { loginUser } from '../redux/userRelated/userHandle';
import styled, { keyframes } from 'styled-components';
import Popup from '../components/Popup';
import AppButton from '../components/common/AppButton';
import AppTextField from '../components/common/AppTextField';

/* Per-role visual config */
const ROLE_CONFIG = {
    Admin: {
        gradient: 'linear-gradient(135deg, #7C4DFF 0%, #B07AFE 100%)',
        glow: 'rgba(124,77,255,0.4)',
        color: '#9B6FF8',
        Icon: AdminPanelSettingsOutlinedIcon,
        tagline: 'Institution Control',
        headline: 'Manage your institution with full administrative power.',
        features: ['Student & faculty management', 'Academic data oversight', 'System-wide configuration'],
    },
    Student: {
        gradient: 'linear-gradient(135deg, #448AFF 0%, #82B1FF 100%)',
        glow: 'rgba(68,138,255,0.4)',
        color: '#82B1FF',
        Icon: SchoolOutlinedIcon,
        tagline: 'Academic Portal',
        headline: 'Track your academic journey with AI-powered insights.',
        features: ['Attendance & marks dashboard', 'AI performance analysis', 'Institutional notices'],
    },
    Teacher: {
        gradient: 'linear-gradient(135deg, #2DD4BF 0%, #5EEAD4 100%)',
        glow: 'rgba(45,212,191,0.35)',
        color: '#5EEAD4',
        Icon: MenuBookOutlinedIcon,
        tagline: 'Faculty Dashboard',
        headline: 'Manage classes, mark attendance, and evaluate students.',
        features: ['Class attendance marking', 'Student grade management', 'Assignment tracking'],
    },
};

const LoginPage = ({ role }) => {
    const dispatch  = useDispatch();
    const navigate  = useNavigate();
    const { status, currentUser, response, currentRole } = useSelector(s => s.user);
    const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.Admin;
    const RoleIcon = cfg.Icon;

    const [toggle, setToggle]       = useState(false);
    const [loader, setLoader]       = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage]     = useState('');
    const [errors, setErrors]       = useState({});

    const clearErr = (name) => setErrors(p => ({ ...p, [name]: false }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        if (role === 'Student') {
            const rollNum = fd.get('rollNum'), studentName = fd.get('studentName'), password = fd.get('password');
            const errs = {};
            if (!rollNum) errs.rollNum = true;
            if (!studentName) errs.studentName = true;
            if (!password) errs.password = true;
            if (Object.keys(errs).length) { setErrors(errs); return; }
            setLoader(true);
            dispatch(loginUser({ rollNum, studentName, password }, role));
        } else {
            const email = fd.get('email'), password = fd.get('password');
            const errs = {};
            if (!email) errs.email = true;
            if (!password) errs.password = true;
            if (Object.keys(errs).length) { setErrors(errs); return; }
            setLoader(true);
            dispatch(loginUser({ email, password }, role));
        }
    };

    useEffect(() => {
        if (status === 'success' || currentUser !== null) {
            if (currentRole === 'Admin')   navigate('/Admin/dashboard');
            else if (currentRole === 'Student') navigate('/Student/dashboard');
            else if (currentRole === 'Teacher') navigate('/Teacher/dashboard');
        } else if (status === 'failed') {
            setMessage(response); setShowPopup(true); setLoader(false);
        } else if (status === 'error') {
            setMessage('Network Error — please try again.'); setShowPopup(true); setLoader(false);
        }
    }, [status, currentUser, currentRole, navigate, response]);

    return (
        <PageRoot>
            <CssBaseline />

            {/* ── LEFT: Form ── */}
            <FormPanel>
                <Orb style={{ top: '-20%', left: '-20%', width: 420, height: 420, background: `radial-gradient(circle, ${cfg.glow.replace('0.4','0.12')} 0%, transparent 70%)` }} />

                <FormContent>
                    {/* Back + Brand */}
                    <TopRow>
                        <BackBtn onClick={() => navigate('/choose')} aria-label="Back">
                            <ArrowBackIosNewIcon sx={{ fontSize: 11 }} />
                            Back
                        </BackBtn>
                        <BrandMark onClick={() => navigate('/')}>
                            TRACAD<span>EMIX</span>
                        </BrandMark>
                    </TopRow>

                    {/* Role badge */}
                    <RoleBadge color={cfg.color} gradient={cfg.gradient}>
                        <RoleIcon sx={{ fontSize: 14 }} />
                        {cfg.tagline}
                    </RoleBadge>

                    {/* Heading */}
                    <HeadBlock>
                        <PageTitle>Welcome back</PageTitle>
                        <PageSub>Sign in to your <RoleWord color={cfg.color}>{role}</RoleWord> portal to continue.</PageSub>
                    </HeadBlock>

                    {/* Form */}
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {role === 'Student' ? (
                            <>
                                <StyledField margin="none" required fullWidth id="rollNum" label="Roll Number"
                                    name="rollNum" autoFocus error={errors.rollNum}
                                    helperText={errors.rollNum && 'Required'} onChange={e => clearErr(e.target.name)}
                                    accentcolor={cfg.color}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><BadgeOutlined sx={{ color: 'rgba(226,232,255,0.28)', fontSize: 19 }} /></InputAdornment> }}
                                />
                                <StyledField margin="none" required fullWidth id="studentName" label="Full Name"
                                    name="studentName" error={errors.studentName}
                                    helperText={errors.studentName && 'Required'} onChange={e => clearErr(e.target.name)}
                                    accentcolor={cfg.color}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlined sx={{ color: 'rgba(226,232,255,0.28)', fontSize: 19 }} /></InputAdornment> }}
                                />
                            </>
                        ) : (
                            <StyledField margin="none" required fullWidth id="email" label="Email Address"
                                name="email" autoFocus error={errors.email}
                                helperText={errors.email && 'Required'} onChange={e => clearErr(e.target.name)}
                                accentcolor={cfg.color}
                                InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color: 'rgba(226,232,255,0.28)', fontSize: 19 }} /></InputAdornment> }}
                            />
                        )}

                        <StyledField margin="none" required fullWidth name="password" label="Password"
                            type={toggle ? 'text' : 'password'} id="password"
                            error={errors.password} helperText={errors.password && 'Required'}
                            onChange={e => clearErr(e.target.name)}
                            accentcolor={cfg.color}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: 'rgba(226,232,255,0.28)', fontSize: 19 }} /></InputAdornment>,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setToggle(!toggle)} edge="end" sx={{ color: 'rgba(226,232,255,0.3)' }}>
                                            {toggle ? <Visibility sx={{ fontSize: 18 }} /> : <VisibilityOff sx={{ fontSize: 18 }} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {role === 'Student' && (
                            <HintBox>
                                Default password: <strong>CapitalizedName@BirthYearLast3Roll</strong>
                            </HintBox>
                        )}

                        <RowBetween>
                            <FormControlLabel
                                control={<Checkbox size="small" sx={{ color: 'rgba(226,232,255,0.2)', '&.Mui-checked': { color: cfg.color }, p: '5px' }} />}
                                label={<Typography sx={{ fontSize: '0.8125rem', color: 'rgba(226,232,255,0.45)', fontFamily: 'Inter' }}>Keep me signed in</Typography>}
                            />
                            <Link to="/" style={{ fontSize: '0.8125rem', color: cfg.color, fontWeight: 600, textDecoration: 'none', fontFamily: 'Inter' }}>
                                Forgot password?
                            </Link>
                        </RowBetween>

                        <SubmitBtn
                            type="submit" fullWidth variant="contained" disabled={loader}
                            gradient={cfg.gradient} glow={cfg.glow}
                        >
                            {loader ? <CircularProgress size={20} color="inherit" /> : `Sign in to ${role} Portal`}
                        </SubmitBtn>

                        {role === 'Admin' && (
                            <RegisterHint>
                                New institution?{' '}
                                <Link to="/Adminregister" style={{ color: cfg.color, fontWeight: 600, textDecoration: 'none' }}>
                                    Register here
                                </Link>
                            </RegisterHint>
                        )}
                    </Box>
                </FormContent>
            </FormPanel>

            {/* ── RIGHT: Visual Panel ── */}
            <VisualPanel>
                <Orb style={{ top: '-10%', right: '-8%', width: 600, height: 600, background: `radial-gradient(circle, ${cfg.glow} 0%, transparent 65%)` }} />
                <Orb style={{ bottom: '-15%', left: '-5%', width: 450, height: 450, background: 'radial-gradient(circle, rgba(68,138,255,0.15) 0%, transparent 65%)' }} />

                <VisualContent>
                    {/* Floating hero card */}
                    <HeroCard gradient={cfg.gradient}>
                        <HeroCardInner>
                            <HeroIconRing gradient={cfg.gradient}>
                                <RoleIcon sx={{ fontSize: 28, color: 'white' }} />
                            </HeroIconRing>
                            <HeroCardTitle>{cfg.tagline}</HeroCardTitle>
                            <HeroCardSub>{role} Portal</HeroCardSub>
                        </HeroCardInner>
                        <HeroGlow gradient={cfg.gradient} />
                    </HeroCard>

                    {/* Text */}
                    <VisualHeadline>{cfg.headline}</VisualHeadline>

                    {/* Feature list */}
                    <FeatureList>
                        {cfg.features.map(f => (
                            <FeatureItem key={f} color={cfg.color}>
                                <FeatureCheck color={cfg.color}>
                                    <CheckRoundedIcon sx={{ fontSize: 11 }} />
                                </FeatureCheck>
                                {f}
                            </FeatureItem>
                        ))}
                    </FeatureList>

                    {/* Bottom stat chips */}
                    <StatRow>
                        {[{ v: '99.9%', l: 'Uptime' }, { v: 'AES-256', l: 'Encrypted' }, { v: 'Real-time', l: 'Analytics' }].map(s => (
                            <StatChip key={s.l}>
                                <StatVal>{s.v}</StatVal>
                                <StatLabel>{s.l}</StatLabel>
                            </StatChip>
                        ))}
                    </StatRow>
                </VisualContent>
            </VisualPanel>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </PageRoot>
    );
};

export default LoginPage;

/* ── Keyframes ── */
const slideUp = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
`;
const float = keyframes`
    0%, 100% { transform: translateY(0) rotate(-1deg); }
    50%       { transform: translateY(-10px) rotate(1deg); }
`;

/* ── Layout ── */
const PageRoot = styled.div`
    height: 100vh;
    overflow: hidden;
    display: flex;
    background: #060818;
`;

const Orb = styled.div`
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
`;

/* ── Form panel (left 44%) ── */
const FormPanel = styled.div`
    width: 44%;
    min-width: 360px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(6, 8, 24, 0.95);
    border-right: 1px solid rgba(124,77,255,0.08);
    position: relative;
    overflow: hidden;
    flex-shrink: 0;

    @media (max-width: 768px) {
        width: 100%;
        border-right: none;
    }
`;

const FormContent = styled.div`
    width: 100%;
    max-width: 400px;
    padding: 32px 36px;
    position: relative;
    z-index: 2;
    animation: ${slideUp} 0.6s cubic-bezier(0.16,1,0.3,1) both;

    @media (max-width: 480px) { padding: 24px 20px; }
`;

const TopRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
`;

const BackBtn = styled.button`
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(124,77,255,0.1);
    border-radius: 100px;
    color: rgba(226,232,255,0.5);
    font-family: Inter, sans-serif;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 6px 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    &:hover { background: rgba(124,77,255,0.08); color: #F5F5FF; border-color: rgba(124,77,255,0.2); }
`;

const BrandMark = styled.div`
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    color: #F5F5FF;
    letter-spacing: -0.025em;
    cursor: pointer;
    span { color: #7C4DFF; }
`;

const RoleBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${p => p.color};
    background: ${p => p.color}18;
    border: 1px solid ${p => p.color}30;
    border-radius: 100px;
    padding: 4px 12px;
    margin-bottom: 16px;
`;

const HeadBlock = styled.div`
    margin-bottom: 28px;
`;

const PageTitle = styled.div`
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: clamp(1.6rem, 3.5vw, 2.1rem);
    font-weight: 800;
    color: #F5F5FF;
    letter-spacing: -0.035em;
    line-height: 1.1;
    margin-bottom: 8px;
`;

const PageSub = styled.div`
    font-size: 0.875rem;
    color: rgba(226,232,255,0.45);
    font-weight: 400;
    font-family: Inter, sans-serif;
    letter-spacing: -0.011em;
`;

const RoleWord = styled.span`
    color: ${p => p.color};
    font-weight: 600;
`;

const StyledField = styled(AppTextField)`
    & .MuiOutlinedInput-root {
        background: rgba(255,255,255,0.03) !important;
        color: #F5F5FF !important;
        border-radius: 12px !important;
        font-family: Inter !important;
        font-size: 0.9rem !important;
        & fieldset { border-color: rgba(124,77,255,0.12) !important; }
        &:hover fieldset { border-color: ${p => p.accentcolor ? p.accentcolor + '50' : 'rgba(124,77,255,0.35)'} !important; }
        &.Mui-focused fieldset {
            border-color: ${p => p.accentcolor || '#7C4DFF'} !important;
            border-width: 1.5px !important;
            box-shadow: 0 0 0 3px ${p => p.accentcolor ? p.accentcolor + '14' : 'rgba(124,77,255,0.08)'};
        }
    }
    & .MuiInputLabel-root { color: rgba(226,232,255,0.38) !important; font-family: Inter !important; font-size: 0.875rem !important; }
    & .MuiInputLabel-root.Mui-focused { color: ${p => p.accentcolor || '#7C4DFF'} !important; }
`;

const HintBox = styled.div`
    font-size: 0.72rem;
    color: rgba(200,210,255,0.4);
    background: rgba(124,77,255,0.05);
    border: 1px solid rgba(124,77,255,0.1);
    border-radius: 8px;
    padding: 8px 12px;
    line-height: 1.5;
    strong { color: rgba(200,210,255,0.65); }
`;

const RowBetween = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 4px 0;
`;

const SubmitBtn = styled.button`
    width: 100%;
    padding: 14px;
    border-radius: 13px;
    border: none;
    background: ${p => p.gradient};
    color: white;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9375rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    cursor: pointer;
    box-shadow: 0 8px 28px ${p => p.glow};
    transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 8px;

    &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 14px 36px ${p => p.glow}; }
    &:active:not(:disabled) { transform: scale(0.98); }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const RegisterHint = styled.div`
    text-align: center;
    font-size: 0.8125rem;
    color: rgba(226,232,255,0.4);
    font-family: Inter, sans-serif;
    margin-top: 12px;
`;

/* ── Visual panel (right 56%) ── */
const VisualPanel = styled.div`
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #040610;
    position: relative;
    overflow: hidden;

    @media (max-width: 768px) { display: none; }
`;

const VisualContent = styled.div`
    position: relative;
    z-index: 2;
    max-width: 460px;
    padding: 40px;
    animation: ${slideUp} 0.8s 0.1s cubic-bezier(0.16,1,0.3,1) both;
`;

/* Floating hero card */
const HeroCard = styled.div`
    width: 220px;
    height: 220px;
    border-radius: 28px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(20px);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 40px;
    position: relative;
    overflow: hidden;
    animation: ${float} 6s ease-in-out infinite;
    box-shadow: 0 24px 64px rgba(0,0,0,0.4);
`;

const HeroCardInner = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    position: relative;
    z-index: 2;
`;

const HeroGlow = styled.div`
    position: absolute;
    inset: 0;
    background: ${p => p.gradient};
    opacity: 0.12;
`;

const HeroIconRing = styled.div`
    width: 64px;
    height: 64px;
    border-radius: 18px;
    background: ${p => p.gradient};
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
`;

const HeroCardTitle = styled.div`
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    color: #F5F5FF;
    letter-spacing: -0.02em;
`;

const HeroCardSub = styled.div`
    font-size: 0.72rem;
    font-weight: 600;
    color: rgba(226,232,255,0.4);
    letter-spacing: 0.04em;
`;

const VisualHeadline = styled.div`
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: clamp(1.4rem, 2.5vw, 1.75rem);
    font-weight: 800;
    color: #F5F5FF;
    letter-spacing: -0.03em;
    line-height: 1.25;
    margin-bottom: 24px;
`;

const FeatureList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 36px;
`;

const FeatureItem = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: Inter, sans-serif;
    font-size: 0.875rem;
    color: rgba(226,232,255,0.65);
    font-weight: 500;
`;

const FeatureCheck = styled.div`
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${p => p.color}18;
    border: 1px solid ${p => p.color}30;
    color: ${p => p.color};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const StatRow = styled.div`
    display: flex;
    gap: 12px;
`;

const StatChip = styled.div`
    flex: 1;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(124,77,255,0.1);
    border-radius: 14px;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition: border-color 0.2s ease;
    &:hover { border-color: rgba(124,77,255,0.2); }
`;

const StatVal = styled.div`
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1.1rem;
    font-weight: 800;
    color: #F5F5FF;
    letter-spacing: -0.025em;
`;

const StatLabel = styled.div`
    font-size: 0.62rem;
    font-weight: 700;
    color: rgba(226,232,255,0.35);
    text-transform: uppercase;
    letter-spacing: 0.08em;
`;
