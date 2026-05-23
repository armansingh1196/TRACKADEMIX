import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, Box, Typography as MuiTypography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const StudentSideBar = ({ open }) => {
    const location = useLocation();

    const menuItems = [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/Student/dashboard' },
        { text: 'Subjects', icon: <AssignmentIcon />, path: '/Student/subjects' },
        { text: 'AI Insights', icon: <AutoAwesomeIcon />, path: '/Student/ai-insights' },
        { text: 'Complains', icon: <AnnouncementOutlinedIcon />, path: '/Student/complain' },
    ];

    return (
        <StyledNav>
            {/* Academic Menu section */}
            <Box sx={{ px: 2, pt: 3, pb: 1 }}>
                {open && <SectionLabel>Academic Menu</SectionLabel>}
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/Student/dashboard' && location.pathname.startsWith(item.path));
                    return (
                        <NavItem
                            key={item.text}
                            component={Link}
                            to={item.path}
                            isactive={isActive ? 'true' : 'false'}
                            sx={{ justifyContent: open ? 'initial' : 'center' }}
                        >
                            <NavIcon isactive={isActive ? 'true' : 'false'} sx={{ mr: open ? 2 : 'auto' }}>
                                {item.icon}
                            </NavIcon>
                            {open && (
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        sx: {
                                            fontFamily: 'var(--font-body)',
                                            fontWeight: isActive ? 600 : 500,
                                            fontSize: '0.9375rem',
                                            letterSpacing: '-0.01em',
                                            color: isActive ? '#F5F5FF' : 'rgba(226,232,255,0.6)',
                                        }
                                    }}
                                />
                            )}
                        </NavItem>
                    );
                })}
            </Box>

            <Divider sx={{ mx: 2, borderColor: 'rgba(84,84,88,0.4)', opacity: open ? 1 : 0 }} />

            {/* Account section */}
            <Box sx={{ px: 2, pt: 2, pb: 3 }}>
                {open && <SectionLabel>Account</SectionLabel>}
                <NavItem
                    component={Link}
                    to="/Student/profile"
                    isactive={location.pathname.startsWith('/Student/profile') ? 'true' : 'false'}
                    sx={{ justifyContent: open ? 'initial' : 'center' }}
                >
                    <NavIcon isactive={location.pathname.startsWith('/Student/profile') ? 'true' : 'false'} sx={{ mr: open ? 2 : 'auto' }}>
                        <AccountCircleOutlinedIcon />
                    </NavIcon>
                    {open && (
                        <ListItemText
                            primary="Profile"
                            primaryTypographyProps={{
                                sx: {
                                    fontFamily: 'var(--font-body)',
                                    fontWeight: location.pathname.startsWith('/Student/profile') ? 600 : 500,
                                    fontSize: '0.9375rem',
                                    letterSpacing: '-0.01em',
                                    color: location.pathname.startsWith('/Student/profile') ? '#F5F5FF' : 'rgba(226,232,255,0.6)',
                                }
                            }}
                        />
                    )}
                </NavItem>

                <LogoutItem
                    component={Link}
                    to="/logout"
                    sx={{ justifyContent: open ? 'initial' : 'center' }}
                >
                    <NavIcon isactive="false" sx={{ mr: open ? 2 : 'auto' }} logout="true">
                        <ExitToAppIcon />
                    </NavIcon>
                    {open && (
                        <ListItemText
                            primary="Logout"
                            primaryTypographyProps={{
                                sx: {
                                    fontFamily: 'var(--font-body)',
                                    fontWeight: 500,
                                    fontSize: '0.9375rem',
                                    letterSpacing: '-0.01em',
                                    color: 'rgba(226,232,255,0.5)',
                                }
                            }}
                        />
                    )}
                </LogoutItem>
            </Box>
        </StyledNav>
    );
};

export default StudentSideBar;

const SectionLabel = styled(MuiTypography)`
  padding: 0 8px 8px;
  font-family: var(--font-heading) !important;
  font-size: 0.6875rem !important;  /* 11px */
  font-weight: 700 !important;
  color: rgba(226,232,255,0.3) !important;
  letter-spacing: 0.1em !important;
  text-transform: uppercase;
  white-space: nowrap;
`;

const StyledNav = styled.div`
  display: flex;
  flex-direction: column;
  color: rgba(226,232,255,0.75);
  height: 100%;
`;

const NavItem = styled(ListItemButton)`
  && {
    margin: 2px 4px !important;
    border-radius: 12px !important;
    transition: all 0.25s cubic-bezier(0.25,0.46,0.45,0.94) !important;
    padding: 10px 12px !important;
    min-height: 44px;
    background: ${props => props.isactive === 'true'
        ? 'rgba(124, 77, 255, 0.14) !important'
        : 'transparent !important'};

    &:hover {
      background: ${props => props.isactive === 'true'
        ? 'rgba(124,77,255,0.18) !important'
        : 'rgba(255,255,255,0.04) !important'};
    }
  }
`;

const LogoutItem = styled(ListItemButton)`
  && {
    margin: 2px 4px !important;
    border-radius: 12px !important;
    transition: all 0.25s ease !important;
    padding: 10px 12px !important;
    min-height: 44px;

    &:hover {
      background: rgba(255,69,58,0.08) !important;

      .logout-icon { color: #FF453A !important; }
    }
  }
`;

const NavIcon = styled(ListItemIcon)`
  && {
    min-width: 0 !important;
    color: ${props => {
        if (props.logout === 'true') return 'rgba(226,232,255,0.3)';
        return props.isactive === 'true' ? '#9B6FF8' : 'rgba(226,232,255,0.35)';
    }} !important;
    transition: color 0.2s ease !important;

    svg {
      font-size: 22px;
    }

    &.logout-icon {
      color: rgba(226,232,255,0.3);
    }
  }
`;