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
  palette: {
    primary: { main: '#845EC2' },
    secondary: { main: '#FF8066' },
  },
  typography: { fontFamily: "'Inter', sans-serif" },
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
            const fields = { rollNum, studentName, password };
            setLoader(true);
            dispatch(loginUser(fields, role));
        } else {
            const email = event.target.email.value;
            const password = event.target.password.value;
            if (!email || !password) {
                if (!email) setEmailError(true);
                if (!password) setPasswordError(true);
                return;
            }
            const fields = { email, password };
            setLoader(true);
            dispatch(loginUser(fields, role));
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
            <StyledContainer>
                <CssBaseline />
                <Grid container sx={{ height: '100vh', overflow: 'hidden' }}>
                    <Grid item xs={12} md={6} component={Box} sx={{ display: 'flex', alignItems: 'center', bgcolor: 'var(--bg-main)', position: 'relative', zIndex: 2 }}>
                        <FormWrapper>
                            <BrandBox onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                                <SchoolOutlined sx={{ fontSize: 36, color: 'var(--primary)' }} />
                                <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'Outfit', color: 'white' }}>
                                    TRACAD<span>EMIX</span>
                                </Typography>
                            </BrandBox>
                            
                            <HeaderBox>
                                <Typography variant="h4" sx={{ fontWeight: 900, color: 'white', mb: 1, fontFamily: 'Outfit', letterSpacing: '-1.5px' }}>
                                    Welcome Back
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                                    Login to your {role} portal to continue monitoring records.
                                </Typography>
                            </HeaderBox>

                            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 5 }}>
                                {role === "Student" ? (
                                    <>
                                        <DarkTextField
                                            margin="normal" required fullWidth id="rollNum" label="Roll Number"
                                            name="rollNum" autoFocus error={rollNumError}
                                            helperText={rollNumError && 'Required'} onChange={handleInputChange}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonOutlined sx={{ color: 'var(--text-muted)' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <DarkTextField
                                            margin="normal" required fullWidth id="studentName" label="Full Name"
                                            name="studentName" error={studentNameError}
                                            helperText={studentNameError && 'Required'} onChange={handleInputChange}
                                        />
                                    </>
                                ) : (
                                    <DarkTextField
                                        margin="normal" required fullWidth id="email" label="Email Address"
                                        name="email" autoFocus error={emailError}
                                        helperText={emailError && 'Required'} onChange={handleInputChange}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailOutlined sx={{ color: 'var(--text-muted)' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                )}
                                <DarkTextField
                                    margin="normal" required fullWidth name="password" label="Password"
                                    type={toggle ? 'text' : 'password'} id="password"
                                    error={passwordError} helperText={passwordError && 'Required'}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockOutlined sx={{ color: 'var(--text-muted)' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setToggle(!toggle)} edge="end" sx={{ color: 'var(--text-muted)' }}>
                                                    {toggle ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 3 }}>
                                    <FormControlLabel
                                        control={<Checkbox value="remember" sx={{ color: 'var(--text-muted)', '&.Mui-checked': { color: 'var(--secondary)' } }} />}
                                        label={<Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>Keep me logged in</Typography>}
                                    />
                                    <Link variant="body2" to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 800 }}>
                                        Recovery
                                    </Link>
                                </Box>
                                
                                <AppButton type="submit" fullWidth variant="contained" sx={{ 
                                    py: 1.8, mt: 2, fontWeight: 800, fontSize: '1rem',
                                    background: 'var(--gradient-vibrant) !important',
                                    boxShadow: '0 8px 24px rgba(132, 94, 194, 0.3) !important'
                                }} disabled={loader}>
                                    {loader ? <CircularProgress size={24} color="inherit" /> : `Enter ${role} Portal`}
                                </AppButton>

                                {role === "Admin" && (
                                    <FooterBox>
                                        <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                                            New institution? <Link to="/Adminregister" style={{ color: 'var(--secondary)', fontWeight: 800, textDecoration: 'none' }}>Register here</Link>
                                        </Typography>
                                    </FooterBox>
                                )}
                            </Box>
                        </FormWrapper>
                    </Grid>
                    
                    <Grid item xs={false} md={6} sx={{ 
                        background: 'var(--primary-dark)',
                        display: { xs: 'none', md: 'flex' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <BackgroundDecor />
                        <LoginVisual>
                            <Typography variant="h2" sx={{ fontWeight: 950, mb: 3, fontFamily: 'Outfit', color: 'white', letterSpacing: '-2px' }}>
                                Secure <span>Access.</span>
                            </Typography>
                            <Typography variant="h6" sx={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                                Access your records, attendance, and performance analytics with institutional-grade security.
                            </Typography>
                        </LoginVisual>
                    </Grid>
                </Grid>
                <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
            </StyledContainer>
        </ThemeProvider>
    );
}

export default LoginPage;

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StyledContainer = styled.div`
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg-main);
`;

const FormWrapper = styled(Box)`
  width: 100%;
  max-width: 480px;
  margin: auto;
  padding: 40px;
  animation: ${slideIn} 0.8s ease-out;
`;

const BrandBox = styled(Box)`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 56px;
  span { color: var(--primary); }
`;

const HeaderBox = styled(Box)`
  margin-bottom: 40px;
`;

const DarkTextField = styled(AppTextField)`
  & .MuiOutlinedInput-root {
    background-color: rgba(176, 168, 185, 0.05) !important;
    color: white !important;
    & fieldset { border-color: rgba(176, 168, 185, 0.1) !important; }
    &:hover fieldset { border-color: var(--primary) !important; }
    &.Mui-focused fieldset { border-color: var(--primary) !important; border-width: 2px !important; }
  }
  & .MuiInputLabel-root { color: var(--text-muted) !important; }
`;

const FooterBox = styled(Box)`
  margin-top: 32px;
  text-align: center;
`;

const LoginVisual = styled(Box)`
  position: relative;
  z-index: 2;
  max-width: 500px;
  text-align: center;
  padding: 40px;
  span { 
    background: var(--gradient-vibrant);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const BackgroundDecor = styled(Box)`
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(132, 94, 194, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 70% 70%, rgba(255, 128, 102, 0.05) 0%, transparent 50%);
  z-index: 1;
`;
