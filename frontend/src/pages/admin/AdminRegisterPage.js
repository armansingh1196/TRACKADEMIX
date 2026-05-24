import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CssBaseline, IconButton, InputAdornment, CircularProgress, Autocomplete } from '@mui/material';
import { Visibility, VisibilityOff, PersonOutlined, EmailOutlined, LockOutlined, BusinessOutlined } from '@mui/icons-material';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { registerUser } from '../../redux/userRelated/userHandle';
import styled, { keyframes } from 'styled-components';
import Popup from '../../components/Popup';
import AppTextField from '../../components/common/AppTextField';

const branches = [
    'Computer Science & Engineering','Information Technology','Mechanical Engineering',
    'Mining Engineering','Metallurgical Engineering','Electrical Engineering',
    'Electronics and Communication Engineering','Cybersecurity','Civil Engineering','Chemical Engineering'
];

const suggestions = ['BIT Mesra','IIM Ranchi','St. Xavier\'s College','IIT Delhi','Mumbai University'];

const FEATURES = [
    'Complete student & faculty management',
    'Automated attendance tracking system',
    'AI-powered performance analytics',
    'Institutional notice board',
];

const AdminRegisterPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status, currentUser, response, currentRole } = useSelector(s => s.user);

    const [toggle, setToggle]         = useState(false);
    const [loader, setLoader]         = useState(false);
    const [showPopup, setShowPopup]   = useState(false);
    const [message, setMessage]       = useState('');
    const [branch, setBranch]         = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [branchOpen, setBranchOpen] = useState(false);
    const [errors, setErrors]         = useState({});

    const clearErr = name => setErrors(p => ({ ...p, [name]: false }));

    const handleSubmit = e => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const name = fd.get('adminName'), email = fd.get('email'), password = fd.get('password');
        const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const errs = {};
        if (!name) errs.adminName = true;
        if (!schoolName) errs.schoolName = true;
        if (!branch) errs.branch = true;
        if (!email || !emailRx.test(email)) errs.email = true;
        if (!password) errs.password = true;
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoader(true);
        dispatch(registerUser({ name, email, password, role: 'Admin', schoolName, branch }, 'Admin'));
    };

    useEffect(() => {
        if (status === 'success' || (currentUser !== null && currentRole === 'Admin')) {
            navigate('/Admin/dashboard');
        } else if (status === 'failed') {
            setMessage(response); setShowPopup(true); setLoader(false);
        } else if (status === 'error') {
            setMessage('Network Error — server may be down.'); setShowPopup(true); setLoader(false);
        }
    }, [status, currentUser, currentRole, navigate, response]);

    return (
        <PageRoot>
            <CssBaseline />

            {/* ── LEFT FORM ── */}
            <FormPanel>
                <Orb style={{ top: '-25%', left: '-20%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(124,77,255,0.14) 0%, transparent 70%)' }} />

                <FormScroll>
                    <FormContent>
                        <FormTop>
                            <BackBtn onClick={() => navigate('/')}>
                                <ArrowBackIosNewIcon sx={{ fontSize: 11 }} /> Back
                            </BackBtn>
                            <Brand onClick={() => navigate('/')}>TRACAD<span>EMIX</span></Brand>
                        </FormTop>

                        <RoleChip>
                            <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 13 }} />
                            Institution Control
                        </RoleChip>

                        <FormHeading>
                            <h1>Register Your Institution</h1>
                            <p>Set up your administrative portal and start managing your department.</p>
                        </FormHeading>

                        <FormFields component="form" noValidate onSubmit={handleSubmit}>
                            <Row2>
                                <Field label="Administrator Name" name="adminName" id="adminName" autoFocus
                                    error={errors.adminName} helperText={errors.adminName && 'Required'}
                                    onChange={e => clearErr(e.target.name)}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlined sx={{ color: 'rgba(226,232,255,0.25)', fontSize: 18 }} /></InputAdornment> }}
                                />
                                <Autocomplete freeSolo options={suggestions} value={schoolName}
                                    onInputChange={(_, v) => { setSchoolName(v); clearErr('schoolName'); }}
                                    renderInput={params => (
                                        <Field {...params} label="Institution Name" name="schoolName"
                                            error={errors.schoolName} helperText={errors.schoolName && 'Required'}
                                            InputProps={{ ...params.InputProps, startAdornment: <InputAdornment position="start"><BusinessOutlined sx={{ color: 'rgba(226,232,255,0.25)', fontSize: 18 }} /></InputAdornment> }}
                                        />
                                    )}
                                />
                            </Row2>

                            {/* Branch selector */}
                            <DropdownWrap error={errors.branch}>
                                <DropLabel>Department / Branch</DropLabel>
                                <DropTrigger onClick={() => setBranchOpen(p => !p)} type="button" error={errors.branch}>
                                    <span style={{ color: branch ? '#F5F5FF' : 'rgba(226,232,255,0.28)' }}>
                                        {branch || 'Select branch…'}
                                    </span>
                                    <KeyboardArrowDownIcon sx={{ fontSize: 18, color: 'rgba(226,232,255,0.3)', transform: branchOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                                </DropTrigger>
                                {branchOpen && (
                                    <DropList>
                                        {branches.map(b => (
                                            <DropItem key={b} active={branch === b} onClick={() => { setBranch(b); setBranchOpen(false); clearErr('branch'); }}>
                                                {branch === b && <CheckRoundedIcon sx={{ fontSize: 13 }} />}
                                                {b}
                                            </DropItem>
                                        ))}
                                    </DropList>
                                )}
                                {errors.branch && <DropError>Required</DropError>}
                            </DropdownWrap>

                            <Field label="Email Address" name="email" id="email"
                                error={errors.email} helperText={errors.email && 'Invalid email'}
                                onChange={e => clearErr(e.target.name)}
                                InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ color: 'rgba(226,232,255,0.25)', fontSize: 18 }} /></InputAdornment> }}
                            />

                            <Field label="Password" name="password" id="password"
                                type={toggle ? 'text' : 'password'}
                                error={errors.password} helperText={errors.password && 'Required'}
                                onChange={e => clearErr(e.target.name)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><LockOutlined sx={{ color: 'rgba(226,232,255,0.25)', fontSize: 18 }} /></InputAdornment>,
                                    endAdornment: <InputAdornment position="end">
                                        <IconButton onClick={() => setToggle(!toggle)} edge="end" sx={{ color: 'rgba(226,232,255,0.3)' }}>
                                            {toggle ? <Visibility sx={{ fontSize: 17 }} /> : <VisibilityOff sx={{ fontSize: 17 }} />}
                                        </IconButton>
                                    </InputAdornment>,
                                }}
                            />

                            <SubmitBtn type="submit" disabled={loader}>
                                {loader
                                    ? <CircularProgress size={18} color="inherit" />
                                    : <><span>Register Institution</span><ArrowForwardIcon sx={{ fontSize: 16 }} /></>
                                }
                            </SubmitBtn>

                            <LoginNote>
                                Already registered? <Link to="/Adminlogin" style={{ color: '#9B6FF8', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                            </LoginNote>
                        </FormFields>
                    </FormContent>
                </FormScroll>
            </FormPanel>

            {/* ── RIGHT PANEL — Admin Hero Card ── */}
            <VisualPanel>
                <Orb style={{ top: '-10%', right: '-8%', width: 650, height: 650, background: 'radial-gradient(circle, rgba(124,77,255,0.45) 0%, transparent 60%)' }} />
                <Orb style={{ bottom: '-15%', left: '-5%', width: 450, height: 450, background: 'radial-gradient(circle, rgba(68,138,255,0.12) 0%, transparent 65%)' }} />

                <HeroCard>
                    <Shimmer />
                    <HeroTop>
                        <HeroIconRing>
                            <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 44, color: 'white' }} />
                        </HeroIconRing>
                        <HeroBlob style={{ top: '-20%', right: '-10%', width: 160, height: 160 }} />
                        <HeroBlob style={{ bottom: '-10%', left: '-8%', width: 100, height: 100, opacity: 0.5 }} />
                    </HeroTop>

                    <HeroBody>
                        <HeroTagline>Institution Control</HeroTagline>
                        <HeroTitle>Administrator</HeroTitle>
                        <HeroDesc>Full control over institutional data, student records, faculty assignments, and system configuration.</HeroDesc>

                        <ChipRow>
                            {['Manage Users','View Reports','System Settings'].map(p => (
                                <PermChip key={p}>{p}</PermChip>
                            ))}
                        </ChipRow>

                        <FeatureList>
                            {FEATURES.map(f => (
                                <FeatureItem key={f}>
                                    <FeatureCheck><CheckRoundedIcon sx={{ fontSize: 11 }} /></FeatureCheck>
                                    {f}
                                </FeatureItem>
                            ))}
                        </FeatureList>

                        <HeroCTA>
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

export default AdminRegisterPage;

/* ── Keyframes ── */
const slideUp  = keyframes`from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}`;
const floatCard = keyframes`0%,100%{transform:translateY(0) rotate(-0.5deg)}50%{transform:translateY(-12px) rotate(0.5deg)}`;
const shimmerSlide = keyframes`from{transform:translateX(-100%) skewX(-12deg)}to{transform:translateX(350%) skewX(-12deg)}`;

const PageRoot = styled.div`height:100vh;overflow:hidden;display:flex;background:#060818;`;

const Orb = styled.div`position:absolute;border-radius:50%;pointer-events:none;`;

/* Form */
const FormPanel = styled.div`
    width:44%;min-width:340px;height:100%;position:relative;overflow:hidden;
    display:flex;align-items:stretch;background:rgba(6,8,24,0.98);
    border-right:1px solid rgba(124,77,255,0.07);flex-shrink:0;
    @media(max-width:768px){width:100%;border-right:none;}
`;
const FormScroll = styled.div`
    flex:1;overflow-y:auto;display:flex;align-items:flex-start;justify-content:center;padding:32px 0;
    &::-webkit-scrollbar{width:4px}&::-webkit-scrollbar-track{background:transparent}
    &::-webkit-scrollbar-thumb{background:rgba(124,77,255,0.2);border-radius:10px}
`;
const FormContent = styled.div`
    width:100%;max-width:420px;padding:0 36px;position:relative;z-index:2;
    animation:${slideUp} 0.55s cubic-bezier(0.16,1,0.3,1) both;
    @media(max-width:480px){padding:0 20px;}
`;
const FormTop = styled.div`display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;`;
const BackBtn = styled.button`
    display:flex;align-items:center;gap:5px;background:rgba(255,255,255,0.04);border:1px solid rgba(124,77,255,0.1);
    border-radius:100px;color:rgba(226,232,255,0.5);font-family:Inter,sans-serif;font-size:0.72rem;font-weight:600;
    padding:6px 12px;cursor:pointer;transition:all 0.2s ease;
    &:hover{background:rgba(124,77,255,0.08);color:#F5F5FF;border-color:rgba(124,77,255,0.22);}
`;
const Brand = styled.div`
    font-family:'Plus Jakarta Sans',sans-serif;font-size:1rem;font-weight:800;color:#F5F5FF;
    letter-spacing:-0.025em;cursor:pointer;span{color:#7C4DFF;}
`;
const RoleChip = styled.div`
    display:inline-flex;align-items:center;gap:6px;font-size:0.6rem;font-weight:700;letter-spacing:0.09em;
    text-transform:uppercase;color:#9B6FF8;background:rgba(124,77,255,0.12);border:1px solid rgba(124,77,255,0.25);
    border-radius:100px;padding:4px 11px;margin-bottom:14px;
`;
const FormHeading = styled.div`
    margin-bottom:24px;
    h1{font-family:'Plus Jakarta Sans',sans-serif;font-size:clamp(1.45rem,2.8vw,1.9rem);font-weight:800;
       color:#F5F5FF;letter-spacing:-0.035em;line-height:1.1;margin:0 0 7px;}
    p{font-size:0.8rem;color:rgba(226,232,255,0.4);font-family:Inter,sans-serif;margin:0;line-height:1.5;}
`;
const FormFields = styled(Box)`display:flex;flex-direction:column;gap:12px;`;
const Row2 = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:12px;@media(max-width:500px){grid-template-columns:1fr;}`;
const Field = styled(AppTextField)`
    & .MuiOutlinedInput-root{
        background:rgba(255,255,255,0.03)!important;color:#F5F5FF!important;border-radius:13px!important;
        font-family:Inter!important;font-size:0.875rem!important;
        & fieldset{border-color:rgba(124,77,255,0.1)!important;}
        &:hover fieldset{border-color:rgba(124,77,255,0.3)!important;}
        &.Mui-focused fieldset{border-color:#7C4DFF!important;border-width:1.5px!important;box-shadow:0 0 0 3px rgba(124,77,255,0.08);}
    }
    & .MuiInputLabel-root{color:rgba(226,232,255,0.32)!important;font-family:Inter!important;font-size:0.875rem!important;}
    & .MuiInputLabel-root.Mui-focused{color:#7C4DFF!important;}
    & .MuiFormHelperText-root{color:#F87171!important;margin-left:4px;}
`;
/* Branch dropdown */
const DropdownWrap = styled.div`position:relative;`;
const DropLabel = styled.div`
    font-size:0.62rem;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;
    color:rgba(200,210,255,0.38);margin-bottom:6px;font-family:Inter,sans-serif;
`;
const DropTrigger = styled.button`
    width:100%;display:flex;align-items:center;justify-content:space-between;
    background:rgba(255,255,255,0.03);border:1px solid ${p=>p.error?'rgba(248,113,113,0.4)':'rgba(124,77,255,0.12)'};
    border-radius:13px;padding:11px 14px;font-family:Inter,sans-serif;font-size:0.875rem;
    cursor:pointer;transition:border-color 0.18s;
    &:hover{border-color:rgba(124,77,255,0.3);}
    &:focus{outline:none;border-color:#7C4DFF;box-shadow:0 0 0 3px rgba(124,77,255,0.08);}
`;
const DropList = styled.div`
    position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:100;
    background:rgba(10,8,28,0.97);border:1px solid rgba(124,77,255,0.2);border-radius:13px;
    padding:6px;max-height:200px;overflow-y:auto;box-shadow:0 16px 48px rgba(0,0,0,0.5);
    &::-webkit-scrollbar{width:4px}&::-webkit-scrollbar-thumb{background:rgba(124,77,255,0.2);border-radius:10px;}
`;
const DropItem = styled.div`
    display:flex;align-items:center;gap:7px;padding:9px 12px;border-radius:8px;font-size:0.8rem;
    font-family:Inter,sans-serif;color:${p=>p.active?'#9B6FF8':'rgba(226,232,255,0.7)'};
    background:${p=>p.active?'rgba(124,77,255,0.1)':'transparent'};cursor:pointer;
    &:hover{background:rgba(124,77,255,0.08);color:#F5F5FF;}
`;
const DropError = styled.div`font-size:0.68rem;color:#F87171;margin-top:4px;margin-left:4px;`;
const SubmitBtn = styled.button`
    width:100%;padding:14px;border-radius:13px;border:none;
    background:linear-gradient(135deg,#7C4DFF 0%,#B07AFE 100%);color:white;
    font-family:'Plus Jakarta Sans',sans-serif;font-size:0.9375rem;font-weight:700;letter-spacing:-0.01em;
    cursor:pointer;box-shadow:0 8px 28px rgba(124,77,255,0.4);
    transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1);display:flex;align-items:center;justify-content:center;gap:8px;
    &:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 16px 40px rgba(124,77,255,0.5);}
    &:active:not(:disabled){transform:scale(0.98);}
    &:disabled{opacity:0.55;cursor:not-allowed;transform:none;}
`;
const LoginNote = styled.div`text-align:center;font-size:0.8rem;color:rgba(226,232,255,0.38);font-family:Inter,sans-serif;`;

/* Visual panel */
const VisualPanel = styled.div`
    flex:1;height:100%;display:flex;align-items:center;justify-content:center;
    background:#040610;position:relative;overflow:hidden;
    @media(max-width:768px){display:none;}
`;
const HeroCard = styled.div`
    position:relative;width:340px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);
    border-radius:28px;overflow:hidden;z-index:2;animation:${floatCard} 7s ease-in-out infinite;
    box-shadow:0 40px 80px rgba(0,0,0,0.55),0 0 0 1px rgba(255,255,255,0.04);
    &:hover .shimmer{animation:${shimmerSlide} 0.7s ease forwards;}
`;
const Shimmer = styled.div.attrs({className:'shimmer'})`
    position:absolute;top:0;left:0;width:40%;height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent);
    transform:translateX(-100%) skewX(-12deg);pointer-events:none;z-index:10;
`;
const HeroTop = styled.div`
    height:200px;background:linear-gradient(135deg,#7C4DFF 0%,#B07AFE 100%);
    display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;
    &::after{content:'';position:absolute;bottom:0;left:0;right:0;height:50px;background:linear-gradient(to bottom,transparent,rgba(4,6,16,0.55));}
`;
const HeroIconRing = styled.div`
    width:84px;height:84px;border-radius:22px;background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.3);
    display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);
    box-shadow:0 8px 32px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.3);position:relative;z-index:2;
`;
const HeroBlob = styled.div`position:absolute;border-radius:50%;background:rgba(255,255,255,0.07);`;
const HeroBody = styled.div`padding:22px 24px 26px;display:flex;flex-direction:column;gap:9px;`;
const HeroTagline = styled.div`font-family:Inter,sans-serif;font-size:0.62rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#B07AFE;`;
const HeroTitle = styled.div`font-family:'Plus Jakarta Sans',sans-serif;font-size:1.4rem;font-weight:800;color:#F5F5FF;letter-spacing:-0.025em;`;
const HeroDesc = styled.div`font-family:Inter,sans-serif;font-size:0.78rem;color:rgba(226,232,255,0.42);line-height:1.6;`;
const ChipRow = styled.div`display:flex;flex-wrap:wrap;gap:5px;`;
const PermChip = styled.div`
    font-family:Inter,sans-serif;font-size:0.6rem;font-weight:700;letter-spacing:0.02em;
    padding:3px 9px;border-radius:100px;background:rgba(124,77,255,0.12);
    border:1px solid rgba(124,77,255,0.25);color:#B07AFE;
`;
const FeatureList = styled.div`display:flex;flex-direction:column;gap:7px;`;
const FeatureItem = styled.div`display:flex;align-items:center;gap:8px;font-family:Inter,sans-serif;font-size:0.76rem;color:rgba(226,232,255,0.6);`;
const FeatureCheck = styled.div`
    width:17px;height:17px;border-radius:50%;background:rgba(124,77,255,0.12);border:1px solid rgba(124,77,255,0.25);
    color:#9B6FF8;display:flex;align-items:center;justify-content:center;flex-shrink:0;
`;
const HeroCTA = styled.div`
    display:flex;align-items:center;justify-content:space-between;padding:11px 14px;border-radius:12px;
    background:linear-gradient(135deg,#7C4DFF 0%,#B07AFE 100%);box-shadow:0 4px 20px rgba(124,77,255,0.35);
    font-family:'Plus Jakarta Sans',sans-serif;font-size:0.8rem;font-weight:700;color:white;
`;
