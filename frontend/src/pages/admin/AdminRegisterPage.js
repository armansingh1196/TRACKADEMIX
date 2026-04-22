import * as React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, Box, Typography, Checkbox, FormControlLabel, CssBaseline, IconButton, InputAdornment, CircularProgress, ThemeProvider, createTheme, MenuItem, Select, FormControl, InputLabel, Autocomplete } from '@mui/material';
import { Visibility, VisibilityOff, SchoolOutlined, PersonOutlined, EmailOutlined, LockOutlined, BusinessOutlined } from '@mui/icons-material';
import { registerUser } from '../../redux/userRelated/userHandle';
import styled, { keyframes } from 'styled-components';
import Popup from '../../components/Popup';
import AppButton from '../../components/common/AppButton';
import AppTextField from '../../components/common/AppTextField';

const theme = createTheme({
  palette: {
    primary: { main: '#845EC2' },
    secondary: { main: '#FF8066' },
  },
  typography: { fontFamily: "'Inter', sans-serif" },
});

const branches = [
    "CSE", "IT", "Mechanical", "Mining", "Metallurgy", "Electrical", "Electronics and Communication", "Cybersecurity"
];

const AdminRegisterPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { status, currentUser, response, currentRole } = useSelector(state => state.user);

    const [toggle, setToggle] = useState(false);
    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [adminNameError, setAdminNameError] = useState(false);
    const [schoolNameError, setSchoolNameError] = useState(false);
    const [branchError, setBranchError] = useState(false);
    
    const [branch, setBranch] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const role = "Admin";

    useEffect(() => {
        const mockData = {
            'Default': ['BIT Mesra', 'IIM Ranchi', 'St. Xavier\'s College', 'IIT Delhi', 'Mumbai University']
        };
        setSuggestions(mockData['Default']);
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        const name = event.target.adminName.value;
        const email = event.target.email.value;
        const password = event.target.password.value;

        if (!name || !schoolName || !email || !password || !branch) {
            if (!name) setAdminNameError(true);
            if (!schoolName) setSchoolNameError(true);
            if (!email) setEmailError(true);
            if (!password) setPasswordError(true);
            if (!branch) setBranchError(true);
            return;
        }

        const fields = { name, email, password, role, schoolName, branch };
        setLoader(true);
        dispatch(registerUser(fields, role));
    };

    const handleInputChange = (event) => {
        const { name } = event.target;
        if (name === 'email') setEmailError(false);
        if (name === 'password') setPasswordError(false);
        if (name === 'adminName') setAdminNameError(false);
    };

    useEffect(() => {
        if (status === 'success' || (currentUser !== null && currentRole === 'Admin')) {
            navigate('/Admin/dashboard');
        } else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, currentUser, currentRole, navigate, response]);

    return (
        <ThemeProvider theme={theme}>
            <StyledContainer>
                <CssBaseline />
                <Grid container sx={{ height: '100vh', overflow: 'hidden' }}>
                    <Grid item xs={12} md={6} component={Box} sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center', 
                        bgcolor: 'var(--bg-main)', 
                        position: 'relative', 
                        zIndex: 2,
                        overflowY: 'auto',
                        padding: '40px 0'
                    }}>
                        <FormWrapper>
                            <BrandBox onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                                <SchoolOutlined sx={{ fontSize: 36, color: 'var(--primary)' }} />
                                <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'Outfit', color: 'white' }}>
                                    TRACAD<span>EMIX</span>
                                </Typography>
                            </BrandBox>
                            
                            <HeaderBox>
                                <Typography variant="h4" sx={{ fontWeight: 900, color: 'white', mb: 1, fontFamily: 'Outfit', letterSpacing: '-1px' }}>
                                    Institutional Portal
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                                    Join the academic network and manage your department with precision.
                                </Typography>
                            </HeaderBox>

                            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 4 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <DarkTextField
                                            required fullWidth id="adminName" label="Full Name"
                                            name="adminName" autoFocus error={adminNameError}
                                            helperText={adminNameError && 'Required'} onChange={handleInputChange}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonOutlined sx={{ color: 'var(--text-muted)' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Autocomplete
                                            freeSolo
                                            options={suggestions}
                                            value={schoolName}
                                            onInputChange={(e, newValue) => {
                                                setSchoolName(newValue);
                                                setSchoolNameError(false);
                                            }}
                                            renderInput={(params) => (
                                                <DarkTextField
                                                    {...params}
                                                    required
                                                    label="Institution"
                                                    name="schoolName"
                                                    error={schoolNameError}
                                                    helperText={schoolNameError && 'Required'}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <BusinessOutlined sx={{ color: 'var(--text-muted)', ml: 1 }} />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                                
                                <FormControl fullWidth sx={{ mt: 2 }} error={branchError}>
                                    <InputLabel id="branch-label" sx={{ color: 'var(--text-muted)' }}>Choose Branch</InputLabel>
                                    <DarkSelect
                                        labelId="branch-label"
                                        id="branch"
                                        value={branch}
                                        label="Choose Branch"
                                        onChange={(e) => {
                                            setBranch(e.target.value);
                                            setBranchError(false);
                                        }}
                                    >
                                        {branches.map((b) => (
                                            <MenuItem key={b} value={b}>{b}</MenuItem>
                                        ))}
                                    </DarkSelect>
                                </FormControl>

                                <DarkTextField
                                    margin="normal" required fullWidth id="email" label="Email Address"
                                    name="email" error={emailError}
                                    helperText={emailError && 'Required'} onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailOutlined sx={{ color: 'var(--text-muted)' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
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
                                
                                <AppButton type="submit" fullWidth variant="contained" sx={{ 
                                    py: 1.8, mt: 4, fontWeight: 800, fontSize: '1rem',
                                    background: 'var(--gradient-vibrant) !important',
                                    boxShadow: '0 8px 24px rgba(132, 94, 194, 0.3) !important'
                                }} disabled={loader}>
                                    {loader ? <CircularProgress size={24} color="inherit" /> : "Register Department"}
                                </AppButton>

                                <FooterBox>
                                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                                        Already have an account? <Link to="/Adminlogin" style={{ color: 'var(--secondary)', fontWeight: 800, textDecoration: 'none' }}>Log in</Link>
                                    </Typography>
                                </FooterBox>
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
                        <FeatureCard>
                            <Typography variant="h2" sx={{ fontWeight: 950, mb: 2, fontFamily: 'Outfit', color: 'white', letterSpacing: '-2.5px', lineHeight: 1 }}>
                                Empower Your <span>Faculty.</span>
                            </Typography>
                            <Typography variant="h6" sx={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                                Join hundreds of institutions in modernizing academic management and student performance tracking.
                            </Typography>
                        </FeatureCard>
                    </Grid>
                </Grid>
                <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
            </StyledContainer>
        </ThemeProvider>
    );
}

export default AdminRegisterPage;

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
  max-width: 540px;
  padding: 0 40px;
  animation: ${slideIn} 0.8s ease-out;
`;

const BrandBox = styled(Box)`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 48px;
  span { color: var(--primary); }
`;

const HeaderBox = styled(Box)`
  margin-bottom: 32px;
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
  & .MuiFormHelperText-root { color: var(--accent) !important; }
`;

const DarkSelect = styled(Select)`
  border-radius: 14px !important;
  background: rgba(176, 168, 185, 0.05) !important;
  color: white !important;
  & .MuiOutlinedInput-notchedOutline { border-color: rgba(176, 168, 185, 0.1) !important; }
  &:hover .MuiOutlinedInput-notchedOutline { border-color: var(--primary) !important; }
  &.Mui-focused .MuiOutlinedInput-notchedOutline { border-color: var(--primary) !important; border-width: 2px !important; }
  & .MuiSelect-select { padding: 16px !important; }
  & .MuiSvgIcon-root { color: var(--text-muted) !important; }
`;

const FooterBox = styled(Box)`
  margin-top: 32px;
  text-align: center;
`;

const FeatureCard = styled(Box)`
  position: relative;
  z-index: 2;
  color: white;
  max-width: 520px;
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
