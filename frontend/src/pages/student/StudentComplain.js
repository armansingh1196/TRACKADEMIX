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
import { Popover, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';

const StudentComplain = () => {
    const [complaint, setComplaint] = useState('');
    const [date, setDate]           = useState('');
    const [loader, setLoader]       = useState(false);
    const [message, setMessage]     = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Custom Date Picker State
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const openDatePicker = (e) => setAnchorEl(e.currentTarget);
    const closeDatePicker = () => setAnchorEl(null);

    const handleDateSelect = (day) => {
        const yyyy = currentMonth.getFullYear();
        const mm = String(currentMonth.getMonth() + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        setDate(`${yyyy}-${mm}-${dd}`);
        closeDatePicker();
    };

    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const blanksArray = Array.from({ length: firstDay });
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
                        <DateTrigger onClick={openDatePicker} hasvalue={!!date ? 1 : 0}>
                            {date ? date : "Select Date (YYYY-MM-DD)"}
                            <CalendarMonthOutlinedIcon sx={{ fontSize: 18, color: 'rgba(200,210,255,0.3)' }} />
                        </DateTrigger>
                        
                        <Popover
                            open={Boolean(anchorEl)}
                            anchorEl={anchorEl}
                            onClose={closeDatePicker}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                            PaperProps={{
                                sx: {
                                    mt: 1,
                                    background: 'rgba(10, 13, 30, 0.85)',
                                    backdropFilter: 'blur(30px)',
                                    WebkitBackdropFilter: 'blur(30px)',
                                    border: '1px solid rgba(124,77,255,0.2)',
                                    borderRadius: '16px',
                                    boxShadow: '0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
                                    padding: '16px',
                                    width: '290px',
                                    color: '#F5F5FF'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <IconButton size="small" onClick={prevMonth} sx={{ color: 'rgba(200,210,255,0.6)' }}><ChevronLeftIcon /></IconButton>
                                <Box sx={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '-0.01em' }}>
                                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                </Box>
                                <IconButton size="small" onClick={nextMonth} sx={{ color: 'rgba(200,210,255,0.6)' }}><ChevronRightIcon /></IconButton>
                            </Box>
                            
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1.5, textAlign: 'center' }}>
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                    <Box key={d} sx={{ fontSize: '0.65rem', fontWeight: 800, color: 'rgba(124,77,255,0.7)', textTransform: 'uppercase' }}>{d}</Box>
                                ))}
                            </Box>
                            
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px 4px' }}>
                                {blanksArray.map((_, i) => <Box key={`blank-${i}`} />)}
                                {daysArray.map(day => {
                                    const yyyy = currentMonth.getFullYear();
                                    const mm = String(currentMonth.getMonth() + 1).padStart(2, '0');
                                    const dd = String(day).padStart(2, '0');
                                    const isSelected = date === `${yyyy}-${mm}-${dd}`;
                                    
                                    return (
                                        <DayButton 
                                            key={day} 
                                            isselected={isSelected ? 1 : 0}
                                            onClick={() => handleDateSelect(day)}
                                        >
                                            {day}
                                        </DayButton>
                                    );
                                })}
                            </Box>
                        </Popover>
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

const DateTrigger = styled.div`
    ${inputBase}
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    user-select: none;
    color: ${p => p.hasvalue ? '#F5F5FF' : 'rgba(200,210,255,0.3)'};
    
    &:hover {
        background: rgba(255,255,255,0.05);
    }
`;

const DayButton = styled.div`
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-family: Inter, sans-serif;
    font-weight: ${p => p.isselected ? 800 : 500};
    border-radius: 8px;
    cursor: pointer;
    background: ${p => p.isselected ? 'linear-gradient(135deg, #7C4DFF 0%, #B07AFE 100%)' : 'transparent'};
    color: ${p => p.isselected ? '#FFF' : '#F5F5FF'};
    transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
    
    &:hover {
        background: ${p => p.isselected ? 'linear-gradient(135deg, #7C4DFF 0%, #B07AFE 100%)' : 'rgba(124,77,255,0.2)'};
        transform: ${p => p.isselected ? 'none' : 'scale(1.15)'};
    }
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