import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import {
    Paper, Box, IconButton, Container, CircularProgress, Typography
} from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import DeleteIcon from "@mui/icons-material/Delete";
import { getAllNotices } from '../../../redux/noticeRelated/noticeHandle';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import TableTemplate from '../../../components/TableTemplate';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import AppHeader from '../../../components/common/AppHeader';
import AppButton from '../../../components/common/AppButton';
import Popup from '../../../components/Popup';
import styled from 'styled-components';

const ShowNotices = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { noticesList, loading, response } = useSelector((state) => state.notice);
    const { currentUser } = useSelector(state => state.user)

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        dispatch(getAllNotices(currentUser._id, "Notice"));
    }, [currentUser._id, dispatch]);

    const deleteHandler = (deleteID, address) => {
        dispatch(deleteUser(deleteID, address))
            .then(() => {
                dispatch(getAllNotices(currentUser._id, "Notice"));
                setMessage("Notice removed successfully");
                setShowPopup(true);
            })
            .catch(() => {
                setMessage("Failed to delete notice");
                setShowPopup(true);
            });
    }

    const noticeColumns = [
        { id: 'title', label: 'Title', minWidth: 170 },
        { id: 'details', label: 'Details', minWidth: 100 },
        { id: 'date', label: 'Date', minWidth: 170 },
    ];

    const noticeRows = noticesList && noticesList.length > 0 && noticesList.map((notice) => {
        const date = new Date(notice.date);
        const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "N/A";
        return {
            title: notice.title,
            details: notice.details,
            date: dateString,
            id: notice._id,
        };
    });

    const NoticeButtonHaver = ({ row }) => {
        return (
            <IconButton onClick={() => deleteHandler(row.id, "Notice")} size="small">
                <DeleteIcon color="error" sx={{ fontSize: 20 }} />
            </IconButton>
        );
    };

    const actions = [
        {
            icon: <NoteAddIcon />, name: 'Add New Notice',
            action: () => navigate("/Admin/addnotice")
        },
        {
            icon: <DeleteIcon />, name: 'Delete All Notices',
            action: () => deleteHandler(currentUser._id, "Notices")
        }
    ];

    return (
        <Box sx={{ p: 4 }}>
            <AppHeader 
                title="Notice Board" 
                subtitle="Dispatch important updates and institutional announcements." 
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
                                No active notices at the moment.
                            </Typography>
                            <AppButton variant="contained" onClick={() => navigate("/Admin/addnotice")}>
                                Post Your First Notice
                            </AppButton>
                        </EmptyStateBox>
                    ) : (
                        <GlassCard>
                            {Array.isArray(noticesList) && noticesList.length > 0 && (
                                <TableTemplate buttonHaver={NoticeButtonHaver} columns={noticeColumns} rows={noticeRows} />
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

export default ShowNotices;

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