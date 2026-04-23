import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import PostAddIcon from '@mui/icons-material/PostAdd';
import {
    Paper, Box, IconButton, Container, CircularProgress, Typography
} from '@mui/material';
import DeleteIcon from "@mui/icons-material/Delete";
import TableTemplate from '../../../components/TableTemplate';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import AppHeader from '../../../components/common/AppHeader';
import AppButton from '../../../components/common/AppButton';
import styled from 'styled-components';

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
                setMessage("Subject removed successfully");
                setShowPopup(true);
            })
            .catch(() => {
                setMessage("Failed to delete subject");
                setShowPopup(true);
            });
    };

    const subjectColumns = [
        { id: 'subName', label: 'Subject', minWidth: 170 },
        { id: 'sessions', label: 'Sessions', minWidth: 100 },
        { id: 'sclassName', label: 'Class', minWidth: 170 },
    ];

    const subjectRows = Array.isArray(subjectsList) ? subjectsList.map((subject) => ({
        subName: subject.subName,
        sessions: subject.sessions,
        sclassName: subject.sclassName?.sclassName || "N/A",
        sclassID: subject.sclassName?._id,
        id: subject._id,
    })) : [];

    const SubjectsButtonHaver = ({ row }) => {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton onClick={() => deleteHandler(row.id, "Subject")} size="small">
                    <DeleteIcon color="error" sx={{ fontSize: 20 }} />
                </IconButton>
                <AppButton 
                    variant="contained" 
                    size="small"
                    onClick={() => navigate(`/Admin/subjects/subject/${row.sclassID}/${row.id}`)}
                >
                    View Details
                </AppButton>
            </Box>
        );
    };

    const actions = [
        { icon: <PostAddIcon />, name: 'Add New Subject', action: () => navigate("/Admin/subjects/chooseclass") },
        { icon: <DeleteIcon />, name: 'Delete All Subjects', action: () => deleteHandler(currentUser._id, "Subjects") }
    ];

    return (
        <Box sx={{ p: 4 }}>
            <AppHeader 
                title="Subject Catalog" 
                subtitle="View and manage academic subjects across different classes." 
            />
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress sx={{ color: 'var(--primary)' }} />
                </Box>
            ) : (
                <Box sx={{ mt: 4 }}>
                    {response ? (
                        <EmptyStateBox>
                            <Typography variant="h6" sx={{ color: 'var(--text-muted)', mb: 2 }}>
                                No institutional subjects found.
                            </Typography>
                            <AppButton variant="contained" onClick={() => navigate("/Admin/subjects/chooseclass")}>
                                Add Your First Subject
                            </AppButton>
                        </EmptyStateBox>
                    ) : (
                        <GlassCard>
                            {Array.isArray(subjectsList) && subjectsList.length > 0 && (
                                <TableTemplate buttonHaver={SubjectsButtonHaver} columns={subjectColumns} rows={subjectRows} />
                            )}
                            <SpeedDialTemplate actions={actions} />
                        </GlassCard>
                    )}
                </Box>
            )}
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Box>
    );
};

export default ShowSubjects;

const GlassCard = styled(Paper)`
  background: var(--bg-card) !important;
  border: 1px solid var(--border) !important;
  border-radius: 24px !important;
  overflow: hidden;
`;

const EmptyStateBox = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 32px;
  border: 2px dashed var(--border);
`;