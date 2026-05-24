import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Tooltip, Popover } from '@mui/material';
import styled, { keyframes } from 'styled-components';

import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';

const ROLE_META = {
    Student:  { label: 'Student',       color: '#448AFF', bg: 'rgba(68,138,255,0.12)',  Icon: SchoolOutlinedIcon },
    Admin:    { label: 'Administrator', color: '#7C4DFF', bg: 'rgba(124,77,255,0.12)', Icon: AdminPanelSettingsOutlinedIcon },
    Teacher:  { label: 'Educator',      color: '#2DD4BF', bg: 'rgba(45,212,191,0.12)', Icon: MenuBookOutlinedIcon },
};

const AccountMenu = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();
    const { currentRole, currentUser } = useSelector(state => state.user);

    const role = ROLE_META[currentRole] || ROLE_META.Student;
    const RoleIcon = role.Icon;

    // Pull custom photo from localStorage
    const photoKey = `profilePhoto_${currentUser?._id}`;
    const photo = currentUser?._id ? localStorage.getItem(photoKey) : null;

    const initial = String(currentUser?.name || '?').charAt(0).toUpperCase();
    const identifier = currentUser?.email || (currentUser?.rollNum ? `Roll #${currentUser.rollNum}` : '');

    return (
        <>
            <Tooltip title="Account" placement="bottom">
                <TriggerBtn onClick={e => setAnchorEl(e.currentTarget)} aria-label="Account menu">
                    <AvatarRing active={open}>
                        {photo
                            ? <AvatarImg src={photo} alt={currentUser?.name} />
                            : <AvatarInitial>{initial}</AvatarInitial>
                        }
                    </AvatarRing>
                    <ChevronWrap open={open}>
                        <KeyboardArrowDownRoundedIcon sx={{ fontSize: 14 }} />
                    </ChevronWrap>
                </TriggerBtn>
            </Tooltip>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    sx: {
                        mt: 1.5,
                        background: 'rgba(10, 8, 28, 0.97) !important',
                        border: '1px solid rgba(124,77,255,0.2) !important',
                        borderRadius: '18px !important',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(124,77,255,0.08) !important',
                        backdropFilter: 'blur(40px) !important',
                        overflow: 'visible !important',
                        minWidth: 240,
                    }
                }}
            >
                {/* Arrow */}
                <Arrow />

                {/* User card header */}
                <UserCard>
                    <UserCardAvatar>
                        {photo
                            ? <AvatarImg src={photo} alt={currentUser?.name} style={{ width: 48, height: 48, borderRadius: '50%' }} />
                            : <CardInitial>{initial}</CardInitial>
                        }
                        <OnlineDot />
                    </UserCardAvatar>
                    <UserCardText>
                        <UserName>{currentUser?.name}</UserName>
                        <UserIdentifier>{identifier}</UserIdentifier>
                        <RoleBadge color={role.color} bg={role.bg}>
                            <RoleIcon sx={{ fontSize: 10 }} />
                            {role.label}
                        </RoleBadge>
                    </UserCardText>
                </UserCard>

                <MenuDivider />

                {/* Menu items */}
                <MenuBody>
                    <MenuItem onClick={() => { setAnchorEl(null); navigate(`/${currentRole}/profile`); }}>
                        <MenuIcon bg="rgba(124,77,255,0.1)">
                            <PersonOutlineRoundedIcon sx={{ fontSize: 15, color: '#9B6FF8' }} />
                        </MenuIcon>
                        <MenuLabel>My Profile</MenuLabel>
                        <MenuArrow>›</MenuArrow>
                    </MenuItem>

                    <MenuItem onClick={() => { setAnchorEl(null); navigate(`/${currentRole}/profile`); }}>
                        <MenuIcon bg="rgba(255,255,255,0.05)">
                            <SettingsOutlinedIcon sx={{ fontSize: 15, color: 'rgba(226,232,255,0.5)' }} />
                        </MenuIcon>
                        <MenuLabel>Settings</MenuLabel>
                        <MenuArrow>›</MenuArrow>
                    </MenuItem>
                </MenuBody>

                <MenuDivider />

                <MenuBody>
                    <MenuItem danger onClick={() => { setAnchorEl(null); navigate('/logout'); }}>
                        <MenuIcon bg="rgba(248,113,113,0.08)">
                            <LogoutRoundedIcon sx={{ fontSize: 15, color: '#F87171' }} />
                        </MenuIcon>
                        <MenuLabel>Sign Out</MenuLabel>
                    </MenuItem>
                </MenuBody>
            </Popover>
        </>
    );
};

export default AccountMenu;

/* ── Keyframes ── */
const pulse = keyframes`
    0%, 100% { box-shadow: 0 0 0 0 rgba(124,77,255,0.4); }
    50%       { box-shadow: 0 0 0 6px rgba(124,77,255,0); }
`;

/* ── Trigger ── */
const TriggerBtn = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 2px;
    border-radius: 100px;
    transition: opacity 0.2s ease;

    &:hover { opacity: 0.85; }
`;

const AvatarRing = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid ${p => p.active ? 'rgba(124,77,255,0.7)' : 'rgba(124,77,255,0.3)'};
    overflow: hidden;
    position: relative;
    background: linear-gradient(135deg, #7C4DFF 0%, #448AFF 100%);
    transition: border-color 0.2s ease;
    flex-shrink: 0;
`;

const AvatarImg = styled.img`
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
    font-size: 0.875rem;
    font-weight: 800;
    color: white;
`;

const ChevronWrap = styled.div`
    color: rgba(226,232,255,0.4);
    display: flex;
    align-items: center;
    transform: rotate(${p => p.open ? 180 : 0}deg);
    transition: transform 0.2s ease;
`;

/* ── Arrow pointer ── */
const Arrow = styled.div`
    position: absolute;
    top: -5px;
    right: 18px;
    width: 10px;
    height: 10px;
    background: rgba(10, 8, 28, 0.97);
    border-left: 1px solid rgba(124,77,255,0.2);
    border-top: 1px solid rgba(124,77,255,0.2);
    transform: rotate(45deg);
    z-index: 1;
`;

/* ── User card ── */
const UserCard = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 18px 14px;
`;

const UserCardAvatar = styled.div`
    position: relative;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7C4DFF 0%, #448AFF 100%);
    overflow: visible;
    flex-shrink: 0;
`;

const CardInitial = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 1.25rem;
    font-weight: 800;
    color: white;
    background: linear-gradient(135deg, #7C4DFF 0%, #448AFF 100%);
`;

const OnlineDot = styled.div`
    position: absolute;
    bottom: 1px;
    right: 1px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #34D399;
    border: 2px solid rgba(10, 8, 28, 0.97);
    animation: ${pulse} 3s ease-in-out infinite;
`;

const UserCardText = styled.div`
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
`;

const UserName = styled.div`
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 800;
    color: #F5F5FF;
    letter-spacing: -0.015em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const UserIdentifier = styled.div`
    font-size: 0.68rem;
    font-weight: 500;
    color: rgba(200,210,255,0.45);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const RoleBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: ${p => p.color};
    background: ${p => p.bg};
    border-radius: 100px;
    padding: 2px 7px;
    width: fit-content;
    margin-top: 1px;
`;

/* ── Divider ── */
const MenuDivider = styled.div`
    height: 1px;
    background: rgba(124,77,255,0.1);
    margin: 0 10px;
`;

/* ── Menu items ── */
const MenuBody = styled.div`
    padding: 6px 8px;
`;

const MenuItem = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.16s ease;

    &:hover {
        background: ${p => p.danger ? 'rgba(248,113,113,0.08)' : 'rgba(124,77,255,0.08)'};
    }
`;

const MenuIcon = styled.div`
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: ${p => p.bg};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const MenuLabel = styled.div`
    font-family: 'Inter', sans-serif;
    font-size: 0.8125rem;
    font-weight: 600;
    color: rgba(226,232,255,0.8);
    flex: 1;
    letter-spacing: -0.01em;
`;

const MenuArrow = styled.div`
    font-size: 1rem;
    color: rgba(226,232,255,0.2);
    font-weight: 300;
    line-height: 1;
`;