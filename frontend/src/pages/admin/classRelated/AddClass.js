import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { BlueButton } from "../../../components/buttonStyles";
import Popup from "../../../components/Popup";
import AppTextField from "../../../components/common/AppTextField";
import styled, { keyframes } from "styled-components";
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';

const AddClass = () => {
    const [sclassName, setSclassName] = useState("");

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { status, response, tempDetails } = useSelector(state => state.user);

    const [loader, setLoader] = useState(false)
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const submitHandler = (event) => {
        event.preventDefault()
        setLoader(true)
        dispatch(addStuff({ sclassName, adminID: useSelector(state => state.user.currentUser._id) }, "Sclass"))
    };

    useEffect(() => {
        if (status === 'added' && tempDetails) {
            navigate("/Admin/classes/class/" + tempDetails._id)
            dispatch(underControl())
            setLoader(false)
        }
        else if (status === 'failed') {
            setMessage(response)
            setShowPopup(true)
            setLoader(false)
        }
    }, [status, navigate, response, dispatch, tempDetails]);

    return (
        <StyledContainer>
            <FormWrapper>
                <HeaderBox>
                    <IconCircle>
                        <ClassOutlinedIcon sx={{ fontSize: 32, color: 'var(--primary)' }} />
                    </IconCircle>
                    <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: 'Outfit', color: 'white', mb: 1 }}>
                        Create New Class
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                        Establish a new academic section to manage students and subjects.
                    </Typography>
                </HeaderBox>
                
                <form onSubmit={submitHandler}>
                    <Stack spacing={4}>
                        <AppTextField
                            label="Class Name"
                            variant="outlined"
                            placeholder="e.g. Grade 10-A or B.Tech CSE"
                            value={sclassName}
                            onChange={(event) => setSclassName(event.target.value)}
                            required
                            fullWidth
                            autoFocus
                        />
                        <Box sx={{ pt: 2 }}>
                            <BlueButton
                                fullWidth
                                size="large"
                                variant="contained"
                                type="submit"
                                disabled={loader}
                                sx={{ py: 1.8, fontSize: '1rem', fontWeight: 800 }}
                            >
                                {loader ? <CircularProgress size={24} color="inherit" /> : "Establish Class"}
                            </BlueButton>
                            <Button 
                                fullWidth 
                                variant="text" 
                                onClick={() => navigate(-1)}
                                sx={{ mt: 2, color: 'var(--text-muted)', fontWeight: 700 }}
                            >
                                Cancel & Return
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </FormWrapper>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </StyledContainer>
    )
}

export default AddClass

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StyledContainer = styled(Box)`
  height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const FormWrapper = styled(Box)`
  width: 100%;
  max-width: 480px;
  background: rgba(176, 168, 185, 0.03);
  backdrop-filter: blur(20px);
  padding: 48px;
  border-radius: 32px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-xl);
  animation: ${fadeIn} 0.6s ease-out;
`;

const HeaderBox = styled(Box)`
  text-align: center;
  margin-bottom: 40px;
`;

const IconCircle = styled(Box)`
  width: 72px;
  height: 72px;
  background: rgba(132, 94, 194, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  border: 1px solid rgba(132, 94, 194, 0.2);
`;