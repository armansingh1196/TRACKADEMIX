import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Container, Box, Grid, Divider, Typography, CircularProgress } from '@mui/material';
import styled, { keyframes } from 'styled-components';
import AppHeader from '../../components/common/AppHeader';
import AppButton from '../../components/common/AppButton';

import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

const StudentProfile = () => {
    const { currentUser } = useSelector(state => state.user);
    const sclassName = currentUser?.sclassName;
    const studentSchool = currentUser?.school;

    const photoKey  = `profilePhoto_${currentUser?._id}`;
    const notifKey  = `notifPrefs_${currentUser?._id}`;

    /* ── Photo ── */
    const [photo, setPhoto]     = useState(() => localStorage.getItem(photoKey) || null);
    const [photoSaving, setPhotoSaving] = useState(false);
    const fileRef = useRef(null);

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoSaving(true);
        const reader = new FileReader();
        reader.onload = (ev) => {
            const b64 = ev.target.result;
            setPhoto(b64);
            localStorage.setItem(photoKey, b64);
            setTimeout(() => setPhotoSaving(false), 600);
        };
        reader.readAsDataURL(file);
    };

    const removePhoto = () => {
        setPhoto(null);
        localStorage.removeItem(photoKey);
    };

    /* ── Password ── */
    const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
    const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
    const [pwStatus, setPwStatus] = useState(null); // null | 'success' | 'error' | 'saving'
    const [pwError, setPwError] = useState('');

    const handlePwChange = (field) => (e) => setPwForm(p => ({ ...p, [field]: e.target.value }));

    const submitPassword = () => {
        if (!pwForm.current) { setPwError('Please enter your current password.'); setPwStatus('error'); return; }
        if (pwForm.next.length < 6) { setPwError('New password must be at least 6 characters.'); setPwStatus('error'); return; }
        if (pwForm.next !== pwForm.confirm) { setPwError('Passwords do not match.'); setPwStatus('error'); return; }
        setPwStatus('saving');
        // Simulated API call — replace with real endpoint
        setTimeout(() => {
            setPwStatus('success');
            setPwForm({ current: '', next: '', confirm: '' });
            setPwError('');
        }, 1200);
    };

    /* ── Notifications ── */
    const defaultNotifs = { attendance: true, exams: true, notices: true, ai: false };
    const [notifs, setNotifs] = useState(() => {
        try { return JSON.parse(localStorage.getItem(notifKey)) || defaultNotifs; }
        catch { return defaultNotifs; }
    });

    const toggleNotif = (key) => {
        const updated = { ...notifs, [key]: !notifs[key] };
        setNotifs(updated);
        localStorage.setItem(notifKey, JSON.stringify(updated));
    };

    const NOTIF_OPTIONS = [
        { key: 'attendance', label: 'Attendance Alerts',      desc: 'Notify when attendance falls below threshold' },
        { key: 'exams',      label: 'Exam Reminders',         desc: 'Upcoming exam schedule notifications' },
        { key: 'notices',    label: 'Institutional Notices',   desc: 'New announcements from administration' },
        { key: 'ai',         label: 'AI Performance Insights', desc: 'Weekly AI-generated performance summary' },
    ];

    const initial = String(currentUser?.name || '?').charAt(0).toUpperCase();

    return (
        <Container maxWidth="md" sx={{ mt: 2, mb: 6 }}>
            <AppHeader
                title="My Profile"
                subtitle="Manage your identity, security, and notification preferences."
            />

            {/* ════ Section 1: Identity Card ════ */}
            <SectionCard>
                <SectionLabel>
                    <PersonOutlineRoundedIcon sx={{ fontSize: 13 }} />
                    Academic Identity
                </SectionLabel>

                <Grid container spacing={4} alignItems="flex-start">
                    {/* Left: avatar + photo upload */}
                    <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        <AvatarWrap onClick={() => fileRef.current?.click()} title="Change photo">
                            {photo
                                ? <AvatarPhoto src={photo} alt={currentUser?.name} />
                                : <AvatarInitial>{initial}</AvatarInitial>
                            }
                            <CameraOverlay>
                                {photoSaving
                                    ? <CircularProgress size={18} sx={{ color: 'white' }} />
                                    : <CameraAltOutlinedIcon sx={{ fontSize: 18, color: 'white' }} />
                                }
                            </CameraOverlay>
                        </AvatarWrap>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />

                        <AvatarName>{currentUser?.name}</AvatarName>
                        <AvatarRole>Student Scholar</AvatarRole>

                        {photo && (
                            <RemovePhotoBtn onClick={removePhoto}>Remove photo</RemovePhotoBtn>
                        )}
                    </Grid>

                    {/* Right: details */}
                    <Grid item xs={12} md={9}>
                        <FieldGrid>
                            <FieldBlock>
                                <FieldLabel>Scholar Name</FieldLabel>
                                <FieldValue>
                                    <PersonOutlineRoundedIcon sx={{ fontSize: 16, color: 'rgba(124,77,255,0.7)' }} />
                                    {currentUser?.name}
                                </FieldValue>
                            </FieldBlock>
                            <FieldBlock>
                                <FieldLabel>Roll Number</FieldLabel>
                                <FieldValue>
                                    <BadgeOutlinedIcon sx={{ fontSize: 16, color: 'rgba(124,77,255,0.7)' }} />
                                    {currentUser?.rollNum || currentUser?.roll_num || '—'}
                                </FieldValue>
                            </FieldBlock>
                            <FieldBlock>
                                <FieldLabel>Assigned Class</FieldLabel>
                                <FieldValue>
                                    <SchoolOutlinedIcon sx={{ fontSize: 16, color: 'rgba(124,77,255,0.7)' }} />
                                    {sclassName?.sclassName || '—'}
                                </FieldValue>
                            </FieldBlock>
                            <FieldBlock>
                                <FieldLabel>Institution</FieldLabel>
                                <FieldValue>
                                    <BusinessOutlinedIcon sx={{ fontSize: 16, color: 'rgba(124,77,255,0.7)' }} />
                                    {studentSchool?.schoolName || '—'}
                                </FieldValue>
                            </FieldBlock>
                        </FieldGrid>

                        <VerifiedBadge>
                            <CheckCircleOutlinedIcon sx={{ fontSize: 14 }} />
                            Verified scholar of {studentSchool?.schoolName}. Access provided by TRACADEMIX.
                        </VerifiedBadge>
                    </Grid>
                </Grid>
            </SectionCard>

            {/* ════ Section 2: Change Password ════ */}
            <SectionCard>
                <SectionLabel>
                    <LockOutlinedIcon sx={{ fontSize: 13 }} />
                    Security — Change Password
                </SectionLabel>

                <PwGrid>
                    {[
                        { field: 'current', label: 'Current Password' },
                        { field: 'next',    label: 'New Password' },
                        { field: 'confirm', label: 'Confirm New Password' },
                    ].map(({ field, label }) => (
                        <PwFieldWrap key={field}>
                            <PwLabel>{label}</PwLabel>
                            <PwInputRow>
                                <PwInput
                                    type={showPw[field] ? 'text' : 'password'}
                                    value={pwForm[field]}
                                    onChange={handlePwChange(field)}
                                    placeholder="••••••••"
                                    autoComplete="off"
                                />
                                <EyeBtn type="button" onClick={() => setShowPw(p => ({ ...p, [field]: !p[field] }))}>
                                    {showPw[field]
                                        ? <VisibilityOffOutlinedIcon sx={{ fontSize: 16 }} />
                                        : <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                                    }
                                </EyeBtn>
                            </PwInputRow>
                        </PwFieldWrap>
                    ))}
                </PwGrid>

                {/* Strength bar */}
                {pwForm.next && (
                    <StrengthWrap>
                        <StrengthLabel>Strength</StrengthLabel>
                        {[1,2,3,4].map(n => {
                            const score = Math.min(4, Math.floor(pwForm.next.length / 3));
                            return <StrengthBar key={n} filled={n <= score} score={score} />;
                        })}
                        <StrengthLabel style={{ color: pwForm.next.length >= 12 ? '#34D399' : pwForm.next.length >= 8 ? '#FBBF24' : '#F87171' }}>
                            {pwForm.next.length >= 12 ? 'Strong' : pwForm.next.length >= 8 ? 'Medium' : 'Weak'}
                        </StrengthLabel>
                    </StrengthWrap>
                )}

                {pwStatus === 'error' && <StatusMsg error>{pwError}</StatusMsg>}
                {pwStatus === 'success' && <StatusMsg>✓ Password updated successfully</StatusMsg>}

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <AppButton
                        variant="contained"
                        color="primary"
                        onClick={submitPassword}
                        disabled={pwStatus === 'saving'}
                        size="small"
                        sx={{ background: 'var(--gradient-primary) !important', minWidth: 160 }}
                    >
                        {pwStatus === 'saving' ? 'Updating…' : 'Update Password'}
                    </AppButton>
                </Box>
            </SectionCard>

            {/* ════ Section 3: Notification Preferences ════ */}
            <SectionCard>
                <SectionLabel>
                    <NotificationsNoneOutlinedIcon sx={{ fontSize: 13 }} />
                    Notification Preferences
                </SectionLabel>
                <NotifDesc>
                    Control which alerts you receive from TRACADEMIX. Preferences are saved locally on this device.
                </NotifDesc>

                <NotifList>
                    {NOTIF_OPTIONS.map(({ key, label, desc }) => (
                        <NotifRow key={key}>
                            <NotifText>
                                <NotifLabel>{label}</NotifLabel>
                                <NotifSub>{desc}</NotifSub>
                            </NotifText>
                            <Toggle active={notifs[key]} onClick={() => toggleNotif(key)} aria-label={`Toggle ${label}`}>
                                <ToggleThumb active={notifs[key]} />
                            </Toggle>
                        </NotifRow>
                    ))}
                </NotifList>
            </SectionCard>
        </Container>
    );
};

export default StudentProfile;

/* ── Keyframes ── */
const fadeUp = keyframes`
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
`;

/* ── Section card ── */
const SectionCard = styled.div`
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(124, 77, 255, 0.1);
    border-radius: 20px;
    padding: 28px 32px;
    margin-bottom: 20px;
    backdrop-filter: blur(40px);
    animation: ${fadeUp} 0.5s cubic-bezier(0.16,1,0.3,1) both;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);

    @media (max-width: 600px) {
        padding: 20px 18px;
        border-radius: 16px;
    }
`;

const SectionLabel = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'Inter', sans-serif;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(124, 77, 255, 0.8);
    margin-bottom: 22px;
`;

/* ── Avatar ── */
const AvatarWrap = styled.div`
    width: 96px;
    height: 96px;
    border-radius: 50%;
    position: relative;
    cursor: pointer;
    flex-shrink: 0;
    border: 3px solid rgba(124, 77, 255, 0.35);
    overflow: hidden;
    background: linear-gradient(135deg, #7C4DFF 0%, #448AFF 100%);
    box-shadow: 0 8px 28px rgba(124,77,255,0.3);
    transition: border-color 0.2s ease;

    &:hover { border-color: rgba(124, 77, 255, 0.7); }
    &:hover > div:last-child { opacity: 1; }
`;

const AvatarPhoto = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
`;

const AvatarInitial = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    color: white;
`;

const CameraOverlay = styled.div`
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;
    border-radius: 50%;
`;

const AvatarName = styled.div`
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.925rem;
    font-weight: 800;
    color: #F5F5FF;
    letter-spacing: -0.015em;
    text-align: center;
`;

const AvatarRole = styled.div`
    font-size: 0.67rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(124,77,255,0.75);
`;

const RemovePhotoBtn = styled.button`
    font-size: 0.68rem;
    font-weight: 600;
    color: rgba(248,113,113,0.7);
    background: rgba(248,113,113,0.06);
    border: 1px solid rgba(248,113,113,0.15);
    border-radius: 100px;
    padding: 3px 10px;
    cursor: pointer;
    transition: all 0.18s ease;
    &:hover { color: #F87171; border-color: rgba(248,113,113,0.35); }
`;

/* ── Identity fields ── */
const FieldGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px 24px;
    margin-bottom: 20px;

    @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const FieldBlock = styled.div``;

const FieldLabel = styled.div`
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: rgba(200,210,255,0.38);
    margin-bottom: 6px;
`;

const FieldValue = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    color: rgba(226,232,255,0.85);
    letter-spacing: -0.011em;
    word-break: break-word;
`;

const VerifiedBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 0.72rem;
    font-weight: 500;
    color: rgba(200,210,255,0.35);
    padding: 10px 14px;
    border-radius: 12px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(124,77,255,0.08);
    line-height: 1.5;

    svg { color: rgba(52,211,153,0.7); flex-shrink: 0; font-size: 14px !important; }
`;

/* ── Password ── */
const PwGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;

    @media (max-width: 700px) { grid-template-columns: 1fr; }
`;

const PwFieldWrap = styled.div``;

const PwLabel = styled.div`
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(200,210,255,0.4);
    margin-bottom: 7px;
`;

const PwInputRow = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const PwInput = styled.input`
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(124,77,255,0.15);
    border-radius: 11px;
    padding: 10px 40px 10px 14px;
    font-family: 'Inter', sans-serif;
    font-size: 0.8125rem;
    color: #F5F5FF;
    letter-spacing: 0.04em;
    outline: none;
    transition: border-color 0.18s ease, box-shadow 0.18s ease;

    &::placeholder { color: rgba(200,210,255,0.2); letter-spacing: 0.08em; }
    &:focus {
        border-color: rgba(124,77,255,0.5);
        box-shadow: 0 0 0 3px rgba(124,77,255,0.08);
    }
`;

const EyeBtn = styled.button`
    position: absolute;
    right: 10px;
    background: none;
    border: none;
    cursor: pointer;
    color: rgba(200,210,255,0.35);
    display: flex;
    align-items: center;
    padding: 0;
    &:hover { color: rgba(200,210,255,0.7); }
`;

const StrengthWrap = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 14px;
`;

const StrengthLabel = styled.div`
    font-size: 0.65rem;
    font-weight: 600;
    color: rgba(200,210,255,0.4);
    letter-spacing: 0.04em;
`;

const StrengthBar = styled.div`
    height: 4px;
    flex: 1;
    border-radius: 10px;
    background: ${p => {
        if (!p.filled) return 'rgba(255,255,255,0.07)';
        if (p.score <= 1) return '#F87171';
        if (p.score <= 2) return '#FBBF24';
        if (p.score <= 3) return '#34D399';
        return '#10b981';
    }};
    transition: background 0.25s ease;
`;

const StatusMsg = styled.div`
    font-size: 0.75rem;
    font-weight: 600;
    color: ${p => p.error ? '#F87171' : '#34D399'};
    margin-bottom: 10px;
    padding: 8px 12px;
    border-radius: 8px;
    background: ${p => p.error ? 'rgba(248,113,113,0.07)' : 'rgba(52,211,153,0.07)'};
    border: 1px solid ${p => p.error ? 'rgba(248,113,113,0.15)' : 'rgba(52,211,153,0.15)'};
`;

/* ── Notifications ── */
const NotifDesc = styled.div`
    font-size: 0.78rem;
    color: rgba(200,210,255,0.4);
    font-weight: 400;
    margin-bottom: 20px;
    line-height: 1.6;
`;

const NotifList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0;
`;

const NotifRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 0;
    border-bottom: 1px solid rgba(124,77,255,0.07);
    &:last-child { border-bottom: none; padding-bottom: 0; }
    &:first-child { padding-top: 0; }
`;

const NotifText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 3px;
`;

const NotifLabel = styled.div`
    font-family: 'Inter', sans-serif;
    font-size: 0.825rem;
    font-weight: 600;
    color: rgba(226,232,255,0.85);
    letter-spacing: -0.011em;
`;

const NotifSub = styled.div`
    font-size: 0.7rem;
    font-weight: 400;
    color: rgba(200,210,255,0.38);
    line-height: 1.4;
`;

const Toggle = styled.div`
    width: 42px;
    height: 24px;
    border-radius: 100px;
    background: ${p => p.active ? 'linear-gradient(135deg, #7C4DFF, #9B6FF8)' : 'rgba(255,255,255,0.08)'};
    border: 1px solid ${p => p.active ? 'rgba(124,77,255,0.5)' : 'rgba(255,255,255,0.1)'};
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    transition: background 0.25s ease, border-color 0.25s ease;
    box-shadow: ${p => p.active ? '0 0 12px rgba(124,77,255,0.3)' : 'none'};
`;

const ToggleThumb = styled.div`
    position: absolute;
    top: 3px;
    left: ${p => p.active ? '20px' : '3px'};
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
    transition: left 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
`;