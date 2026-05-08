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
                            sx={{ justifyContent: open ? 'initial' : 'center' }}
                        >
                            <ListItemIcon className="icon" sx={{ mr: open ? 3 : 'auto' }}>
                                {item.icon}
                            </ListItemIcon>
                            {open && <ListItemText primary={item.text} />}
                        </StyledListItem>
                    );
                })}
                
                {/* Attendance Submenu */}
                <StyledListItem 
                    onClick={() => setOpenAttendance(!openAttendance)}
                    sx={{ justifyContent: open ? 'initial' : 'center' }}
                >
                    <ListItemIcon className="icon" sx={{ mr: open ? 3 : 'auto' }}>
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
                            sx={{ pl: open ? 4 : 'initial', justifyContent: open ? 'initial' : 'center' }}
                        >
                            <ListItemIcon className="icon" sx={{ mr: open ? 3 : 'auto' }}>
                                <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
                            </ListItemIcon>
                            {open && <ListItemText primary="Mark Attendance" />}
                        </StyledListItem>
                        <StyledListItem 
                            component={Link} 
                            to="/Teacher/attendance-record"
                            className={location.pathname === "/Teacher/attendance-record" ? 'active' : ''}
                            sx={{ pl: open ? 4 : 'initial', justifyContent: open ? 'initial' : 'center' }}
                        >
                            <ListItemIcon className="icon" sx={{ mr: open ? 3 : 'auto' }}>
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
                    sx={{ justifyContent: open ? 'initial' : 'center' }}
                >
                    <ListItemIcon className="icon" sx={{ mr: open ? 3 : 'auto' }}>
                        <AccountCircleOutlinedIcon />
                    </ListItemIcon>
                    {open && <ListItemText primary="Profile" />}
                </StyledListItem>
                <StyledListItem 
                    component={Link} 
                    to="/logout"
                    sx={{ 
                        '&:hover .icon': { color: 'var(--secondary) !important' },
                        justifyContent: open ? 'initial' : 'center'
                    }}
                >
                    <ListItemIcon className="icon" sx={{ mr: open ? 3 : 'auto' }}>
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
  margin: 4px 12px !important;
  border-radius: 14px !important;
  transition: var(--transition) !important;
  padding: 10px 16px !important;
  color: var(--text-secondary) !important;
  min-height: 48px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.03) !important;
    color: white !important;
    
    .icon {
      color: var(--primary) !important;
    }
  }

  &.active {
    background: var(--gradient-vibrant) !important;
    color: white !important;
    box-shadow: 0 8px 16px rgba(255, 128, 102, 0.2) !important;
    
    .icon {
      color: white !important;
    }
    
    .MuiListItemText-primary {
      font-weight: 800 !important;
    }
  }

  .icon {
    min-width: 0 !important;
    color: var(--text-muted) !important;
    transition: var(--transition) !important;
    
    svg { font-size: 20px; }
  }

  .MuiListItemText-primary {
    font-size: 0.9rem !important;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
  }
`;