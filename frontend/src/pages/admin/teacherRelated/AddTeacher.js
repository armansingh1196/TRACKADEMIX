import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectDetails } from '../../../redux/sclassRelated/sclassHandle';
import Popup from '../../../components/Popup';
import { registerUser } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { CircularProgress, Box, Typography, Container, Stack, Divider } from '@mui/material';
import styled, { keyframes } from 'styled-components';
import AppTextField from '../../../components/common/AppTextField';
import AppButton from '../../../components/common/AppButton';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';

const AddTeacher = () => {
  const params = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const subjectID = params.id

  const { status, response } = useSelector(state => state.user);
  const { subjectDetails } = useSelector((state) => state.sclass);

  useEffect(() => {
    dispatch(getSubjectDetails(subjectID, "Subject"));
  }, [dispatch, subjectID]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('')

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [loader, setLoader] = useState(false)

  const role = "Teacher"
  const school = subjectDetails && subjectDetails.school
  const teachSubject = subjectDetails && subjectDetails._id
  const teachSclass = subjectDetails && subjectDetails.sclassName && subjectDetails.sclassName._id

  const submitHandler = (event) => {
    event.preventDefault()
    setLoader(true)
    dispatch(registerUser({ name, email, password, role, school, teachSubject, teachSclass }, role))
  }

  useEffect(() => {
    if (status === 'added') {
      dispatch(underControl())
      navigate("/Admin/teachers")
    }
    else if (status === 'failed') {
      setMessage(response)
      setShowPopup(true)
      setLoader(false)
    }
  }, [status, navigate, response, dispatch]);

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <FormPaper elevation={0}>
        <HeaderBox>
            <IconCircle>
                <SupervisorAccountOutlinedIcon sx={{ fontSize: 32, color: 'var(--primary)' }} />
            </IconCircle>
            <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'Outfit', color: 'white', mb: 1 }}>
                Onboard Professor
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                Register a new faculty member for specialized academic instruction.
            </Typography>
        </HeaderBox>

        <InfoBanner>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                <AssignmentOutlinedIcon sx={{ color: 'var(--primary-light)', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'white' }}>
                    Subject: {subjectDetails?.subName}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SchoolOutlinedIcon sx={{ color: 'var(--secondary)', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'white' }}>
                    Class: {subjectDetails?.sclassName?.sclassName}
                </Typography>
            </Box>
        </InfoBanner>

        <Divider sx={{ my: 4, borderColor: 'var(--border)' }} />

        <form onSubmit={submitHandler}>
          <Stack spacing={3}>
            <AppTextField 
                label="Full Name" 
                placeholder="Enter professor's name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required 
                fullWidth
            />
            <AppTextField 
                label="Email Address" 
                type="email"
                placeholder="Enter professor's email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required 
                fullWidth
            />
            <AppTextField 
                label="Password" 
                type="password"
                placeholder="Assign a secure password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required 
                fullWidth
            />

            <Box sx={{ pt: 3 }}>
                <AppButton 
                    variant="contained" 
                    fullWidth 
                    type="submit" 
                    disabled={loader}
                    sx={{ 
                        py: 1.8, 
                        background: 'var(--gradient-primary) !important',
                        boxShadow: '0 8px 24px rgba(132, 94, 194, 0.2)'
                    }}
                >
                    {loader ? <CircularProgress size={24} color="inherit" /> : 'Register Professor'}
                </AppButton>
                <AppButton 
                    variant="text" 
                    fullWidth 
                    onClick={() => navigate(-1)}
                    sx={{ mt: 2, color: 'var(--text-muted)' }}
                >
                    Cancel
                </AppButton>
            </Box>
          </Stack>
        </form>
      </FormPaper>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </Container>
  )
}

export default AddTeacher

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const FormPaper = styled(Box)`
  background: rgba(176, 168, 185, 0.03);
  backdrop-filter: blur(20px);
  padding: 48px;
  border-radius: 40px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-xl);
  animation: ${slideUp} 0.8s ease-out;
`;

const HeaderBox = styled(Box)`
  text-align: center;
  margin-bottom: 40px;
`;

const IconCircle = styled(Box)`
  width: 72px;
  height: 72px;
  background: rgba(132, 94, 194, 0.1);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  border: 1px solid rgba(132, 94, 194, 0.2);
`;

const InfoBanner = styled(Box)`
  background: rgba(255, 255, 255, 0.02);
  padding: 20px 24px;
  border-radius: 16px;
  border-left: 4px solid var(--primary);
`;