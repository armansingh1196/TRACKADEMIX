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
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { loginUser } from '../redux/userRelated/userHandle';
import styled, { keyframes } from 'styled-components';
import Popup from '../components/Popup';
import AppTextField from '../components/common/AppTextField';

const ROLE_CONFIG = {
    Admin: {
        gradient: 'linear-gradient(135deg, #7C4DFF 0%, #B07AFE 100%)',
        glow: 'rgba(124,77,255,0.45)',
        orbGlow: 'rgba(124,77,255,0.18)',
        color: '#B07AFE',
        border: 'rgba(124,77,255,0.35)',
        chip: 'rgba(124,77,255,0.12)',
        chipBorder: 'rgba(124,77,255,0.25)',
        Icon: AdminPanelSettingsOutlinedIcon,
        tagline: 'Institution Control',
        label: 'Administrator',
        permissions: ['Manage Users', 'View Reports', 'System Settings'],
        desc: 'Full control over institutional data, student records, and faculty assignments.',
        back: '/choose',
    },
    Student: {
        gradient: 'linear-gradient(135deg, #448AFF 0%, #82B1FF 100%)',
        glow: 'rgba(68,138,255,0.45)',
        orbGlow: 'rgba(68,138,255,0.18)',
        color: '#82B1FF',
        border: 'rgba(68,138,255,0.35)',
        chip: 'rgba(68,138,255,0.12)',
        chipBorder: 'rgba(68,138,255,0.25)',
        Icon: SchoolOutlinedIcon,
        tagline: 'Academic Portal',
        label: 'Student',
        permissions: ['View Marks', 'Attendance', 'AI Insights'],
        desc: 'Access your courses, attendance records, exam results, and AI-driven performance insights.',
        back: '/choose',
    },
    Teacher: {
        gradient: 'linear-gradient(135deg, #2DD4BF 0%, #5EEAD4 100%)',
        glow: 'rgba(45,212,191,0.4)',
        orbGlow: 'rgba(45,212,191,0.15)',
        color: '#5EEAD4',
        border: 'rgba(45,212,191,0.3)',
        chip: 'rgba(45,212,191,0.1)',
        chipBorder: 'rgba(45,212,191,0.22)',
        Icon: MenuBookOutlinedIcon,
        tagline: 'Faculty Dashboard',
        label: 'Educator',
        permissions: ['Mark Attendance', 'Grade Students', 'View Classes'],
        desc: 'Manage class sessions, track student progress, and evaluate assignments.',
        back: '/choose',
    },
};

const LoginPage = ({ role }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status, currentUser, response, currentRole } = useSelector(s => s.user);
    const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.Admin;
    const RoleIcon = cfg.Icon;

    const [toggle, setToggle]       = useState(false);
    const [loader, setLoader]       = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage]     = useState('');
    const [errors, setErrors]       = useState({});

    const clearErr = name => setErrors(p => ({ ...p, [name]: false }));

    const handleSubmit = e => {
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
            if (currentRole === 'Admin') navigate('/Admin/dashboard');
            else if (currentRole === 'Student') navigate('/Student/dashboard');
            else if (currentRole === 'Teacher') navigate('/Teacher/dashboard');
        } else if (status === 'failed') {
            setMessage(response); setShowPopup(true); setLoader(false);
        } else if (status === 'error') {
            setMessage('Network Error — server may be down.'); setShowPopup(true); setLoader(false);
        }
    }, [status, currentUser, currentRole, navigate, response]);

    return (
        <PageRoot>
            <CssBaseline />

            {/* ── LEFT FORM PANEL ── */}
            <FormPanel>
                <Orb style={{ top: '-25%', left: '-20%', width: 500, height: 500, background: `radial-gradient(circle, ${cfg.orbGlow} 0%, transparent 70%)` }} />
                <Orb style={{ bottom: '-20%', right: '-10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(68,138,255,0.08) 0%, transparent 70%)' }} />

                <FormCard>
                    {/* Top: back + brand */}
                    <FormTop>
                        <BackBtn onClick={() => navigate(cfg.back)}>
                            <ArrowBackIosNewIcon sx={{ fontSize: 11 }} /> Back
                        </BackBtn>
                        <Brand onClick={() => navigate('/')}>TRACAD<span>EMIX</span></Brand>
                    </FormTop>

                    {/* Role chip */}
                    <RoleChip color={cfg.color} chip={cfg.chip} chipBorder={cfg.chipBorder}>
                        <RoleIcon sx={{ fontSize: 13 }} />
                        {cfg.tagline}
                    </RoleChip>

                    {/* Heading */}
                    <FormHeading>
                        <h1>Welcome back</h1>
                        <p>Sign in to your <ColorSpan color={cfg.color}>{cfg.label}</ColorSpan> portal</p>
                    </FormHeading>

                    {/* Fields */}
                    <FormFields component="form" noValidate onSubmit={handleSubmit}>
                        {role === 'Student' ? (<>
                            <Field label="Roll Number" name="rollNum" id="rollNum" autoFocus
                                error={errors.rollNum} helperText={errors.rollNum && 'Required'}
                                onChange={e => clearErr(e.target.name)} accentcolor={cfg.color}
                                InputProps={{ startAdornment: <InputAdornment position="start"><BadgeOutlined sx={{ color: 'rgba(226,232,255,0.25)', fontSize: 18 }} /></InputAdornment> }}
                            />
                            <Field label="Full Name" name="studentName" id="studentName"
                                error={errors.studentName} helperText={errors.studentName && 'Required'}
                                onChange={e => clearErr(e.target.name)} accentcolor={cfg.color}
                                InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlined sx={{ color: 'rgba(226,232,255,0.25)', fontSize: 18 }} /></InputAdornment> }}
                            />
                        </>) : (
                            <Field label="Email Address" name="email" id="email" autoFocus
                                error={errors.email} helperText={errors.email && 'Required'}
                                onChange={e => clearErr(e.target.name)} accentcolor={cfg.color}
                                InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color: 'rgba(226,232,255,0.25)', fontSize: 18 }} /></InputAdornment> }}
                            />
                        )}

                        <Field label="Password" name="password" id="password"
                            type={toggle ? 'text' : 'password'}
                            error={errors.password} helperText={errors.password && 'Required'}
                            onChange={e => clearErr(e.target.name)} accentcolor={cfg.color}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: 'rgba(226,232,255,0.25)', fontSize: 18 }} /></InputAdornment>,
                                endAdornment: <InputAdornment position="end">
                                    <IconButton onClick={() => setToggle(!toggle)} edge="end" sx={{ color: 'rgba(226,232,255,0.3)' }}>
                                        {toggle ? <Visibility sx={{ fontSize: 17 }} /> : <VisibilityOff sx={{ fontSize: 17 }} />}
                                    </IconButton>
                                </InputAdornment>,
                            }}
                        />

                        {role === 'Student' && (
                            <HintBox>
                                Default: <strong>CapitalizedName@BirthYearLast3Roll</strong>
                            </HintBox>
                        )}

                        <FormRow>
                            <FormControlLabel
                                control={<Checkbox size="small" sx={{ color: 'rgba(226,232,255,0.2)', '&.Mui-checked': { color: cfg.color }, p: '5px' }} />}
                                label={<Typography sx={{ fontSize: '0.8rem', color: 'rgba(226,232,255,0.4)', fontFamily: 'Inter' }}>Keep me signed in</Typography>}
                            />
                            <Link to="/" style={{ fontSize: '0.8rem', color: cfg.color, fontWeight: 600, textDecoration: 'none', fontFamily: 'Inter' }}>
                                Forgot?
                            </Link>
                        </FormRow>

                        <SubmitBtn type="submit" disabled={loader} gradient={cfg.gradient} glow={cfg.glow}>
                            {loader
                                ? <CircularProgress size={18} color="inherit" />
                                : <><span>Enter {role} Portal</span><ArrowForwardIcon sx={{ fontSize: 16 }} /></>
                            }
                        </SubmitBtn>

                        {role === 'Admin' && (
                            <RegisterNote>
                                New institution? <Link to="/Adminregister" style={{ color: cfg.color, fontWeight: 600, textDecoration: 'none' }}>Register here</Link>
                            </RegisterNote>
                        )}
                    </FormFields>
                </FormCard>
            </FormPanel>

            {/* ── RIGHT VISUAL PANEL — the ChooseUser card, hero-sized ── */}
            <VisualPanel>
                <Orb style={{ top: '-10%', right: '-8%', width: 650, height: 650, background: `radial-gradient(circle, ${cfg.glow} 0%, transparent 60%)` }} />
                <Orb style={{ bottom: '-15%', left: '-5%', width: 450, height: 450, background: 'radial-gradient(circle, rgba(68,138,255,0.12) 0%, transparent 65%)' }} />

                <HeroCard>
                    {/* Shimmer sweep */}
                    <Shimmer />

                    {/* Gradient hero zone — exact ChooseUser card top */}
                    <HeroTop gradient={cfg.gradient}>
                        <HeroIconRing>
                            <RoleIcon sx={{ fontSize: 44, color: 'white' }} />
                        </HeroIconRing>
                        <HeroBlob style={{ top: '-20%', right: '-10%', width: 160, height: 160 }} />
                        <HeroBlob style={{ bottom: '-10%', left: '-8%', width: 100, height: 100, opacity: 0.5 }} />
                        <HeroTopFade />
                    </HeroTop>

                    {/* Card body */}
                    <HeroBody>
                        <HeroTagline color={cfg.color}>{cfg.tagline}</HeroTagline>
                        <HeroTitle>{cfg.label}</HeroTitle>
                        <HeroDesc>{cfg.desc}</HeroDesc>

                        {/* Permission chips — same as ChooseUser */}
                        <ChipRow>
                            {cfg.permissions.map(p => (
                                <PermChip key={p} bg={cfg.chip} border={cfg.chipBorder} color={cfg.color}>{p}</PermChip>
                            ))}
                        </ChipRow>

                        {/* CTA row — same gradient as ChooseUser */}
                        <HeroCTA gradient={cfg.gradient} glow={cfg.glow}>
                            <span>Your portal awaits</span>
                            <ArrowForwardIcon sx={{ fontSize: 16 }} />
                        </HeroCTA>
                    </HeroBody>
                </HeroCard>
            </VisualPanel>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </PageRoot>
    );
};

export default LoginPage;

/* ── Keyframes ── */
const slideUp = keyframes`from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}`;
const floatCard = keyframes`0%,100%{transform:translateY(0) rotate(-0.5deg)}50%{transform:translateY(-14px) rotate(0.5deg)}`;
const shimmerSlide = keyframes`from{transform:translateX(-100%) skewX(-12deg)}to{transform:translateX(350%) skewX(-12deg)}`;
const orbDrift = keyframes`0%,100%{transform:translate(0,0)}40%{transform:translate(18px,-12px)}70%{transform:translate(-10px,8px)}`;

/* ── Root ── */
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
    animation: ${orbDrift} 16s ease-in-out infinite;
`;

/* ── Form panel (left ~44%) ── */
const FormPanel = styled.div`
    width: 44%;
    min-width: 340px;
    height: 100%;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(6,8,24,0.98);
    border-right: 1px solid rgba(124,77,255,0.07);
    flex-shrink: 0;

    @media(max-width: 768px){ width: 100%; border-right: none; }
`;

const FormCard = styled.div`
    width: 100%;
    max-width: 400px;
    padding: 32px 36px;
    position: relative;
    z-index: 2;
    animation: ${slideUp} 0.55s cubic-bezier(0.16,1,0.3,1) both;

    @media(max-width: 480px){ padding: 24px 20px; }
`;

const FormTop = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
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
    &:hover { background: rgba(124,77,255,0.08); color: #F5F5FF; border-color: rgba(124,77,255,0.22); }
`;

const Brand = styled.div`
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1rem;
    font-weight: 800;
    color: #F5F5FF;
    letter-spacing: -0.025em;
    cursor: pointer;
    span { color: #7C4DFF; }
`;

const RoleChip = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: ${p => p.color};
    background: ${p => p.chip};
    border: 1px solid ${p => p.chipBorder};
    border-radius: 100px;
    padding: 4px 11px;
    margin-bottom: 14px;
`;

const FormHeading = styled.div`
    margin-bottom: 26px;
    h1 {
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: clamp(1.55rem, 3vw, 2rem);
        font-weight: 800;
        color: #F5F5FF;
        letter-spacing: -0.035em;
        line-height: 1.1;
        margin: 0 0 7px;
    }
    p {
        font-size: 0.875rem;
        color: rgba(226,232,255,0.42);
        font-family: Inter, sans-serif;
        margin: 0;
        letter-spacing: -0.011em;
    }
`;

const ColorSpan = styled.span`
    color: ${p => p.color};
    font-weight: 600;
`;

const FormFields = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const Field = styled(AppTextField)`
    & .MuiOutlinedInput-root {
        background: rgba(255,255,255,0.03) !important;
        color: #F5F5FF !important;
        border-radius: 13px !important;
        font-family: Inter !important;
        font-size: 0.875rem !important;
        & fieldset { border-color: rgba(124,77,255,0.1) !important; }
        &:hover fieldset { border-color: ${p => p.accentcolor ? p.accentcolor + '45' : 'rgba(124,77,255,0.3)'} !important; }
        &.Mui-focused fieldset {
            border-color: ${p => p.accentcolor || '#7C4DFF'} !important;
            border-width: 1.5px !important;
            box-shadow: 0 0 0 3px ${p => p.accentcolor ? p.accentcolor + '12' : 'rgba(124,77,255,0.08)'};
        }
    }
    & .MuiInputLabel-root { color: rgba(226,232,255,0.32) !important; font-family: Inter !important; font-size: 0.875rem !important; }
    & .MuiInputLabel-root.Mui-focused { color: ${p => p.accentcolor || '#7C4DFF'} !important; }
    & .MuiFormHelperText-root { color: #F87171 !important; margin-left: 4px; }
`;

const HintBox = styled.div`
    font-size: 0.7rem;
    color: rgba(200,210,255,0.38);
    background: rgba(124,77,255,0.04);
    border: 1px solid rgba(124,77,255,0.1);
    border-radius: 9px;
    padding: 8px 12px;
    line-height: 1.5;
    strong { color: rgba(200,210,255,0.6); font-weight: 600; }
`;

const FormRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 2px 0;
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
    margin-top: 4px;

    &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 16px 40px ${p => p.glow}; }
    &:active:not(:disabled) { transform: scale(0.98); }
    &:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
`;

const RegisterNote = styled.div`
    text-align: center;
    font-size: 0.8rem;
    color: rgba(226,232,255,0.38);
    font-family: Inter, sans-serif;
    margin-top: 4px;
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

    @media(max-width: 768px){ display: none; }
`;

/* Hero card — exact ChooseUser card DNA, blown up */
const HeroCard = styled.div`
    position: relative;
    width: 340px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 28px;
    overflow: hidden;
    z-index: 2;
    animation: ${floatCard} 7s ease-in-out infinite;
    box-shadow: 0 40px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04);

    &:hover .shimmer { animation: ${shimmerSlide} 0.7s ease forwards; }
`;

const Shimmer = styled.div.attrs({ className: 'shimmer' })`
    position: absolute;
    top: 0; left: 0;
    width: 40%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
    transform: translateX(-100%) skewX(-12deg);
    pointer-events: none;
    z-index: 10;
`;

const HeroTop = styled.div`
    height: 220px;
    background: ${p => p.gradient};
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;

    &::after {
        content: '';
        position: absolute;
        bottom: 0; left: 0; right: 0;
        height: 50px;
        background: linear-gradient(to bottom, transparent, rgba(4,6,16,0.55));
    }
`;

const HeroTopFade = styled.div`
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 60px;
    background: linear-gradient(to bottom, transparent, rgba(6,8,24,0.4));
`;

const HeroIconRing = styled.div`
    width: 88px;
    height: 88px;
    border-radius: 24px;
    background: rgba(255,255,255,0.18);
    border: 1px solid rgba(255,255,255,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3);
    position: relative;
    z-index: 2;
`;

const HeroBlob = styled.div`
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.07);
`;

const HeroBody = styled.div`
    padding: 24px 26px 28px;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const HeroTagline = styled.div`
    font-family: Inter, sans-serif;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${p => p.color};
`;

const HeroTitle = styled.div`
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
    color: #F5F5FF;
    letter-spacing: -0.025em;
    line-height: 1.1;
`;

const HeroDesc = styled.div`
    font-family: Inter, sans-serif;
    font-size: 0.8rem;
    color: rgba(226,232,255,0.42);
    line-height: 1.6;
    letter-spacing: -0.01em;
`;

const ChipRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 2px;
`;

const PermChip = styled.div`
    font-family: Inter, sans-serif;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    padding: 3px 9px;
    border-radius: 100px;
    background: ${p => p.bg};
    border: 1px solid ${p => p.border};
    color: ${p => p.color};
`;

const HeroCTA = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-radius: 13px;
    background: ${p => p.gradient};
    box-shadow: 0 4px 20px ${p => p.glow};
    margin-top: 6px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.8125rem;
    font-weight: 700;
    color: white;
    letter-spacing: -0.01em;
`;
