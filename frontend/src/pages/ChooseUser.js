import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Paper, Box, Container, CircularProgress, Backdrop, Typography, IconButton, Tooltip } from '@mui/material';
import { AccountCircle, School, Group, ArrowBackIosNew } from '@mui/icons-material';
import styled, { keyframes } from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';

const ChooseUser = ({ visitor }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const password = "zxc";
  const guestEnabled = import.meta.env.VITE_ENABLE_GUEST_DEMO === "true";
  const { status, currentUser, currentRole } = useSelector(state => state.user);
  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const navigateHandler = (user) => {
    if (user === "Admin") {
      if (visitor === "guest") {
        if (!guestEnabled) { navigate('/Adminlogin'); return; }
        setLoader(true);
        dispatch(loginUser({ email: "yogendra@12", password }, user));
      } else { navigate('/Adminlogin'); }
    } else if (user === "Student") {
      if (visitor === "guest") {
        if (!guestEnabled) { navigate('/Studentlogin'); return; }
        setLoader(true);
        dispatch(loginUser({ rollNum: "1", studentName: "Dipesh Awasthi", password }, user));
      } else { navigate('/Studentlogin'); }
    } else if (user === "Teacher") {
      if (visitor === "guest") {
        if (!guestEnabled) { navigate('/Teacherlogin'); return; }
        setLoader(true);
        dispatch(loginUser({ email: "tony@12", password }, user));
      } else { navigate('/Teacherlogin'); }
    }
  };

  useEffect(() => {
    if (status === 'success' || currentUser !== null) {
      if (currentRole === 'Admin') navigate('/Admin/dashboard');
      else if (currentRole === 'Student') navigate('/Student/dashboard');
      else if (currentRole === 'Teacher') navigate('/Teacher/dashboard');
    } else if (status === 'error') {
      setLoader(false);
      setMessage("Network Error");
      setShowPopup(true);
    }
  }, [status, currentRole, navigate, currentUser]);

  const roles = [
    { name: 'Admin', label: 'Head of Department', icon: <AccountCircle />, desc: 'Manage institutional data, students, and faculty assignments.', color: '#7C4DFF' },
    { name: 'Student', label: 'Student', icon: <School />, desc: 'Access your courses, attendance, and exam performance records.', color: '#448AFF' },
    { name: 'Teacher', label: 'Professor', icon: <Group />, desc: 'Manage class sessions, track assignments, and evaluate students.', color: '#34D399' },
  ];

  return (
    <StyledMain>
      <Orb style={{ top: '-15%', right: '-8%', background: 'radial-gradient(circle, rgba(124,77,255,0.4) 0%, rgba(124,77,255,0.1) 50%, transparent 70%)', width: 650, height: 650 }} />
      <Orb style={{ bottom: '-20%', left: '-8%', background: 'radial-gradient(circle, rgba(68,138,255,0.3) 0%, rgba(68,138,255,0.08) 55%, transparent 70%)', width: 550, height: 550 }} />
      <Orb style={{ top: '20%', left: '40%', background: 'radial-gradient(circle, rgba(45,212,191,0.12) 0%, transparent 65%)', width: 350, height: 350 }} />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ position: { xs: 'relative', md: 'absolute' }, top: { md: -72 }, left: { md: 0 }, mb: { xs: 2, md: 0 } }}>
          <Tooltip title="Back to Homepage">
            <BackBtn onClick={() => navigate('/')}>
              <ArrowBackIosNew sx={{ fontSize: 16 }} />
            </BackBtn>
          </Tooltip>
        </Box>

        <PageHeader>
          <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-0.045em', color: '#F5F5FF', mb: 1.5 }}>
            Select Your <span style={{ color: '#7C4DFF' }}>Portal</span>
          </Typography>
          <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: '1.0625rem', color: 'rgba(226,232,255,0.5)', fontWeight: 400, letterSpacing: '-0.011em' }}>
            Choose your institutional role to continue to your secure dashboard.
          </Typography>
        </PageHeader>

        <Grid container spacing={3} justifyContent="center">
          {roles.map((role, i) => (
            <Grid item xs={12} sm={6} md={4} key={role.name}>
              <RoleCard elevation={0} onClick={() => navigateHandler(role.name)} accent={role.color} style={{ animationDelay: `${i * 0.08}s` }}>
                <RoleIconBox rolecolor={role.color}>
                  {React.cloneElement(role.icon, { sx: { fontSize: { xs: 28, md: 40 } } })}
                </RoleIconBox>
                <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: { xs: '1.05rem', md: '1.25rem' }, letterSpacing: '-0.025em', color: '#F5F5FF', mb: { xs: 0.75, md: 1.5 }, mt: 0.5 }}>
                  {role.label}
                </Typography>
                <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: { xs: '0.8125rem', md: '0.875rem' }, color: 'rgba(226,232,255,0.5)', lineHeight: 1.55, letterSpacing: '-0.011em' }}>
                  {role.desc}
                </Typography>
                <EnterButton rolecolor={role.color}>Enter Portal</EnterButton>
              </RoleCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, backdropFilter: 'blur(8px)' }} open={loader}>
        <CircularProgress sx={{ color: '#7C4DFF' }} />
        <Typography sx={{ ml: 2, fontFamily: 'var(--font-body)', fontWeight: 500, letterSpacing: '-0.011em' }}>Authenticating Access...</Typography>
      </Backdrop>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </StyledMain>
  );
};

export default ChooseUser;

const floatCard = keyframes`
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
`;

const StyledMain = styled.div`
  min-height: 100vh;
  background: transparent;
  color: white;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 0;

  @media (max-width: 600px) {
    padding: 40px 0 60px;
    align-items: flex-start;
  }
`;

const Orb = styled.div`
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
`;

const PageHeader = styled(Box)`
  text-align: center;
  margin-bottom: 56px;
  animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both;

  @media (max-width: 600px) {
    margin-bottom: 28px;
  }
`;

const BackBtn = styled(IconButton)`
  && {
    color: rgba(226,232,255,0.7);
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(124,77,255,0.12);
    width: 40px;
    height: 40px;
    transition: all 0.25s ease;
    &:hover { background: rgba(124,77,255,0.12); border-color: rgba(124,77,255,0.3); color: white; }
  }
`;

const RoleCard = styled(Paper)`
  && {
    padding: 40px 28px;
    text-align: center;
    background: rgba(255, 255, 255, 0.055) !important;
    backdrop-filter: blur(40px) saturate(200%) brightness(1.06) !important;
    -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.06) !important;
    border-radius: 24px !important;
    border: 1px solid rgba(124, 77, 255, 0.1) !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(124,77,255,0.06), inset 0 1px 0 rgba(255,255,255,0.1) !important;
    cursor: pointer;
    transition: all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    color: white !important;
    animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both;

    @media (max-width: 600px) {
      padding: 24px 20px !important;
      border-radius: 18px !important;
    }

    &:hover {
      transform: translateY(-14px) scale(1.02) !important;
      border-color: ${props => props.accent ? `${props.accent}60` : 'rgba(110,63,243,0.5)'} !important;
      box-shadow: 0 28px 60px rgba(0,0,0,0.55), 0 0 0 1px ${props => props.accent ? `${props.accent}40` : 'rgba(124,77,255,0.35)'}, inset 0 1px 0 rgba(255,255,255,0.14) !important;
      background: rgba(255, 255, 255, 0.085) !important;
    }
  }
`;

const RoleIconBox = styled(Box)`
  width: 80px;
  height: 80px;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  background: ${props => props.rolecolor ? `${props.rolecolor}14` : 'rgba(124,77,255,0.1)'};
  color: ${props => props.rolecolor || '#7C4DFF'};
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: ${floatCard} 7s ease-in-out infinite;

  @media (max-width: 600px) {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    margin-bottom: 16px;
  }

  ${RoleCard}:hover & {
    transform: scale(1.12);
    background: ${props => props.rolecolor ? `${props.rolecolor}20` : 'rgba(124,77,255,0.18)'};
  }
`;

const EnterButton = styled(Box)`
  margin-top: 28px;
  padding: 11px 24px;
  border-radius: 12px;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.875rem;
  display: inline-block;
  transition: all 0.25s ease;
  letter-spacing: -0.01em;
  color: ${props => props.rolecolor || '#9B6FF8'};
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(124, 77, 255, 0.1);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);

  @media (max-width: 600px) {
    margin-top: 18px;
    padding: 9px 20px;
    font-size: 0.8125rem;
  }
`;