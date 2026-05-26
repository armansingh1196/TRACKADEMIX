import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, Box, Typography as MuiTypography, Collapse, List } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

import { SquaresFour, PresentationChart, ClipboardText, Megaphone, CheckCircle, ClockCounterClockwise, CaretUp, CaretDown, User, SignOut, FileText } from '@phosphor-icons/react';

const TeacherSideBar = ({ open }) => {
    const { currentUser } = useSelector((state) => state.user);
    const sclassName = currentUser.teachSclass;
    const location = useLocation();

    const [openAttendance, setOpenAttendance] = React.useState(false);

    const menuItems = [
        { text: 'Dashboard', icon: <SquaresFour weight="fill" size={22} />, path: '/Teacher/dashboard' },
        { text: `Class ${sclassName?.sclassName || ''}`, icon: <PresentationChart weight="fill" size={22} />, path: '/Teacher/class' },
        { text: 'Upload Marks', icon: <ClipboardText weight="fill" size={22} />, path: '/Teacher/marks' },
        { text: 'Documents', icon: <FileText weight="fill" size={22} />, path: '/Teacher/documents' },
        { text: 'Complaints', icon: <Megaphone weight="fill" size={22} />, path: '/Teacher/complain' },
    ];

    const isOpenStr = open ? 'true' : 'false';

    return (
        <StyledNav>
            <Box sx={{ px: open ? 2 : 1, py: 3 }}>
                <SectionLabel isopen={isOpenStr}>ACADEMIC MENU</SectionLabel>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/Teacher/dashboard' && location.pathname.startsWith(item.path));
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
                                <ListItemText primary={item.text} />
                            </LabelText>
                        </StyledListItem>
                    );
                })}
                
                {/* Attendance Submenu */}
                <StyledListItem 
                    onClick={() => setOpenAttendance(!openAttendance)}
                    isopen={isOpenStr}
                >
                    <ListItemIcon className="icon">
                        <CheckCircle weight="fill" size={22} />
                    </ListItemIcon>
                    <LabelText className="text-label" isopen={isOpenStr}>
                        <ListItemText primary="Attendance" />
                    </LabelText>
                    {open && (openAttendance ? <CaretUp weight="bold" size={16} color="rgba(226,232,255,0.4)" /> : <CaretDown weight="bold" size={16} color="rgba(226,232,255,0.4)" />)}
                </StyledListItem>
                
                <Collapse in={openAttendance} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <StyledListItem 
                            component={Link} 
                            to="/Teacher/attendance"
                            className={location.pathname === "/Teacher/attendance" ? 'active' : ''}
                            isopen={isOpenStr}
                            sx={{ pl: open ? 4 : undefined }}
                        >
                            <ListItemIcon className="icon">
                                <CheckCircle weight="fill" size={18} />
                            </ListItemIcon>
                            <LabelText className="text-label" isopen={isOpenStr}>
                                <ListItemText primary="Mark Attendance" />
                            </LabelText>
                        </StyledListItem>
                        <StyledListItem 
                            component={Link} 
                            to="/Teacher/attendance-record"
                            className={location.pathname === "/Teacher/attendance-record" ? 'active' : ''}
                            isopen={isOpenStr}
                            sx={{ pl: open ? 4 : undefined }}
                        >
                            <ListItemIcon className="icon">
                                <ClockCounterClockwise weight="fill" size={18} />
                            </ListItemIcon>
                            <LabelText className="text-label" isopen={isOpenStr}>
                                <ListItemText primary="Attendance Record" />
                            </LabelText>
                        </StyledListItem>
                    </List>
                </Collapse>
            </Box>
            
            <Divider sx={{ my: 1, borderColor: 'rgba(124, 77, 255, 0.08)', opacity: open ? 1 : 0, transition: 'opacity 0.3s' }} />
            
            <Box sx={{ px: open ? 2 : 1, py: 2 }}>
                <SectionLabel isopen={isOpenStr}>ACCOUNT</SectionLabel>
                <StyledListItem 
                    component={Link} 
                    to="/Teacher/profile"
                    className={location.pathname.startsWith("/Teacher/profile") ? 'active' : ''}
                    isopen={isOpenStr}
                >
                    <ListItemIcon className="icon">
                        <User weight="fill" size={22} />
                    </ListItemIcon>
                    <LabelText className="text-label" isopen={isOpenStr}>
                        <ListItemText primary="Profile" />
                    </LabelText>
                </StyledListItem>
                <StyledListItem 
                    component={Link} 
                    to="/logout"
                    isopen={isOpenStr}
                    className="logout-item"
                >
                    <ListItemIcon className="icon">
                        <SignOut weight="fill" size={22} />
                    </ListItemIcon>
                    <LabelText className="text-label" isopen={isOpenStr}>
                        <ListItemText primary="Logout" />
                    </LabelText>
                </StyledListItem>
            </Box>
        </StyledNav>
    );
}

export default TeacherSideBar;

const SectionLabel = styled(MuiTypography)`
  padding: ${p => p.isopen === 'true' ? '8px 16px' : '0px 16px'};
  height: ${p => p.isopen === 'true' ? '28px' : '0px'};
  opacity: ${p => p.isopen === 'true' ? 1 : 0};
  overflow: hidden;
  font-size: 0.7rem !important;
  font-weight: 800 !important;
  color: var(--text-muted) !important;
  letter-spacing: 2px !important;
  text-transform: uppercase;
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
`;

const StyledNav = styled.div`
  display: flex;
  flex-direction: column;
  color: var(--text-secondary);
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