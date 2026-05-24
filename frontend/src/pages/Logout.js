import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authLogout } from '../redux/userRelated/userSlice';
import styled, { keyframes } from 'styled-components';
import { Dialog, DialogContent } from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

const Logout = () => {
    const currentUser = useSelector(state => state.user.currentUser);
    const navigate    = useNavigate();
    const dispatch    = useDispatch();

    const photoKey = `profilePhoto_${currentUser?._id}`;
    const photo    = currentUser?._id ? localStorage.getItem(photoKey) : null;
    const initial  = String(currentUser?.name || '?').charAt(0).toUpperCase();

    const handleLogout = () => { dispatch(authLogout()); navigate('/'); };
    const handleCancel = () => navigate(-1);

    return (
        <Dialog
            open={true}
            onClose={handleCancel}
            PaperProps={{ sx: { background: 'transparent', boxShadow: 'none', maxWidth: 400, width: '100%', overflow: 'visible', m: 2 } }}
            BackdropProps={{ sx: { backgroundColor: 'rgba(6,8,24,0.82)', backdropFilter: 'blur(16px)' } }}
        >
            <DialogContent sx={{ p: 0, overflow: 'visible' }}>
                <Card>
                    {/* Top accent band */}
                    <TopBand />

                    <CardBody>
                        {/* Avatar */}
                        <AvatarWrap>
                            {photo
                                ? <AvatarPhoto src={photo} alt={currentUser?.name} />
                                : <AvatarInitial>{initial}</AvatarInitial>
                            }
                            <AvatarGlow />
                        </AvatarWrap>

                        {/* Text */}
                        <TextBlock>
                            <Heading>Sign out?</Heading>
                            <Sub>
                                Hey <Name>{currentUser?.name}</Name>, are you sure you want to end your session?
                            </Sub>
                        </TextBlock>

                        {/* Session info chip */}
                        <SessionChip>
                            <Dot />
                            Active session
                        </SessionChip>

                        {/* Actions */}
                        <Actions>
                            <SignOutBtn onClick={handleLogout}>
                                <LogoutRoundedIcon sx={{ fontSize: 16 }} />
                                Sign Out Securely
                            </SignOutBtn>
                            <CancelBtn onClick={handleCancel}>
                                <ArrowBackIosNewIcon sx={{ fontSize: 11 }} />
                                Go Back
                            </CancelBtn>
                        </Actions>
                    </CardBody>
                </Card>
            </DialogContent>
        </Dialog>
    );
};

export default Logout;

/* ── Keyframes ── */
const scaleIn = keyframes`from{opacity:0;transform:scale(0.92) translateY(24px)}to{opacity:1;transform:scale(1) translateY(0)}`;
const pulse   = keyframes`0%,100%{opacity:0.6}50%{opacity:1}`;

const Card = styled.div`
    background: rgba(10, 8, 28, 0.97);
    border: 1px solid rgba(124,77,255,0.2);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,77,255,0.08);
    animation: ${scaleIn} 0.45s cubic-bezier(0.16,1,0.3,1) both;
`;

const TopBand = styled.div`
    height: 3px;
    background: linear-gradient(90deg, #7C4DFF 0%, #B07AFE 50%, #448AFF 100%);
`;

const CardBody = styled.div`
    padding: 32px 32px 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
`;

const AvatarWrap = styled.div`
    position: relative;
    width: 76px;
    height: 76px;
    border-radius: 50%;
    margin-bottom: 20px;
    flex-shrink: 0;
`;

const AvatarPhoto = styled.img`
    width: 76px;
    height: 76px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(124,77,255,0.35);
`;

const AvatarInitial = styled.div`
    width: 76px;
    height: 76px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7C4DFF 0%, #448AFF 100%);
    border: 2px solid rgba(124,77,255,0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1.75rem;
    font-weight: 800;
    color: white;
`;

const AvatarGlow = styled.div`
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(124,77,255,0.25) 0%, transparent 70%);
    pointer-events: none;
`;

const TextBlock = styled.div`
    text-align: center;
    margin-bottom: 16px;
`;

const Heading = styled.div`
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
    color: #F5F5FF;
    letter-spacing: -0.03em;
    margin-bottom: 8px;
`;

const Sub = styled.div`
    font-family: Inter, sans-serif;
    font-size: 0.875rem;
    color: rgba(226,232,255,0.45);
    line-height: 1.55;
    max-width: 280px;
`;

const Name = styled.span`
    color: #9B6FF8;
    font-weight: 600;
`;

const SessionChip = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(52,211,153,0.8);
    background: rgba(52,211,153,0.07);
    border: 1px solid rgba(52,211,153,0.15);
    border-radius: 100px;
    padding: 4px 10px;
    margin-bottom: 24px;
`;

const Dot = styled.div`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #34D399;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const Actions = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const SignOutBtn = styled.button`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 13px;
    border-radius: 13px;
    border: none;
    background: linear-gradient(135deg, #F87171 0%, #FB923C 100%);
    color: white;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 6px 24px rgba(248,113,113,0.3);
    transition: all 0.22s cubic-bezier(0.34,1.56,0.64,1);
    letter-spacing: -0.01em;

    &:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(248,113,113,0.4); }
    &:active { transform: scale(0.97); }
`;

const CancelBtn = styled.button`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 11px;
    border-radius: 13px;
    border: 1px solid rgba(124,77,255,0.1);
    background: rgba(255,255,255,0.03);
    color: rgba(226,232,255,0.45);
    font-family: Inter, sans-serif;
    font-size: 0.825rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s ease;

    &:hover { background: rgba(124,77,255,0.06); color: rgba(226,232,255,0.75); border-color: rgba(124,77,255,0.2); }
`;
