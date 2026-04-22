import { useEffect, useState, useRef, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import {
    Paper, Box, IconButton, Container, CircularProgress, Button, ButtonGroup, Popper, Grow, ClickAwayListener, MenuList, MenuItem, Typography
} from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import TableTemplate from '../../../components/TableTemplate';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import AppHeader from '../../../components/common/AppHeader';
import AppButton from '../../../components/common/AppButton';
import styled from 'styled-components';

const ShowStudents = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { studentsList, loading, response } = useSelector((state) => state.student);
    const { currentUser } = useSelector(state => state.user);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        dispatch(getAllStudents(currentUser._id));
    }, [currentUser._id, dispatch]);

    const deleteHandler = (deleteID, address) => {
        dispatch(deleteUser(deleteID, address))
            .then(() => {
                dispatch(getAllStudents(currentUser._id));
            });
    };

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
        { id: 'sclassName', label: 'Class', minWidth: 170 },
    ];

    const studentRows = Array.isArray(studentsList) ? studentsList.map((student) => ({
        name: student.name,
        rollNum: student.rollNum,
        sclassName: student.sclassName?.sclassName || "N/A",
        id: student._id,
    })) : [];

    const StudentButtonHaver = ({ row }) => {
        const options = ['Take Attendance', 'Provide Marks'];
        const [open, setOpen] = useState(false);
        const anchorRef = useRef(null);
        const [selectedIndex, setSelectedIndex] = useState(0);

        const handleClick = () => {
            if (selectedIndex === 0) navigate("/Admin/students/student/attendance/" + row.id);
            else if (selectedIndex === 1) navigate("/Admin/students/student/marks/" + row.id);
        };

        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton onClick={() => deleteHandler(row.id, "Student")} size="small" sx={{ color: 'var(--accent)' }}>
                    <PersonRemoveIcon />
                </IconButton>
                <AppButton 
                    variant="contained" 
                    size="small"
                    onClick={() => navigate("/Admin/students/student/" + row.id)}
                    sx={{ py: 1 }}
                >
                    View
                </AppButton>
                <Fragment>
                    <ButtonGroup 
                        variant="outlined" 
                        ref={anchorRef} 
                        size="small"
                        sx={{ 
                            borderColor: 'var(--border)',
                            '& .MuiButton-root': { borderColor: 'var(--border)', color: 'white' }
                        }}
                    >
                        <Button onClick={handleClick} sx={{ textTransform: 'none', fontWeight: 700 }}>{options[selectedIndex]}</Button>
                        <Button
                            size="small"
                            onClick={() => setOpen((prevOpen) => !prevOpen)}
                            sx={{ px: 0, minWidth: '32px' }}
                        >
                            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </Button>
                    </ButtonGroup>
                    <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal sx={{ zIndex: 1300 }}>
                        {({ TransitionProps, placement }) => (
                            <Grow {...TransitionProps} style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}>
                                <Paper sx={{ borderRadius: '12px', mt: 1, background: 'var(--bg-surface) !important' }}>
                                    <ClickAwayListener onClickAway={() => setOpen(false)}>
                                        <MenuList id="split-button-menu" autoFocusItem>
                                            {options.map((option, index) => (
                                                <MenuItem
                                                    key={option}
                                                    selected={index === selectedIndex}
                                                    onClick={() => {
                                                        setSelectedIndex(index);
                                                        setOpen(false);
                                                    }}
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
                </Fragment>
            </Box>
        );
    };

    const actions = [
        { icon: <PersonAddAlt1Icon />, name: 'Add New Student', action: () => navigate("/Admin/addstudents") },
        { icon: <PersonRemoveIcon />, name: 'Delete All Students', action: () => deleteHandler(currentUser._id, "Students") },
    ];

    return (
        <Box sx={{ p: 4 }}>
            <AppHeader 
                title="Student Management" 
                subtitle="View, add, and manage student records and performance tracking." 
            />
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: 'var(--primary)' }} />
                </Box>
            ) : (
                <GlassCard sx={{ mt: 4 }}>
                    {response ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
                            <Typography variant="h6" sx={{ color: 'var(--text-muted)', fontWeight: 700 }}>
                                No institutional student records found.
                            </Typography>
                            <AppButton variant="contained" onClick={() => navigate("/Admin/addstudents")}>
                                Add Your First Student
                            </AppButton>
                        </Box>
                    ) : (
                        <Box sx={{ p: 1 }}>
                            {Array.isArray(studentsList) && studentsList.length > 0 && (
                                <TableTemplate buttonHaver={StudentButtonHaver} columns={studentColumns} rows={studentRows} />
                            )}
                            <SpeedDialTemplate actions={actions} />
                        </Box>
                    )}
                </GlassCard>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default ShowStudents;

const GlassCard = styled(Paper)`
  background: var(--bg-card) !important;
  backdrop-filter: blur(24px);
  border-radius: 24px !important;
  border: 1px solid var(--border) !important;
  overflow: hidden;
  box-shadow: var(--shadow-md) !important;
`;