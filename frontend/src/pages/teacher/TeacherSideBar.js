import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, Box, Typography as MuiTypography, Collapse, List } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
const TeacherSideBar = ({ open }) => {
    const { currentUser } = useSelector((state) => state.user);
    const sclassName = currentUser.teachSclass;
    const location = useLocation();

    const [openAttendance, setOpenAttendance] = React.useState(false);

    const menuItems = [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/Teacher/dashboard' },
        { text: `Class ${sclassName?.sclassName || ''}`, icon: <ClassOutlinedIcon />, path: '/Teacher/class' },
        { text: 'Upload Marks', icon: <AssignmentIcon />, path: '/Teacher/marks' },
        { text: 'Complains', icon: <AnnouncementOutlinedIcon />, path: '/Teacher/complain' },
    ];


    return (
        <StyledNav>
            <Box sx={{ px: 2, py: 3 }}>
                {open && <SectionLabel>ACADEMIC MENU</SectionLabel>}
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/Teacher/dashboard' && location.pathname.startsWith(item.path));
                    return (
                        <StyledListItem 
                            key={item.text} 
                            component={Link} 
                            to={item.path}
                            className={isActive ? 'active' : ''}
                            isopen={open ? 'true' : 'false'}
                        >
                            <ListItemIcon className="icon">
                                {item.icon}
                            </ListItemIcon>
                            {open && <ListItemText primary={item.text} />}
                        </StyledListItem>
                    );
                })}
                
                {/* Attendance Submenu */}
                <StyledListItem 
                    onClick={() => setOpenAttendance(!openAttendance)}
                    isopen={open ? 'true' : 'false'}
                >
                    <ListItemIcon className="icon">
                        <CheckCircleOutlineIcon />
                    </ListItemIcon>
                    {open && <ListItemText primary="Attendance" />}
                    {open && (openAttendance ? <ExpandLess sx={{color:'var(--text-muted)'}} /> : <ExpandMore sx={{color:'var(--text-muted)'}} />)}
                </StyledListItem>
                
                <Collapse in={openAttendance} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <StyledListItem 
                            component={Link} 
                            to="/Teacher/attendance"
                            className={location.pathname === "/Teacher/attendance" ? 'active' : ''}
                            isopen={open ? 'true' : 'false'}
                            sx={{ pl: open ? 4 : undefined }}
                        >
                            <ListItemIcon className="icon">
                                <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
                            </ListItemIcon>
                            {open && <ListItemText primary="Mark Attendance" />}
                        </StyledListItem>
                        <StyledListItem 
                            component={Link} 
                            to="/Teacher/attendance-record"
                            className={location.pathname === "/Teacher/attendance-record" ? 'active' : ''}
                            isopen={open ? 'true' : 'false'}
                        >
                            <ListItemIcon className="icon">
                                <HistoryOutlinedIcon sx={{ fontSize: 18 }} />
                            </ListItemIcon>
                            {open && <ListItemText primary="Attendance Record" />}
                        </StyledListItem>
                    </List>
                </Collapse>
            </Box>
            
            <Divider sx={{ my: 1, borderColor: 'var(--border)', opacity: open ? 1 : 0 }} />
            
            <Box sx={{ px: 2, py: 2 }}>
                {open && <SectionLabel>ACCOUNT</SectionLabel>}
                <StyledListItem 
                    component={Link} 
                    to="/Teacher/profile"
                    className={location.pathname.startsWith("/Teacher/profile") ? 'active' : ''}
                    isopen={open ? 'true' : 'false'}
                >
                    <ListItemIcon className="icon">
                        <AccountCircleOutlinedIcon />
                    </ListItemIcon>
                    {open && <ListItemText primary="Profile" />}
                </StyledListItem>
                <StyledListItem 
                    component={Link} 
                    to="/logout"
                    isopen={open ? 'true' : 'false'}
                    className="logout-item"
                >
                    <ListItemIcon className="icon">
                        <ExitToAppIcon />
                    </ListItemIcon>
                    {open && <ListItemText primary="Logout" />}
                </StyledListItem>
            </Box>
        </StyledNav>
    );
}

export default TeacherSideBar;

const SectionLabel = styled(MuiTypography)`
  padding: 8px 16px;
  font-size: 0.7rem !important;
  font-weight: 800 !important;
  color: var(--text-muted) !important;
  letter-spacing: 2px !important;
  text-transform: uppercase;
  white-space: nowrap;
`;

const StyledNav = styled.div`
  display: flex;
  flex-direction: column;
  color: var(--text-secondary);
`;

const StyledListItem = styled(ListItemButton)`
  && {
    margin: 2px 4px !important;
    border-radius: 12px !important;
    transition: all 0.22s cubic-bezier(0.25,0.46,0.45,0.94) !important;
    padding: ${p => p.isopen === 'true' ? '10px 12px' : '10px'} !important;
    min-height: 44px;
    justify-content: ${p => p.isopen === 'true' ? 'flex-start' : 'center'} !important;
    color: rgba(226,232,255,0.6) !important;

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
      width: ${p => p.isopen === 'true' ? 'auto' : '100%'} !important;
      display: flex !important;
      justify-content: center !important;
      margin-right: ${p => p.isopen === 'true' ? '12px' : '0'} !important;
      color: rgba(226,232,255,0.35) !important;
      transition: color 0.2s ease !important;
      svg { font-size: 20px; }
    }

    .MuiListItemText-primary {
      font-size: 0.9rem !important;
      font-weight: 500;
      font-family: 'Inter', sans-serif;
      letter-spacing: -0.01em;
    }
  }
`;