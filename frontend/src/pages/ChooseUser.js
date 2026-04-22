import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Box,
  Container,
  CircularProgress,
  Backdrop,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material';
import { AccountCircle, School, Group, ArrowBackIosNew } from '@mui/icons-material';
import styled, { keyframes } from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';

const ChooseUser = ({ visitor }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const password = "zxc";

  const { status, currentUser, currentRole } = useSelector(state => state.user);

  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const navigateHandler = (user) => {
    if (user === "HOD") {
      if (visitor === "guest") {
        const email = "yogendra@12";
        const fields = { email, password };
        setLoader(true);
        dispatch(loginUser(fields, user));
      } else {
        navigate('/Adminlogin');
      }
    } else if (user === "Student") {
      if (visitor === "guest") {
        const rollNum = "1";
        const studentName = "Dipesh Awasthi";
        const fields = { rollNum, studentName, password };
        setLoader(true);
        dispatch(loginUser(fields, user));
      } else {
        navigate('/Studentlogin');
      }
    } else if (user === "Teacher") {
      if (visitor === "guest") {
        const email = "tony@12";
        const fields = { email, password };
        setLoader(true);
        dispatch(loginUser(fields, user));
      } else {
        navigate('/Teacherlogin');
      }
    }
  };

  useEffect(() => {
    if (status === 'success' || currentUser !== null) {
      if (currentRole === 'HOD') navigate('/Admin/dashboard');
      else if (currentRole === 'Student') navigate('/Student/dashboard');
      else if (currentRole === 'Teacher') navigate('/Teacher/dashboard');
    } else if (status === 'error') {
      setLoader(false);
      setMessage("Network Error");
      setShowPopup(true);
    }
  }, [status, currentRole, navigate, currentUser]);

  const roles = [
    { name: 'HOD', label: 'Head of Department', icon: <AccountCircle />, desc: 'Manage institutional data, students, and faculty assignments.' },
    { name: 'Student', label: 'Student', icon: <School />, desc: 'Access your courses, attendance, and exam performance records.' },
    { name: 'Teacher', label: 'Professor', icon: <Group />, desc: 'Manage class sessions, track assignments, and evaluate student progress.' },
  ];

  return (
    <StyledMain>
      <BackgroundDecor />
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ position: 'absolute', top: -80, left: 0 }}>
            <Tooltip title="Back to Homepage">
                <IconButton onClick={() => navigate('/')} sx={{ color: 'white', bgcolor: 'rgba(132, 94, 194, 0.15)', '&:hover': { bgcolor: 'rgba(132, 94, 194, 0.3)' } }}>
                    <ArrowBackIosNew sx={{ fontSize: 20 }} />
                </IconButton>
            </Tooltip>
        </Box>
        
        <Box sx={{ mb: 10, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 900, fontFamily: 'Outfit', mb: 2, letterSpacing: '-1.5px' }}>
                Select Your <span>Portal</span>
            </Typography>
            <Typography variant="h6" sx={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                Choose your institutional role to continue to your secure dashboard.
            </Typography>
        </Box>
        <Grid container spacing={4} justifyContent="center">
          {roles.map((role) => (
            <Grid item xs={12} sm={6} md={4} key={role.name}>
              <StyledPaper elevation={0} onClick={() => navigateHandler(role.name)}>
                <IconBox className="icon-box">
                  {role.icon}
                </IconBox>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, fontFamily: 'Outfit' }}>
                  {role.label}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {role.desc}
                </Typography>
                <PortalButton className="portal-btn">Enter Portal</PortalButton>
              </StyledPaper>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loader}>
        <CircularProgress color="inherit" sx={{ color: 'var(--primary)' }} />
        <Typography variant="h6" sx={{ ml: 2, fontFamily: 'Outfit', fontWeight: 600 }}>Authenticating Access...</Typography>
      </Backdrop>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </StyledMain>
  );
};

export default ChooseUser;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
`;

const StyledMain = styled.div`
  height: 100vh;
  background-color: var(--bg-main);
  color: white;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BackgroundDecor = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 15% 15%, rgba(132, 94, 194, 0.1) 0%, transparent 40%),
              radial-gradient(circle at 85% 85%, rgba(255, 128, 102, 0.05) 0%, transparent 40%);
  z-index: 1;
`;

const StyledPaper = styled(Paper)`
  padding: 56px 32px;
  text-align: center;
  background: rgba(176, 168, 185, 0.05) !important;
  backdrop-filter: blur(24px);
  border-radius: 40px !important;
  border: 1px solid var(--border) !important;
  cursor: pointer;
  transition: var(--transition) !important;
  color: white !important;
  animation: float 6s ease-in-out infinite;

  &:hover {
    background: rgba(132, 94, 194, 0.05) !important;
    transform: translateY(-16px);
    border-color: var(--primary) !important;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3) !important;

    .icon-box {
      background: var(--gradient-primary);
      color: white;
      transform: scale(1.1);
      box-shadow: 0 10px 25px rgba(132, 94, 194, 0.4);
    }

    .portal-btn {
      background: var(--gradient-primary);
      color: white;
      border-color: transparent;
    }
  }

  span {
    background: var(--gradient-vibrant);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const IconBox = styled(Box)`
  width: 88px;
  height: 88px;
  background-color: rgba(132, 94, 194, 0.1);
  color: var(--primary);
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 36px;
  transition: var(--transition);
  border: 1px solid rgba(132, 94, 194, 0.2);

  svg {
    font-size: 44px;
  }
`;

const PortalButton = styled(Box)`
  margin-top: 40px;
  padding: 14px 28px;
  border-radius: 16px;
  font-weight: 800;
  color: var(--primary);
  background-color: rgba(132, 94, 194, 0.1);
  transition: var(--transition);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 2.5px;
  border: 1px solid rgba(132, 94, 194, 0.2);
`;