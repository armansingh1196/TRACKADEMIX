import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import {
    Paper, Box, IconButton, Container, CircularProgress, Typography
} from '@mui/material';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import AppHeader from '../../../components/common/AppHeader';
import AppButton from '../../../components/common/AppButton';
import TableTemplate from '../../../components/TableTemplate';
import styled from 'styled-components';

const ShowTeachers = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { teachersList, loading, response } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector((state) => state.user);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        dispatch(getAllTeachers(currentUser._id));
    }, [currentUser._id, dispatch]);

    const deleteHandler = (deleteID, address) => {
        dispatch(deleteUser(deleteID, address)).then(() => {
            dispatch(getAllTeachers(currentUser._id));
        });
    };

    const columns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'teachSubject', label: 'Subject', minWidth: 100 },
        { id: 'teachSclass', label: 'Class', minWidth: 170 },
    ];

    const rows = Array.isArray(teachersList) ? teachersList.map((teacher) => ({
        name: teacher.name,
        teachSubject: teacher.teachSubject?.subName || null,
        teachSclass: teacher.teachSclass?.sclassName,
        teachSclassID: teacher.teachSclass?._id,
        id: teacher._id,
    })) : [];

    const TeacherButtonHaver = ({ row }) => {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton onClick={() => deleteHandler(row.id, "Teacher")} size="small" sx={{ color: 'var(--accent)' }}>
                    <PersonRemoveIcon />
                </IconButton>
                <AppButton 
                    variant="contained" 
                    size="small"
                    onClick={() => navigate("/Admin/teachers/teacher/" + row.id)}
                    sx={{ py: 1 }}
                >
                    View
                </AppButton>
                {!row.teachSubject && (
                    <AppButton 
                        variant="outlined" 
                        size="small"
                        onClick={() => navigate(`/Admin/teachers/choosesubject/${row.teachSclassID}/${row.id}`)}
                        sx={{ py: 1, borderColor: 'var(--border)', color: 'white' }}
                    >
                        Add Subject
                    </AppButton>
                )}
            </Box>
        );
    };

    const actions = [
        { icon: <PersonAddAlt1Icon />, name: 'Add New Teacher', action: () => navigate("/Admin/teachers/chooseclass") },
        { icon: <PersonRemoveIcon />, name: 'Delete All Teachers', action: () => deleteHandler(currentUser._id, "Teachers") },
    ];

    return (
        <Box sx={{ p: 4 }}>
            <AppHeader 
                title="Professor Directory" 
                subtitle="Manage faculty assignments, subjects, and profiles." 
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
                                No faculty records found.
                            </Typography>
                            <AppButton variant="contained" onClick={() => navigate("/Admin/teachers/chooseclass")}>
                                Add Your First Professor
                            </AppButton>
                        </Box>
                    ) : (
                        <Box sx={{ p: 1 }}>
                            {Array.isArray(teachersList) && teachersList.length > 0 && (
                                <TableTemplate buttonHaver={TeacherButtonHaver} columns={columns} rows={rows} />
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

export default ShowTeachers;

const GlassCard = styled(Paper)`
  background: var(--bg-card) !important;
  backdrop-filter: blur(24px);
  border-radius: 24px !important;
  border: 1px solid var(--border) !important;
  overflow: hidden;
  box-shadow: var(--shadow-md) !important;
`;