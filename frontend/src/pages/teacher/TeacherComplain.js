import { useEffect, useState } from 'react';
import { Box, CircularProgress, Container, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import styled, { keyframes } from 'styled-components';
import AppHeader from '../../components/common/AppHeader';
import Popup from '../../components/Popup';
import { addStuff } from '../../redux/userRelated/userHandle';

import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CustomDatePicker from '../../components/common/CustomDatePicker';

const TeacherComplain = () => {
    const dispatch = useDispatch();
    const { status, currentUser, error } = useSelector(s => s.user);

    const [date, setDate]             = useState('');
    const [complaint, setComplaint]   = useState('');
    const [loader, setLoader]         = useState(false);
    const [submitted, setSubmitted]   = useState(false);
    const [popupMsg, setPopupMsg]     = useState('');
    const [showPopup, setShowPopup]   = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!date || complaint.trim().length < 10) return;
        setLoader(true);
        dispatch(addStuff({
            user: currentUser?._id,
            date,
            complaint,
            school: currentUser?.school?._id || currentUser?.school,
        }, 'Complain'));
    };

    useEffect(() => {
        if (status === 'added') {
            setLoader(false);
            setSubmitted(true);
            setDate('');
            setComplaint('');
            setTimeout(() => setSubmitted(false), 4000);
        } else if (error) {
            setLoader(false);
            setPopupMsg('Network error — please try again.');
            setShowPopup(true);
        }
    }, [status, error]);

    return (
        <Container maxWidth="md" sx={{ mt: 1, mb: 6 }}>
            <AppHeader
                title="Faculty Complaint"
                subtitle="Report an issue or concern to administration. Submissions are confidential."
            />

            <FormCard onSubmit={handleSubmit} component="form">
                <CardHeader>
                    <HeaderIcon><EditNoteOutlinedIcon sx={{ fontSize: 20, color: '#9B6FF8' }} /></HeaderIcon>
                    <Box>
                        <Typography sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#F5F5FF', fontSize: '1rem', letterSpacing: '-0.02em' }}>
                            New Complaint
                        </Typography>
                        <Typography sx={{ color: 'rgba(226,232,255,0.45)', fontSize: '0.78rem', mt: '2px' }}>
                            Reviewed by administration within 48 hours.
                        </Typography>
                    </Box>
                </CardHeader>

                <Divider />

                <Fields>
                    <FieldWrap>
                        <FieldLabel>
                            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
                            Date of Incident
                        </FieldLabel>
                        <CustomDatePicker date={date} setDate={setDate} />
                    </FieldWrap>

                    <FieldWrap>
                        <FieldLabel>
                            <EditNoteOutlinedIcon sx={{ fontSize: 12 }} />
                            Complaint Details
                        </FieldLabel>
                        <TextArea
                            value={complaint}
                            onChange={e => setComplaint(e.target.value)}
                            placeholder="Describe the issue clearly and concisely…"
                            rows={6}
                            required
                        />
                        <CharCount $low={complaint.length < 20}>
                            {complaint.length} characters {complaint.length < 20 && complaint.length > 0 ? '— add more detail' : ''}
                        </CharCount>
                    </FieldWrap>
                </Fields>

                {submitted && (
                    <SuccessBanner>
                        <CheckCircleOutlinedIcon sx={{ fontSize: 16 }} />
                        Complaint submitted successfully. Administration has been notified.
                    </SuccessBanner>
                )}

                <SubmitRow>
                    <SubmitBtn type="submit" disabled={loader || !date || complaint.trim().length < 10}>
                        {loader
                            ? <CircularProgress size={16} color="inherit" />
                            : <><SendOutlinedIcon sx={{ fontSize: 15 }} /> Submit Complaint</>
                        }
                    </SubmitBtn>
                    <CharHint>Minimum 10 characters required</CharHint>
                </SubmitRow>
            </FormCard>

            <Popup message={popupMsg} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default TeacherComplain;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const FormCard = styled(Box)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(124, 77, 255, 0.1);
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  animation: ${fadeUp} 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
`;

const CardHeader = styled(Box)`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const HeaderIcon = styled(Box)`
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: rgba(124, 77, 255, 0.12);
  border: 1px solid rgba(124, 77, 255, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const Divider = styled(Box)`
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(124, 77, 255, 0.16), transparent);
  margin: 18px 0;
`;

const Fields = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const FieldWrap = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FieldLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-heading);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(124, 77, 255, 0.85);
`;



const TextArea = styled.textarea`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 12px 14px;
  color: #F5F5FF;
  font-family: var(--font-body);
  font-size: 0.9rem;
  letter-spacing: -0.01em;
  outline: none;
  resize: vertical;
  min-height: 120px;
  line-height: 1.5;
  transition: all 0.2s ease;

  &::placeholder {
    color: rgba(226, 232, 255, 0.3);
  }
  &:focus {
    border-color: rgba(124, 77, 255, 0.4);
    background: rgba(255, 255, 255, 0.04);
  }
`;

const CharCount = styled.div`
  text-align: right;
  font-family: var(--font-body);
  font-size: 0.72rem;
  color: ${p => p.$low ? '#FBBF24' : 'rgba(226, 232, 255, 0.4)'};
`;

const SuccessBanner = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(52, 211, 153, 0.08);
  border: 1px solid rgba(52, 211, 153, 0.22);
  border-radius: 12px;
  padding: 12px 14px;
  margin-top: 16px;
  color: #34D399;
  font-family: var(--font-body);
  font-size: 0.82rem;
  font-weight: 600;
`;

const SubmitRow = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
`;

const SubmitBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #7C4DFF;
  color: #FFFFFF;
  border: none;
  border-radius: 11px;
  padding: 11px 22px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(124, 77, 255, 0.35);
  transition: all 0.2s ease;

  &:disabled {
    background: rgba(124, 77, 255, 0.25);
    cursor: not-allowed;
    box-shadow: none;
  }
  &:not(:disabled):hover {
    background: #6E3FF3;
    transform: translateY(-1px);
    box-shadow: 0 12px 30px rgba(124, 77, 255, 0.45);
  }
`;

const CharHint = styled.span`
  font-family: var(--font-body);
  font-size: 0.72rem;
  color: rgba(226, 232, 255, 0.35);
`;
