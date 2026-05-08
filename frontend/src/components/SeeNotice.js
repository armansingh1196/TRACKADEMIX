import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getAllNotices } from '../redux/noticeRelated/noticeHandle';
import { Typography, Box, CircularProgress } from '@mui/material';
import styled from 'styled-components';
import NotificationImportantOutlinedIcon from '@mui/icons-material/NotificationImportantOutlined';

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

    return (
        <Box sx={{ mt: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <NotificationImportantOutlinedIcon sx={{ color: 'var(--primary)', fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'Outfit', color: 'white' }}>
                    Institutional Notices
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, p: 3, flexGrow: 1 }}>
                    <CircularProgress size={24} sx={{ color: 'var(--primary)' }} />
                    <Typography sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Syncing Announcements...</Typography>
                </Box>
            ) : response || !noticesList || noticesList.length === 0 ? (
                <EmptyBox>
                    <Typography variant="body1" sx={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                        No institutional notices or announcements to display at this time.
                    </Typography>
                </EmptyBox>
            ) : (
                <NoticeFeed>
                    {noticesList.map((notice) => {
                        const date = new Date(notice.date);
                        const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
                        
                        return (
                            <NoticeCard key={notice._id || Math.random()}>
                                <DateBadge>
                                    <Typography className="day">{date.getDate()}</Typography>
                                    <Typography className="month">{date.toLocaleString('default', { month: 'short' })}</Typography>
                                </DateBadge>
                                <NoticeContent>
                                    <Typography variant="subtitle1" className="title">
                                        {notice.title || "Untitled Notice"}
                                    </Typography>
                                    <Typography variant="body2" className="details">
                                        {notice.details || "No further details provided."}
                                    </Typography>
                                    <Typography variant="caption" className="date-full">
                                        Posted on {dateString}
                                    </Typography>
                                </NoticeContent>
                            </NoticeCard>
                        );
                    })}
                </NoticeFeed>
            )}
        </Box>
    )
}

export default SeeNotice

const EmptyBox = styled(Box)`
  padding: 40px;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
`;

const NoticeFeed = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
    padding-right: 8px;
    max-height: 350px;

    /* Custom Scrollbar for the feed */
    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 10px;
    }
    &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
    }
    &::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
    }
`;

const NoticeCard = styled(Box)`
    display: flex;
    gap: 16px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    transition: var(--transition);
    align-items: flex-start;

    &:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(132, 94, 194, 0.3);
        transform: translateY(-2px);
    }
`;

const DateBadge = styled(Box)`
    background: rgba(132, 94, 194, 0.1);
    border: 1px solid rgba(132, 94, 194, 0.2);
    border-radius: 12px;
    min-width: 60px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .day {
        font-size: 1.5rem;
        font-weight: 800;
        font-family: 'Outfit';
        color: var(--primary);
        line-height: 1;
    }

    .month {
        font-size: 0.75rem;
        text-transform: uppercase;
        font-weight: 700;
        color: var(--text-muted);
        margin-top: 4px;
        letter-spacing: 1px;
    }
`;

const NoticeContent = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex-grow: 1;

    .title {
        color: white;
        font-weight: 700;
        line-height: 1.3;
    }

    .details {
        color: var(--text-secondary);
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .date-full {
        color: var(--text-muted);
        font-size: 0.75rem;
        margin-top: 8px;
    }
`;