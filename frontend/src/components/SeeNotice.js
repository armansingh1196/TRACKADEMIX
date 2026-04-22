import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getAllNotices } from '../redux/noticeRelated/noticeHandle';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import TableViewTemplate from './TableViewTemplate';
import styled from 'styled-components';

const SeeNotice = () => {
    const dispatch = useDispatch();

    const { currentUser, currentRole } = useSelector(state => state.user);
    const { noticesList, loading, response } = useSelector((state) => state.notice);

    useEffect(() => {
        if (currentRole === "Admin") {
            if (currentUser?._id) {
                dispatch(getAllNotices(currentUser._id, "Notice"));
            }
        }
        else {
            const schoolID = currentUser?.school?._id || currentUser?.school;
            if (schoolID) {
                dispatch(getAllNotices(schoolID, "Notice"));
            }
        }
    }, [dispatch, currentRole, currentUser]);

    const noticeColumns = [
        { id: 'title', label: 'Title', minWidth: 170 },
        { id: 'details', label: 'Details', minWidth: 100 },
        { id: 'date', label: 'Date', minWidth: 170 },
    ];

    const noticeRows = Array.isArray(noticesList) ? noticesList.map((notice) => {
        const date = new Date(notice.date);
        const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
        return {
            title: notice.title || "No Title",
            details: notice.details || "No Details",
            date: dateString,
            id: notice._id || Math.random(),
        };
    }) : [];

    return (
        <Box sx={{ mt: 2 }}>
            {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                    <CircularProgress size={24} sx={{ color: 'var(--primary)' }} />
                    <Typography sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Syncing Announcements...</Typography>
                </Box>
            ) : response || noticeRows.length === 0 ? (
                <EmptyBox>
                    <Typography variant="body1" sx={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                        No institutional notices or announcements to display at this time.
                    </Typography>
                </EmptyBox>
            ) : (
                <>
                    <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, fontFamily: 'Outfit', color: 'white', letterSpacing: '-0.5px' }}>
                        Institutional Notices
                    </Typography>
                    <Paper sx={{ 
                        width: '100%', 
                        overflow: 'hidden', 
                        background: 'rgba(255,255,255,0.02) !important', 
                        border: '1px solid var(--border) !important', 
                        borderRadius: '24px !important',
                        boxShadow: 'var(--shadow-md) !important'
                    }}>
                        <TableViewTemplate columns={noticeColumns} rows={noticeRows} />
                    </Paper>
                </>
            )}
        </Box>
    )
}

export default SeeNotice

const EmptyBox = styled(Box)`
  padding: 40px;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed var(--border);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;