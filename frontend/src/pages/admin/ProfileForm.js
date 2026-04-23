import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Stack, Typography, Container, Divider, Grid } from "@mui/material";
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../../redux/userRelated/userHandle';
import { underControl } from '../../redux/userRelated/userSlice';
import Popup from "../../components/Popup";
import AppTextField from "../../components/common/AppTextField";
import AppButton from "../../components/common/AppButton";
import styled, { keyframes } from "styled-components";
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';

const ProfileForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    
    const isSecurity = location.pathname.includes('settings');
    
    const { status, currentUser, response } = useSelector(state => state.user);

    const [name, setName] = useState(currentUser?.name || "");
    const [email, setEmail] = useState(currentUser?.email || "");
    const [password, setPassword] = useState("");
    const [schoolName, setSchoolName] = useState(currentUser?.schoolName || "");
    
    const [loader, setLoader] = useState(false);
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const adminID = currentUser?._id;
    const address = "Admin";

    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true);
        
        const fields = isSecurity 
            ? { password } 
            : { name, email, schoolName };
            
        dispatch(updateUser(fields, adminID, address));
    };

    useEffect(() => {
        if (status === 'success') {
            setMessage("Account updated successfully!");
            setShowPopup(true);
            setLoader(false);
            dispatch(underControl());
        }
        else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, response, dispatch]);

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <StyledPaper elevation={0}>
                <HeaderBox>
                    <IconCircle>
                        {isSecurity ? (
                            <SecurityOutlinedIcon sx={{ fontSize: 32, color: 'var(--secondary)' }} />
                        ) : (
                            <ManageAccountsOutlinedIcon sx={{ fontSize: 32, color: 'var(--primary)' }} />
                        )}
                    </IconCircle>
                    <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'Outfit', color: 'white', mb: 1 }}>
                        {isSecurity ? "Security Settings" : "Account Identity"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                        {isSecurity 
                            ? "Update your administrative access credentials and security protocols." 
                            : "Modify your institutional profile and contact information."}
                    </Typography>
                </HeaderBox>

                <form onSubmit={submitHandler}>
                    <Stack spacing={4}>
                        {!isSecurity ? (
                            <>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <AppTextField
                                            fullWidth
                                            label="Full Name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <AppTextField
                                            fullWidth
                                            label="Email Address"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </Grid>
                                </Grid>
                                <AppTextField
                                    fullWidth
                                    label="Institution Name"
                                    value={schoolName}
                                    onChange={(e) => setSchoolName(e.target.value)}
                                    required
                                />
                            </>
                        ) : (
                            <AppTextField
                                fullWidth
                                label="New Password"
                                type="password"
                                placeholder="Enter a new secure password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoFocus
                            />
                        )}

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
                                sx={{ 
                                    minWidth: 160,
                                    background: isSecurity 
                                        ? 'var(--gradient-vibrant) !important' 
                                        : 'var(--gradient-primary) !important',
                                    boxShadow: '0 8px 24px rgba(132, 94, 194, 0.2)'
                                }}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                            </AppButton>
                        </Box>
                    </Stack>
                </form>
            </StyledPaper>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default ProfileForm;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StyledPaper = styled(Box)`
  background: rgba(176, 168, 185, 0.03);
  backdrop-filter: blur(20px);
  padding: 56px;
  border-radius: 40px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-xl);
  animation: ${fadeIn} 0.8s ease-out;
`;

const HeaderBox = styled(Box)`
  text-align: center;
  margin-bottom: 48px;
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
