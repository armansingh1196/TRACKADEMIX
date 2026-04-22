import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import PostAddIcon from '@mui/icons-material/PostAdd';
import {
    Paper, Box, IconButton, Container, CircularProgress
} from '@mui/material';
import DeleteIcon from "@mui/icons-material/Delete";
import TableTemplate from '../../../components/TableTemplate';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import AppHeader from '../../../components/common/AppHeader';
import AppButton from '../../../components/common/AppButton';

const ShowSubjects = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { subjectsList, loading, response } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        dispatch(getSubjectList(currentUser._id, "AllSubjects"));
    }, [currentUser._id, dispatch]);

    const deleteHandler = (deleteID, address) => {
        dispatch(deleteUser(deleteID, address))
            .then(() => {
                dispatch(getSubjectList(currentUser._id, "AllSubjects"));
            });
    };

    const subjectColumns = [
        { id: 'subName', label: 'Subject', minWidth: 170 },
        { id: 'sessions', label: 'Sessions', minWidth: 100 },
        { id: 'sclassName', label: 'Class', minWidth: 170 },
    ];

    const subjectRows = subjectsList && subjectsList.map((subject) => ({
        subName: subject.subName,
        sessions: subject.sessions,
        sclassName: subject.sclassName?.sclassName,
        sclassID: subject.sclassName?._id,
        id: subject._id,
    }));

    const SubjectsButtonHaver = ({ row }) => {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                <IconButton onClick={() => deleteHandler(row.id, "Subject")} size="small">
                    <DeleteIcon color="error" />
                </IconButton>
                <AppButton 
                    variant="contained" 
                    color="secondary" 
                    size="small"
                    onClick={() => navigate(`/Admin/subjects/subject/${row.sclassID}/${row.id}`)}
                >
                    View
                </AppButton>
            </Box>
        );
    };

    const actions = [
        { icon: <PostAddIcon />, name: 'Add New Subject', action: () => navigate("/Admin/subjects/chooseclass") },
        { icon: <DeleteIcon />, name: 'Delete All Subjects', action: () => deleteHandler(currentUser._id, "Subjects") }
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
            <AppHeader 
                title="Subject Catalog" 
                subtitle="View and manage academic subjects across different classes." 
            />
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{ mt: 2 }}>
                    {response ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
                            <Typography variant="h6" color="textSecondary">No subjects found.</Typography>
                            <AppButton variant="contained" color="primary" onClick={() => navigate("/Admin/subjects/chooseclass")}>
                                Add Your First Subject
                            </AppButton>
                        </Box>
                    ) : (
                        <>
                            {Array.isArray(subjectsList) && subjectsList.length > 0 && (
                                <TableTemplate buttonHaver={SubjectsButtonHaver} columns={subjectColumns} rows={subjectRows} />
                            )}
                            <SpeedDialTemplate actions={actions} />
                        </>
                    )}
                </Box>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default ShowSubjects;

const Typography = ({ children, variant, sx, color }) => (
    <Box component="div" sx={{ typography: variant, color, ...sx }}>{children}</Box>
);