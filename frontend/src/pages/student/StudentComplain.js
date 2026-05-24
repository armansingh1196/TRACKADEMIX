import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import Popup from '../../components/Popup';
import { addStuff } from '../../redux/userRelated/userHandle';
import { useDispatch, useSelector } from 'react-redux';
import styled, { keyframes } from 'styled-components';
import AppHeader from '../../components/common/AppHeader';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';

const StudentComplain = () => {
    const [complaint, setComplaint] = useState('');
    const [date, setDate]           = useState('');
    const [loader, setLoader]       = useState(false);
    const [message, setMessage]     = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const dispatch = useDispatch();
    const { status, currentUser, error } = useSelector(state => state.user);

    const submitHandler = (e) => {
        e.preventDefault();
        if (!date || !complaint.trim()) return;
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
            setMessage('Network Error — please try again.');
            setShowPopup(true);
        }
    }, [status, error]);

    return (
        <PageWrap>
            <AppHeader title="Submit a Complaint" subtitle="Report an issue to your institution's administration." />

            <FormCard onSubmit={submitHandler} component="form">
                {/* Icon header */}
                <CardHeader>
                    <HeaderIcon>
                        <EditNoteOutlinedIcon sx={{ fontSize: 20, color: '#9B6FF8' }} />
                    </HeaderIcon>
                    <HeaderText>
                        <HeaderTitle>New Complaint</HeaderTitle>
                        <HeaderSub>Your submission is confidential and reviewed within 48 hours.</HeaderSub>
                    </HeaderText>
                </CardHeader>

                <Divider />

                <Fields>
                    {/* Date field */}
                    <FieldWrap>
                        <FieldLabel>
                            <CalendarTodayOutlinedIcon sx={{ fontSize: 12 }} />
                            Date of Incident
                        </FieldLabel>
                        <DateInput
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                        />
                    </FieldWrap>

                    {/* Complaint textarea */}
                    <FieldWrap>
                        <FieldLabel>
                            <EditNoteOutlinedIcon sx={{ fontSize: 12 }} />
                            Complaint Details
                        </FieldLabel>
                        <TextArea
                            value={complaint}
                            onChange={e => setComplaint(e.target.value)}
                            placeholder="Describe your issue clearly and concisely…"
                            rows={5}
                            required
                        />
                        <CharCount low={complaint.length < 20}>
                            {complaint.length} characters {complaint.length < 20 && complaint.length > 0 ? '— add more detail' : ''}
                        </CharCount>
                    </FieldWrap>
                </Fields>

                {/* Success state */}
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

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </PageWrap>
    );
};

export default StudentComplain;

const fadeUp = keyframes`from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}`;

const PageWrap = styled.div`
    max-width: 640px;
    margin: 8px auto;
    padding: 0 8px 48px;
    animation: ${fadeUp} 0.5s cubic-bezier(0.16,1,0.3,1) both;
`;

const FormCard = styled(Box)`
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(124,77,255,0.1);
    border-radius: 20px;
    padding: 28px 32px;
    backdrop-filter: blur(40px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);

    @media(max-width:600px){ padding: 20px 18px; border-radius: 16px; }
`;

const CardHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 20px;
`;

const HeaderIcon = styled.div`
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: rgba(124,77,255,0.1);
    border: 1px solid rgba(124,77,255,0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const HeaderText = styled.div``;

const HeaderTitle = styled.div`
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9375rem;
    font-weight: 800;
    color: #F5F5FF;
    letter-spacing: -0.02em;
`;

const HeaderSub = styled.div`
    font-size: 0.72rem;
    color: rgba(200,210,255,0.4);
    margin-top: 2px;
    font-family: Inter, sans-serif;
`;

const Divider = styled.div`
    height: 1px;
    background: rgba(124,77,255,0.08);
    margin-bottom: 24px;
`;

const Fields = styled.div`
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin-bottom: 20px;
`;

const FieldWrap = styled.div``;

const FieldLabel = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: rgba(200,210,255,0.38);
    margin-bottom: 8px;
    svg { color: rgba(124,77,255,0.6); }
`;

const inputBase = `
    width: 100%;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(124,77,255,0.12);
    border-radius: 13px;
    padding: 11px 14px;
    font-family: Inter, sans-serif;
    font-size: 0.875rem;
    color: #F5F5FF;
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;
    box-sizing: border-box;

    &::placeholder { color: rgba(200,210,255,0.2); }
    &:focus {
        border-color: rgba(124,77,255,0.5);
        box-shadow: 0 0 0 3px rgba(124,77,255,0.08);
    }
`;

const DateInput = styled.input`${inputBase}
    color-scheme: dark;
`;

const TextArea = styled.textarea`${inputBase}
    resize: vertical;
    min-height: 120px;
    line-height: 1.6;
`;

const CharCount = styled.div`
    font-size: 0.65rem;
    color: ${p => p.low ? 'rgba(248,113,113,0.6)' : 'rgba(200,210,255,0.25)'};
    margin-top: 5px;
    font-family: Inter, sans-serif;
    text-align: right;
`;

const SuccessBanner = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.78rem;
    font-weight: 600;
    color: #34D399;
    background: rgba(52,211,153,0.07);
    border: 1px solid rgba(52,211,153,0.18);
    border-radius: 10px;
    padding: 10px 14px;
    margin-bottom: 16px;
`;

const SubmitRow = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
`;

const SubmitBtn = styled.button`
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 11px 24px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #7C4DFF 0%, #B07AFE 100%);
    color: white;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(124,77,255,0.3);
    transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
    letter-spacing: -0.01em;

    &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(124,77,255,0.4); }
    &:active:not(:disabled) { transform: scale(0.97); }
    &:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }
`;

const CharHint = styled.div`
    font-size: 0.67rem;
    color: rgba(200,210,255,0.25);
    font-family: Inter, sans-serif;
`;