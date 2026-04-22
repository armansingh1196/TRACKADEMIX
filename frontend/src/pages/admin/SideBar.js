import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, Box, Typography as MuiTypography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

import HomeIcon from "@mui/icons-material/Home";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import ReportIcon from '@mui/icons-material/Report';
import AssignmentIcon from '@mui/icons-material/Assignment';

const SideBar = ({ open }) => {
    const location = useLocation();
    const { currentUser } = useSelector(state => state.user);

    const menuItems = [
        { text: 'Dashboard', icon: <HomeIcon />, path: '/Admin/dashboard' },
        { text: 'Classes', icon: <ClassOutlinedIcon />, path: '/Admin/classes' },
        { text: 'Subjects', icon: <AssignmentIcon />, path: '/Admin/subjects' },
        { text: 'Professors', icon: <SupervisorAccountOutlinedIcon />, path: '/Admin/teachers' },
        { text: 'Students', icon: <PersonOutlineIcon />, path: '/Admin/students' },
        { text: 'Notices', icon: <AnnouncementOutlinedIcon />, path: '/Admin/notices' },
        { text: 'Complains', icon: <ReportIcon />, path: '/Admin/complains' },
    ];

    return (
        <StyledNav>
            {open && (
                <Box sx={{ px: 2, py: 2, mb: 1 }}>
                    <BranchBadge>
                        {currentUser?.branch || "HOD Office"}
                    </BranchBadge>
                </Box>
            )}
            
            <Divider sx={{ mb: 2, borderColor: 'var(--border)', opacity: open ? 1 : 0 }} />

            <Box sx={{ px: 2, pb: 2, flexGrow: 1 }}>
                {open && <SectionLabel>MAIN MENU</SectionLabel>}
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/Admin/dashboard' && location.pathname.startsWith(item.path));
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
            </Box>
            
            <Divider sx={{ my: 1, borderColor: 'var(--border)', opacity: open ? 1 : 0 }} />
            
            <Box sx={{ px: 2, py: 2 }}>
                {open && <SectionLabel>ACCOUNT</SectionLabel>}
                <StyledListItem 
                    component={Link} 
                    to="/Admin/profile"
                    className={location.pathname.startsWith("/Admin/profile") ? 'active' : ''}
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

export default SideBar;

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
  height: 100%;
  color: var(--text-secondary);
`;

const BranchBadge = styled(Box)`
  background: rgba(176, 168, 185, 0.08);
  border: 1px solid rgba(176, 168, 185, 0.15);
  padding: 10px 16px;
  border-radius: 12px;
  color: var(--muted);
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
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
