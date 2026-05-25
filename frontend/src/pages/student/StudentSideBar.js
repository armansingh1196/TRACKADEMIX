import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, Box, Typography as MuiTypography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { Home, LogOut, User, Megaphone, ClipboardList, Sparkles } from 'lucide-react';

const StudentSideBar = ({ open }) => {
    const location = useLocation();
    const isOpenStr = open ? 'true' : 'false';

    const menuItems = [
        { text: 'Dashboard', icon: <Home size={22} strokeWidth={2} />, path: '/Student/dashboard' },
        { text: 'Subjects', icon: <ClipboardList size={22} strokeWidth={2} />, path: '/Student/subjects' },
        { text: 'AI Insights', icon: <Sparkles size={22} strokeWidth={2} />, path: '/Student/ai-insights' },
        { text: 'Complains', icon: <Megaphone size={22} strokeWidth={2} />, path: '/Student/complain' },
    ];

    return (
        <StyledNav>
            {/* Academic Menu section */}
            <Box sx={{ px: open ? 2 : 1, pt: 3, pb: 1 }}>
                <SectionLabel isopen={isOpenStr}>Academic Menu</SectionLabel>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/Student/dashboard' && location.pathname.startsWith(item.path));
                    return (
                        <StyledListItem
                            key={item.text}
                            component={Link}
                            to={item.path}
                            className={isActive ? 'active' : ''}
                            isopen={isOpenStr}
                        >
                            <ListItemIcon className="icon">
                                {item.icon}
                            </ListItemIcon>
                            <LabelText className="text-label" isopen={isOpenStr}>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        sx: {
                                            fontFamily: 'var(--font-body)',
                                            fontWeight: isActive ? 600 : 500,
                                            fontSize: '0.9375rem',
                                            letterSpacing: '-0.01em',
                                            color: 'inherit'
                                        }
                                    }}
                                />
                            </LabelText>
                        </StyledListItem>
                    );
                })}
            </Box>

            <Divider sx={{ mx: 2, borderColor: 'rgba(84,84,88,0.4)', opacity: open ? 1 : 0, transition: 'opacity 0.3s' }} />

            {/* Account section */}
            <Box sx={{ px: open ? 2 : 1, pt: 2, pb: 3 }}>
                <SectionLabel isopen={isOpenStr}>Account</SectionLabel>
                <StyledListItem
                    component={Link}
                    to="/Student/profile"
                    className={location.pathname.startsWith('/Student/profile') ? 'active' : ''}
                    isopen={isOpenStr}
                >
                    <ListItemIcon className="icon">
                        <User size={22} strokeWidth={2} />
                    </ListItemIcon>
                    <LabelText className="text-label" isopen={isOpenStr}>
                        <ListItemText
                            primary="Profile"
                            primaryTypographyProps={{
                                sx: {
                                    fontFamily: 'var(--font-body)',
                                    fontWeight: location.pathname.startsWith('/Student/profile') ? 600 : 500,
                                    fontSize: '0.9375rem',
                                    letterSpacing: '-0.01em',
                                    color: 'inherit'
                                }
                            }}
                        />
                    </LabelText>
                </StyledListItem>

                <StyledListItem
                    component={Link}
                    to="/logout"
                    isopen={isOpenStr}
                    className="logout-item"
                >
                    <ListItemIcon className="icon">
                        <LogOut size={22} strokeWidth={2} />
                    </ListItemIcon>
                    <LabelText className="text-label" isopen={isOpenStr}>
                        <ListItemText
                            primary="Logout"
                            primaryTypographyProps={{
                                sx: {
                                    fontFamily: 'var(--font-body)',
                                    fontWeight: 500,
                                    fontSize: '0.9375rem',
                                    letterSpacing: '-0.01em',
                                    color: 'inherit'
                                }
                            }}
                        />
                    </LabelText>
                </StyledListItem>
            </Box>
        </StyledNav>
    );
};

export default StudentSideBar;

const SectionLabel = styled(MuiTypography)`
  padding: ${p => p.isopen === 'true' ? '0 8px 8px' : '0px 8px'};
  height: ${p => p.isopen === 'true' ? '24px' : '0px'};
  opacity: ${p => p.isopen === 'true' ? 1 : 0};
  overflow: hidden;
  font-family: var(--font-heading) !important;
  font-size: 0.6875rem !important;  /* 11px */
  font-weight: 700 !important;
  color: rgba(226,232,255,0.3) !important;
  letter-spacing: 0.1em !important;
  text-transform: uppercase;
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
`;

const StyledNav = styled.div`
  display: flex;
  flex-direction: column;
  color: rgba(226,232,255,0.75);
  height: 100%;
`;

const LabelText = styled.div`
  opacity: ${p => p.isopen === 'true' ? 1 : 0};
  max-width: ${p => p.isopen === 'true' ? '180px' : '0px'};
  visibility: ${p => p.isopen === 'true' ? 'visible' : 'hidden'};
  transition: opacity 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), max-width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), visibility 0.2s;
  white-space: nowrap;
  overflow: hidden;
  flex-grow: 1;
`;

const StyledListItem = styled(ListItemButton)`
  && {
    margin: 2px 4px !important;
    border-radius: 12px !important;
    padding: ${p => p.isopen === 'true' ? '10px 12px' : '10px 0'} !important;
    min-height: 44px;
    display: flex !important;
    align-items: center !important;
    justify-content: ${p => p.isopen === 'true' ? 'flex-start' : 'center'} !important;
    color: rgba(226, 232, 255, 0.6) !important;
    transition: padding 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), background-color 0.22s, color 0.22s !important;

    &:hover {
      background: rgba(255,255,255,0.04) !important;
      color: #F5F5FF !important;
      .icon { color: rgba(124,77,255,0.9) !important; }
    }

    &.active {
      background: rgba(124,77,255,0.14) !important;
      color: #F5F5FF !important;
      .icon { color: #9B6FF8 !important; }
      .MuiListItemText-primary { font-weight: 700 !important; color: #F5F5FF !important; }
    }

    &.logout-item:hover {
      background: rgba(248,113,113,0.08) !important;
      .icon { color: #F87171 !important; }
    }

    .icon {
      min-width: 0 !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      margin-right: ${p => p.isopen === 'true' ? '12px' : '0'} !important;
      color: rgba(226, 232, 255, 0.35) !important;
      transition: margin-right 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), color 0.2s ease !important;
    }

    .MuiListItemText-primary {
      font-size: 0.9rem !important;
      font-weight: 500;
      font-family: 'Inter', sans-serif;
      letter-spacing: -0.01em;
    }
  }
`;