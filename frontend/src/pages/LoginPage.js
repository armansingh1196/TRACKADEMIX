import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Box, Typography, Checkbox, FormControlLabel, CssBaseline, IconButton, InputAdornment, CircularProgress, ThemeProvider, createTheme } from '@mui/material';
import { Visibility, VisibilityOff, SchoolOutlined, EmailOutlined, LockOutlined, PersonOutlined } from '@mui/icons-material';
import { loginUser } from '../redux/userRelated/userHandle';
import styled, { keyframes } from 'styled-components';
import Popup from '../components/Popup';
import AppButton from '../components/common/AppButton';
import AppTextField from '../components/common/AppTextField';

const theme = createTheme({
  palette: { primary: { main: '#7C4DFF' }, secondary: { main: '#448AFF' } },
  typography: { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" },
});

const LoginPage = ({ role }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, currentUser, response, currentRole } = useSelector(state => state.user);

  const [toggle, setToggle] = useState(false);
  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [rollNumError, setRollNumError] = useState(false);
  const [studentNameError, setStudentNameError] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (role === "Student") {
      const rollNum = event.target.rollNum.value;
      const studentName = event.target.studentName.value;
      const password = event.target.password.value;
      if (!rollNum || !studentName || !password) {
        if (!rollNum) setRollNumError(true);
        if (!studentName) setStudentNameError(true);
        if (!password) setPasswordError(true);
        return;
      }
      setLoader(true);
      dispatch(loginUser({ rollNum, studentName, password }, role));
    } else {
      const email = event.target.email.value;
      const password = event.target.password.value;
      if (!email || !password) {
        if (!email) setEmailError(true);
        if (!password) setPasswordError(true);
        return;
      }
      setLoader(true);
      dispatch(loginUser({ email, password }, role));
    }
  };

  const handleInputChange = (event) => {
    const { name } = event.target;
    if (name === 'email') setEmailError(false);
    if (name === 'password') setPasswordError(false);
    if (name === 'rollNum') setRollNumError(false);
    if (name === 'studentName') setStudentNameError(false);
  };

  useEffect(() => {
    if (status === 'success' || currentUser !== null) {
      if (currentRole === 'Admin') navigate('/Admin/dashboard');
      else if (currentRole === 'Student') navigate('/Student/dashboard');
      else if (currentRole === 'Teacher') navigate('/Teacher/dashboard');
    } else if (status === 'failed') {
      setMessage(response);
      setShowPopup(true);
      setLoader(false);
    } else if (status === 'error') {
      setMessage("Network Error or Server is down");
      setShowPopup(true);
      setLoader(false);
    }
  }, [status, currentUser, currentRole, navigate, response]);

  return (
    <ThemeProvider theme={theme}>
      <PageRoot>
        <CssBaseline />
        <Grid container sx={{ height: '100vh', overflow: 'hidden' }}>

          {/* ── Left: Form Panel ── */}
          <Grid item xs={12} md={5} component={Box} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#060818', position: 'relative', zIndex: 2 }}>
            <FormOrb style={{ top: '-20%', left: '-20%', background: 'radial-gradient(circle, rgba(124,77,255,0.12) 0%, transparent 70%)', width: 400, height: 400 }} />
            <FormWrapper>
              {/* Brand */}
              <BrandBox onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <SchoolOutlined sx={{ fontSize: 30, color: '#7C4DFF' }} />
                <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.125rem', color: '#F5F5FF', letterSpacing: '-0.025em' }}>
                  TRACAD<span style={{ color: '#7C4DFF' }}>EMIX</span>
                </Typography>
              </BrandBox>

              {/* Heading */}
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', letterSpacing: '-0.035em', color: '#F5F5FF', mb: 0.75 }}>
                  Welcome Back
                </Typography>
                <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'rgba(226,232,255,0.5)', fontWeight: 400, letterSpacing: '-0.011em' }}>
                  Login to your {role} portal to continue monitoring records.
                </Typography>
              </Box>

              {/* Form */}
              <Box component="form" noValidate onSubmit={handleSubmit}>
                {role === "Student" ? (
                  <>
                    <IOSField margin="normal" required fullWidth id="rollNum" label="Roll Number"
                      name="rollNum" autoFocus error={rollNumError}
                      helperText={rollNumError && 'Required'} onChange={handleInputChange}
                      InputProps={{ startAdornment: (<InputAdornment position="start"><PersonOutlined sx={{ color: 'rgba(235,235,245,0.3)', fontSize: 20 }} /></InputAdornment>) }}
                    />
                    <IOSField margin="normal" required fullWidth id="studentName" label="Full Name"
                      name="studentName" error={studentNameError}
                      helperText={studentNameError && 'Required'} onChange={handleInputChange}
                    />
                  </>
                ) : (
                  <IOSField margin="normal" required fullWidth id="email" label="Email Address"
                    name="email" autoFocus error={emailError}
                    helperText={emailError && 'Required'} onChange={handleInputChange}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><EmailOutlined sx={{ color: 'rgba(235,235,245,0.3)', fontSize: 20 }} /></InputAdornment>) }}
                  />
                )}

                <IOSField margin="normal" required fullWidth name="password" label="Password"
                  type={toggle ? 'text' : 'password'} id="password"
                  error={passwordError} helperText={passwordError && 'Required'}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: (<InputAdornment position="start"><LockOutlined sx={{ color: 'rgba(235,235,245,0.3)', fontSize: 20 }} /></InputAdornment>),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setToggle(!toggle)} edge="end" sx={{ color: 'rgba(235,235,245,0.4)' }}>
                          {toggle ? <Visibility sx={{ fontSize: 20 }} /> : <VisibilityOff sx={{ fontSize: 20 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {role === "Student" && (
                  <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'rgba(124,77,255,0.85)', mt: 1, fontWeight: 500, lineHeight: 1.5, letterSpacing: '-0.011em' }}>
                    First time? Password: CapitalizedFirstName@BirthYearLast3Roll
                  </Typography>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 3 }}>
                  <FormControlLabel
                    control={<Checkbox value="remember" size="small" sx={{ color: 'rgba(226,232,255,0.25)', '&.Mui-checked': { color: '#7C4DFF' }, p: '6px' }} />}
                    label={<Typography sx={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'rgba(226,232,255,0.5)', letterSpacing: '-0.011em' }}>Keep me logged in</Typography>}
                  />
                  <Link to="/" style={{ fontFamily: 'var(--font-body)', color: '#7C4DFF', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
                    Recovery
                  </Link>
                </Box>

                <AppButton type="submit" fullWidth variant="contained" disabled={loader}
                  sx={{ py: 1.8, fontWeight: 600, fontSize: '0.9375rem !important', borderRadius: '14px !important', background: '#7C4DFF !important', boxShadow: '0 8px 28px rgba(124,77,255,0.35) !important', letterSpacing: '-0.01em' }}
                >
                  {loader ? <CircularProgress size={22} color="inherit" /> : `Enter ${role} Portal`}
                </AppButton>

                {role === "Admin" && (
                  <Box sx={{ mt: 3.5, textAlign: 'center' }}>
                    <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'rgba(226,232,255,0.45)', letterSpacing: '-0.011em' }}>
                      New institution?{' '}
                      <Link to="/Adminregister" style={{ color: '#7C4DFF', fontWeight: 500, textDecoration: 'none' }}>Register here</Link>
                    </Typography>
                  </Box>
                )}
              </Box>
            </FormWrapper>
          </Grid>

          {/* ── Right: Visual Panel ── */}
          <Grid item xs={false} md={7} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: '#040610' }}>
            <RightOrb style={{ top: '-15%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(124,77,255,0.18) 0%, transparent 65%)' }} />
            <RightOrb style={{ bottom: '-20%', left: '-5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(68,138,255,0.1) 0%, transparent 65%)' }} />
            <VisualBox>
              <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', letterSpacing: '-0.045em', color: '#F5F5FF', mb: 2, lineHeight: 1.05 }}>
                Secure{' '}<span style={{ color: '#7C4DFF' }}>Access.</span>
              </Typography>
              <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: '1.0625rem', color: 'rgba(226,232,255,0.45)', fontWeight: 400, lineHeight: 1.65, maxWidth: 420, letterSpacing: '-0.011em' }}>
                Access your records, attendance, and performance analytics with institutional-grade security.
              </Typography>
              <VisualStats>
                {[
                  { val: '99.9%', lab: 'Uptime SLA' },
                  { val: 'AES-256', lab: 'Encryption' },
                  { val: 'Real-time', lab: 'Analytics' },
                ].map(s => (
                  <StatItem key={s.lab}>
                    <span className="v">{s.val}</span>
                    <span className="l">{s.lab}</span>
                  </StatItem>
                ))}
              </VisualStats>
            </VisualBox>
          </Grid>
        </Grid>
        <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
      </PageRoot>
    </ThemeProvider>
  );
};

export default LoginPage;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const PageRoot = styled.div`
  height: 100vh;
  overflow: hidden;
  background: #060818;
`;

const FormOrb = styled.div`
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
`;

const FormWrapper = styled(Box)`
  width: 100%;
  max-width: 420px;
  padding: 40px 32px;
  position: relative;
  z-index: 1;
  animation: ${slideUp} 0.6s cubic-bezier(0.16,1,0.3,1) both;
`;

const BrandBox = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 48px;
`;

const IOSField = styled(AppTextField)`
  & .MuiOutlinedInput-root {
    background: rgba(124,77,255,0.04) !important;
    color: var(--text-1) !important;
    border-radius: 12px !important;
    font-family: var(--font-body) !important;
    font-size: 0.9375rem !important;
    letter-spacing: -0.011em !important;
    & fieldset { border-color: rgba(124,77,255,0.12) !important; }
    &:hover fieldset { border-color: rgba(124,77,255,0.35) !important; }
    &.Mui-focused fieldset { border-color: #7C4DFF !important; border-width: 2px !important; box-shadow: 0 0 0 3px rgba(124,77,255,0.08); }
  }
  & .MuiInputLabel-root {
    color: rgba(226,232,255,0.4) !important;
    font-family: var(--font-body) !important;
    font-size: 0.9375rem !important;
  }
`;

const RightOrb = styled.div`
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
`;

const VisualBox = styled(Box)`
  position: relative;
  z-index: 2;
  max-width: 480px;
  padding: 40px;
  animation: ${slideUp} 0.8s 0.1s cubic-bezier(0.16,1,0.3,1) both;
`;

const VisualStats = styled(Box)`
  display: flex;
  gap: 16px;
  margin-top: 48px;
  flex-wrap: wrap;
`;

const StatItem = styled(Box)`
  flex: 1;
  min-width: 100px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(124,77,255,0.1);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  transition: all 0.25s ease;

  .v {
    font-family: var(--font-display);
    font-size: 1.35rem;
    font-weight: 800;
    color: #F5F5FF;
    letter-spacing: -0.03em;
  }
  .l {
    font-family: var(--font-heading);
    font-size: 0.6875rem;
    font-weight: 700;
    color: rgba(226,232,255,0.4);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  &:hover {
    border-color: rgba(124,77,255,0.2);
    background: rgba(255,255,255,0.06);
  }
`;
