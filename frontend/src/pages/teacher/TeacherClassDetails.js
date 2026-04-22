import { useEffect, useState, useRef } from "react";
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import { Paper, Box, Typography, ButtonGroup, Button, Popper, Grow, ClickAwayListener, MenuList, MenuItem } from '@mui/material';
import TableTemplate from "../../components/TableTemplate";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import AppHeader from "../../components/common/AppHeader";
import AppButton from "../../components/common/AppButton";
import styled from "styled-components";

const TeacherClassDetails = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { sclassStudents, loading, error, getresponse } = useSelector((state) => state.sclass);

    const { currentUser } = useSelector((state) => state.user);
    const classID = currentUser.teachSclass?._id
    const subjectID = currentUser.teachSubject?._id

    useEffect(() => {
        dispatch(getClassStudents(classID));
    }, [dispatch, classID])

    if (error) {
        console.log(error)
    }

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
    ]

    const studentRows = Array.isArray(sclassStudents) ? sclassStudents.map((student) => {
        return {
            name: student.name,
            rollNum: student.rollNum,
            id: student._id,
        };
    }) : []

    const StudentsButtonHaver = ({ row }) => {
        const options = ['Take Attendance', 'Provide Marks'];
        const [open, setOpen] = useState(false);
        const anchorRef = useRef(null);
        const [selectedIndex, setSelectedIndex] = useState(0);

        const handleClick = () => {
            if (selectedIndex === 0) handleAttendance();
            else if (selectedIndex === 1) handleMarks();
        };

        const handleAttendance = () => navigate(`/Teacher/class/student/attendance/${row.id}/${subjectID}`);
        const handleMarks = () => navigate(`/Teacher/class/student/marks/${row.id}/${subjectID}`);

        const handleMenuItemClick = (event, index) => {
            setSelectedIndex(index);
            setOpen(false);
        };

        const handleToggle = () => setOpen((prevOpen) => !prevOpen);

        const handleClose = (event) => {
            if (anchorRef.current && anchorRef.current.contains(event.target)) return;
            setOpen(false);
        };

        return (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <AppButton
                    variant="contained"
                    size="small"
                    onClick={() => navigate("/Teacher/class/student/" + row.id)}
                    sx={{ py: 1 }}
                >
                    View
                </AppButton>
                <React.Fragment>
                    <ButtonGroup 
                        variant="outlined" 
                        ref={anchorRef} 
                        sx={{ 
                            borderColor: 'var(--border)',
                            '& .MuiButton-root': { borderColor: 'var(--border)', color: 'white' }
                        }}
                    >
                        <Button 
                            onClick={handleClick}
                            sx={{ fontWeight: 700, textTransform: 'none', px: 2 }}
                        >
                            {options[selectedIndex]}
                        </Button>
                        <Button
                            size="small"
                            onClick={handleToggle}
                            sx={{ px: 0, minWidth: '40px' }}
                        >
                            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </Button>
                    </ButtonGroup>
                    <Popper
                        sx={{ zIndex: 1300 }}
                        open={open}
                        anchorEl={anchorRef.current}
                        transition
                        disablePortal
                    >
                        {({ TransitionProps, placement }) => (
                            <Grow
                                {...TransitionProps}
                                style={{
                                    transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                                }}
                            >
                                <Paper sx={{ mt: 1, minWidth: '160px', background: 'var(--bg-surface) !important' }}>
                                    <ClickAwayListener onClickAway={handleClose}>
                                        <MenuList id="split-button-menu" autoFocusItem>
                                            {options.map((option, index) => (
                                                <MenuItem
                                                    key={option}
                                                    selected={index === selectedIndex}
                                                    onClick={(event) => handleMenuItemClick(event, index)}
                                                    sx={{ fontWeight: 600, fontSize: '0.85rem' }}
                                                >
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </MenuList>
                                    </ClickAwayListener>
                                </Paper>
                            </Grow>
                        )}
                    </Popper>
                </React.Fragment>
            </Box>
        );
    };

    return (
        <Box sx={{ p: 4 }}>
            {loading ? (
                <Typography sx={{ color: 'var(--text-muted)' }}>Loading Faculty Data...</Typography>
            ) : (
                <>
                    <AppHeader 
                        title={`${currentUser.teachSclass?.sclassName} Details`} 
                        subtitle={`Managing students and academic records for ${currentUser.teachSubject?.subName}`}
                    />

                    {getresponse ? (
                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ color: 'var(--text-muted)', fontWeight: 700 }}>
                                No Students Enrolled in this Class
                            </Typography>
                        </Box>
                    ) : (
                        <GlassCard sx={{ mt: 4 }}>
                            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'Outfit', color: 'white' }}>
                                    Enrolled Students
                                </Typography>
                            </Box>
                            
                            <Box sx={{ p: 1 }}>
                                {Array.isArray(sclassStudents) && sclassStudents.length > 0 &&
                                    <TableTemplate buttonHaver={StudentsButtonHaver} columns={studentColumns} rows={studentRows} />
                                }
                            </Box>
                        </GlassCard>
                    )}
                </>
            )}
        </Box>
    );
};

export default TeacherClassDetails;

const GlassCard = styled(Paper)`
  background: var(--bg-card) !important;
  backdrop-filter: blur(24px);
  border-radius: 24px !important;
  border: 1px solid var(--border) !important;
  overflow: hidden;
  box-shadow: var(--shadow-md) !important;
`;