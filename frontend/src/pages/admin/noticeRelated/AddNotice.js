import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { CircularProgress, Box, Typography, Stack, Container, Grid } from '@mui/material';
import Popup from '../../../components/Popup';
import AppTextField from '../../../components/common/AppTextField';
import AppButton from '../../../components/common/AppButton';
import AppHeader from '../../../components/common/AppHeader';
import styled, { keyframes } from 'styled-components';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';

const AddNotice = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, response, error } = useSelector(state => state.user);
  const { currentUser } = useSelector(state => state.user);

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState('');
  const adminID = currentUser._id
  const address = "Notice"

  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const submitHandler = (event) => {
    event.preventDefault();
    setLoader(true);
    const fields = { title, details, date, adminID };
    dispatch(addStuff(fields, address));
  };

  useEffect(() => {
    if (status === 'added') {
      dispatch(underControl())
      navigate('/Admin/notices');
    } else if (status === 'error') {
      setMessage("Network Error")
      setShowPopup(true)
      setLoader(false)
    }
  }, [status, navigate, error, response, dispatch]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <AppHeader 
        title="Create Announcement" 
        subtitle="Broadcast important information to your institution's feed."
      />
      
      <StyledPaper>
        <IconBox>
          <CampaignOutlinedIcon sx={{ fontSize: 40, color: 'var(--primary)' }} />
        </IconBox>
        
        <form onSubmit={submitHandler}>
          <Stack spacing={4}>
            <AppTextField
              fullWidth
              label="Notice Title"
              placeholder="e.g., Semester Final Examinations 2026"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />

            <AppTextField
              fullWidth
              multiline
              rows={4}
              label="Notice Details"
              placeholder="Provide comprehensive details about the announcement..."
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              required
            />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <AppTextField
                  fullWidth
                  type="date"
                  label="Publish Date"
                  InputLabelProps={{ shrink: true }}
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  required
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <AppButton 
                variant="outlined" 
                onClick={() => navigate(-1)}
                sx={{ color: 'white', borderColor: 'var(--border)' }}
              >
                Cancel
              </AppButton>
              <AppButton 
                variant="contained" 
                type="submit" 
                disabled={loader}
                sx={{ minWidth: 160 }}
              >
                {loader ? <CircularProgress size={24} color="inherit" /> : 'Publish Notice'}
              </AppButton>
            </Box>
          </Stack>
        </form>
      </StyledPaper>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </Container>
  );
};

export default AddNotice;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StyledPaper = styled(Box)`
  background: var(--bg-card);
  backdrop-filter: blur(24px);
  padding: 48px;
  border-radius: 32px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-xl);
  margin-top: 32px;
  animation: ${fadeIn} 0.8s cubic-bezier(0.16, 1, 0.3, 1);
`;

const IconBox = styled(Box)`
  width: 80px;
  height: 80px;
  background: rgba(132, 94, 194, 0.1);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 40px;
  border: 1px solid rgba(132, 94, 194, 0.2);
`;