import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllNotices } from '../redux/noticeRelated/noticeHandle';
import { CircularProgress, Dialog, DialogContent, Backdrop } from '@mui/material';
import styled, { keyframes } from 'styled-components';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

/* 
 * Monochromatic purple-spectrum tints — feel cohesive, not rainbow.
 * Each is just a different opacity/hue step of the core accent.
 */
const DOT_COLORS = [
    'rgba(124, 77, 255, 0.9)',   // core violet
    'rgba(155, 111, 248, 0.75)', // lighter lavender
    'rgba(100, 60, 220, 0.8)',   // deeper indigo
    'rgba(180, 140, 255, 0.7)',  // pale lilac
    'rgba(90,  55, 200, 0.85)',  // deep violet
];

const SeeNotice = () => {
    const dispatch = useDispatch();
    const { currentUser, currentRole } = useSelector(state => state.user);
    const { noticesList, loading, response } = useSelector(state => state.notice);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        if (currentRole === 'Admin') {
            if (currentUser?._id) dispatch(getAllNotices(currentUser._id, 'Notice'));
        } else {
            const schoolID = currentUser?.school?._id || currentUser?.school;
            if (schoolID) dispatch(getAllNotices(schoolID, 'Notice'));
        }
    }, [dispatch, currentRole, currentUser]);

    return (
        <Wrapper>
            {/* ── Header ── */}
            <Header>
                <IconWrap>
                    <CampaignOutlinedIcon sx={{ fontSize: 16, color: 'var(--primary)' }} />
                </IconWrap>
                <HeaderText>
                    <Title>Institutional Notices</Title>
                    <Sub>
                        {noticesList?.length > 0
                            ? `${noticesList.length} active announcement${noticesList.length > 1 ? 's' : ''}`
                            : 'School announcements'}
                    </Sub>
                </HeaderText>
                {noticesList?.length > 0 && (
                    <LiveBadge>
                        <FiberManualRecordIcon sx={{ fontSize: 6 }} />
                        Live
                    </LiveBadge>
                )}
            </Header>

            {/* ── States ── */}
            {loading ? (
                <StateBox>
                    <CircularProgress size={18} sx={{ color: 'var(--primary)' }} />
                    <StateText>Syncing…</StateText>
                </StateBox>
            ) : response || !noticesList || noticesList.length === 0 ? (
                <EmptyBox>
                    <span>📭</span>
                    <StateText>No announcements right now</StateText>
                </EmptyBox>
            ) : (
                <Feed>
                    {noticesList.map((notice, idx) => {
                        const date    = new Date(notice.date);
                        const isValid = date.toString() !== 'Invalid Date';
                        const dotColor = DOT_COLORS[idx % DOT_COLORS.length];

                        const dateLabel = isValid
                            ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                            : null;

                        return (
                            <NoticeCard
                                key={notice._id || idx}
                                delay={idx * 0.05}
                                onClick={() => setSelected({ notice, dotColor, date, isValid, dateLabel })}
                                role="button"
                                tabIndex={0}
                                onKeyDown={e => e.key === 'Enter' && setSelected({ notice, dotColor, date, isValid, dateLabel })}
                            >
                                {/* Subtle frosted left border flash */}
                                <Stripe color={dotColor} />

                                <CardInner>
                                    {/* Row 1: title + date pill */}
                                    <TitleRow>
                                        <Dot color={dotColor} />
                                        <NoticeTitle>{notice.title || 'Untitled Notice'}</NoticeTitle>
                                        {dateLabel && <DatePill>{dateLabel}</DatePill>}
                                    </TitleRow>

                                    {/* Row 2: detail excerpt */}
                                    {notice.details && (
                                        <Detail>{notice.details}</Detail>
                                    )}
                                </CardInner>
                                <ChevronHint>›</ChevronHint>
                            </NoticeCard>
                        );
                    })}
                </Feed>
            )}

            {/* ── Notice Detail Dialog ── */}
            <Dialog
                open={!!selected}
                onClose={() => setSelected(null)}
                maxWidth="sm"
                fullWidth
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        sx: {
                            backgroundColor: 'rgba(6, 8, 24, 0.75)',
                            backdropFilter: 'blur(8px)',
                        }
                    }
                }}
                PaperProps={{
                    sx: {
                        background: 'rgba(13, 11, 34, 0.96) !important',
                        border: '1px solid rgba(124, 77, 255, 0.2) !important',
                        borderRadius: '20px !important',
                        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,77,255,0.1) !important',
                        backdropFilter: 'blur(40px) !important',
                        overflow: 'visible',
                        m: 2,
                    }
                }}
            >
                {selected && (
                    <DialogContent sx={{ p: 0, overflow: 'hidden', borderRadius: '20px' }}>
                        <ModalInner>
                            {/* Top accent band */}
                            <ModalBand color={selected.dotColor} />

                            {/* Close button */}
                            <CloseBtn onClick={() => setSelected(null)} aria-label="Close">
                                <CloseRoundedIcon sx={{ fontSize: 16 }} />
                            </CloseBtn>

                            <ModalBody>
                                {/* Icon + category chip */}
                                <ModalTopRow>
                                    <ModalIconWrap color={selected.dotColor}>
                                        <CampaignOutlinedIcon sx={{ fontSize: 18, color: selected.dotColor }} />
                                    </ModalIconWrap>
                                    <CategoryChip>Institutional Notice</CategoryChip>
                                </ModalTopRow>

                                {/* Title */}
                                <ModalTitle>{selected.notice.title || 'Untitled Notice'}</ModalTitle>

                                {/* Date row */}
                                {selected.isValid && (
                                    <ModalMeta>
                                        <CalendarTodayOutlinedIcon sx={{ fontSize: 13, opacity: 0.5 }} />
                                        <ModalMetaText>
                                            {selected.date.toLocaleDateString('en-IN', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </ModalMetaText>
                                    </ModalMeta>
                                )}

                                {/* Divider */}
                                <ModalDivider />

                                {/* Details body */}
                                <ModalDetails>
                                    {selected.notice.details || 'No further details were provided for this notice.'}
                                </ModalDetails>
                            </ModalBody>
                        </ModalInner>
                    </DialogContent>
                )}
            </Dialog>
        </Wrapper>
    );
};

export default SeeNotice;

/* ─── Keyframes ─── */
const slideUp = keyframes`
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.35; }
`;

/* ─── Layout ─── */
const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
`;

/* ─── Header ─── */
const Header = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
`;

const IconWrap = styled.div`
    width: 30px;
    height: 30px;
    border-radius: 9px;
    background: rgba(124, 77, 255, 0.1);
    border: 1px solid rgba(124, 77, 255, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const HeaderText = styled.div`
    flex: 1;
    min-width: 0;
`;

const Title = styled.div`
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 800;
    color: var(--text-1);
    letter-spacing: -0.02em;
    line-height: 1.2;
`;

const Sub = styled.div`
    font-size: 0.67rem;
    font-weight: 500;
    color: var(--text-muted);
    margin-top: 1px;
`;

const LiveBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #34D399;
    background: rgba(52, 211, 153, 0.08);
    border: 1px solid rgba(52, 211, 153, 0.18);
    border-radius: 100px;
    padding: 3px 7px;
    flex-shrink: 0;
    svg { animation: ${pulse} 2s ease-in-out infinite; }
`;

/* ─── State boxes ─── */
const StateBox = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 32px 16px;
    flex: 1;
`;

const StateText = styled.div`
    font-size: 0.78rem;
    font-weight: 500;
    color: var(--text-muted);
`;

const EmptyBox = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 40px 20px;
    background: rgba(255, 255, 255, 0.012);
    border: 1px dashed rgba(124, 77, 255, 0.12);
    border-radius: 14px;
    font-size: 1.6rem;
    flex: 1;
`;

/* ─── Feed ─── */
const Feed = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    overflow-y: auto;
    padding-right: 3px;
    max-height: 360px;

    &::-webkit-scrollbar { width: 3px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb {
        background: rgba(124, 77, 255, 0.18);
        border-radius: 10px;
    }
    &::-webkit-scrollbar-thumb:hover {
        background: rgba(124, 77, 255, 0.35);
    }
`;

/* ─── Notice Card ─── */
const NoticeCard = styled.div`
    position: relative;
    display: flex;
    align-items: stretch;
    border-radius: 11px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.045);
    animation: ${slideUp} 0.38s ${p => p.delay || 0}s cubic-bezier(0.16, 1, 0.3, 1) both;
    transition: background 0.18s ease, border-color 0.18s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: pointer;

    &:hover {
        background: rgba(124, 77, 255, 0.05);
        border-color: rgba(124, 77, 255, 0.18);
        transform: translateY(-1px);
    }
`;

const Stripe = styled.div`
    width: 2.5px;
    background: ${p => p.color || 'var(--primary)'};
    flex-shrink: 0;
    border-radius: 4px 0 0 4px;
    opacity: 0.6;
`;

const CardInner = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 12px;
    flex: 1;
    min-width: 0;
`;

/* ─── Title row ─── */
const TitleRow = styled.div`
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
`;

const Dot = styled.div`
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: ${p => p.color || 'var(--primary)'};
    flex-shrink: 0;
    box-shadow: 0 0 5px ${p => p.color || 'var(--primary)'};
`;

const NoticeTitle = styled.div`
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-1);
    letter-spacing: -0.01em;
    line-height: 1.3;
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const DatePill = styled.div`
    font-size: 0.6rem;
    font-weight: 700;
    color: var(--text-muted);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 100px;
    padding: 1px 7px;
    white-space: nowrap;
    flex-shrink: 0;
    letter-spacing: 0.02em;
`;

/* ─── Detail ─── */
const Detail = styled.div`
    font-size: 0.72rem;
    font-weight: 400;
    color: var(--text-muted);
    line-height: 1.45;
    padding-left: 12px;  /* align under title text, past dot */
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    opacity: 0.75;
`;

/* ─── Chevron hint on card ─── */
const ChevronHint = styled.div`
    display: flex;
    align-items: center;
    padding-right: 10px;
    color: rgba(124, 77, 255, 0.35);
    font-size: 1.1rem;
    font-weight: 300;
    transition: color 0.18s ease, transform 0.18s ease;
    flex-shrink: 0;
    align-self: center;

    ${NoticeCard}:hover & {
        color: rgba(124, 77, 255, 0.7);
        transform: translateX(2px);
    }
`;

/* ─── Modal internals ─── */
const ModalInner = styled.div`
    position: relative;
    overflow: hidden;
    border-radius: 20px;
`;

const ModalBand = styled.div`
    height: 4px;
    background: ${p => p.color || 'var(--primary)'};
    opacity: 0.7;
    width: 100%;
`;

const CloseBtn = styled.button`
    position: absolute;
    top: 14px;
    right: 14px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.18s ease, color 0.18s ease;
    z-index: 10;

    &:hover {
        background: rgba(124, 77, 255, 0.15);
        color: var(--text-1);
    }
`;

const ModalBody = styled.div`
    padding: 24px 28px 28px;
    display: flex;
    flex-direction: column;
    gap: 14px;
`;

const ModalTopRow = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const ModalIconWrap = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${p => p.color ? `${p.color.replace(')', ', 0.12)').replace('rgba', 'rgba')}` : 'rgba(124,77,255,0.12)'};
    border: 1px solid ${p => p.color ? `${p.color.replace(')', ', 0.2)').replace('rgba', 'rgba')}` : 'rgba(124,77,255,0.2)'};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const CategoryChip = styled.div`
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--primary);
    background: rgba(124, 77, 255, 0.08);
    border: 1px solid rgba(124, 77, 255, 0.18);
    border-radius: 100px;
    padding: 3px 10px;
`;

const ModalTitle = styled.div`
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--text-1);
    letter-spacing: -0.025em;
    line-height: 1.3;
`;

const ModalMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-muted);
`;

const ModalMetaText = styled.div`
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-muted);
`;

const ModalDivider = styled.div`
    height: 1px;
    background: rgba(124, 77, 255, 0.1);
    margin: 2px 0;
`;

const ModalDetails = styled.div`
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--text-2);
    line-height: 1.75;
    white-space: pre-wrap;
    word-break: break-word;
`;