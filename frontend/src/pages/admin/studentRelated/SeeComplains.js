import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Paper, Box, Checkbox, CircularProgress, Typography
} from '@mui/material';
import { getAllComplains } from '../../../redux/complainRelated/complainHandle';
import TableTemplate from '../../../components/TableTemplate';
import AppHeader from '../../../components/common/AppHeader';
import styled from 'styled-components';

const SeeComplains = () => {
  const label = { inputProps: { 'aria-label': 'Checkbox demo' } };
  const dispatch = useDispatch();
  const { complainsList, loading, error, response } = useSelector((state) => state.complain);
  const { currentUser } = useSelector(state => state.user);

  useEffect(() => {
    dispatch(getAllComplains(currentUser._id, "Complain"));
  }, [currentUser._id, dispatch]);

  if (error) {
    console.log(error);
  }

  const complainColumns = [
    { id: 'user', label: 'User', minWidth: 170 },
    { id: 'complaint', label: 'Complaint', minWidth: 100 },
    { id: 'date', label: 'Date', minWidth: 170 },
  ];

  const complainRows = Array.isArray(complainsList) && complainsList.length > 0 ? complainsList.map((complain) => {
    const date = new Date(complain.date);
    const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
    return {
      user: complain.user?.name || "Anonymous",
      complaint: complain.complaint,
      date: dateString,
      id: complain._id,
    };
  }) : [];

  const ComplainButtonHaver = ({ row }) => {
    return (
      <>
        <Checkbox {...label} />
      </>
    );
  };

  return (
    <Box sx={{ p: 4 }}>
      <AppHeader 
        title="Student Complaints" 
        subtitle="Review and address feedback or issues raised by the student body." 
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress sx={{ color: 'var(--primary)' }} />
        </Box>
      ) : (
        <Box sx={{ mt: 4 }}>
          {response || (Array.isArray(complainsList) && complainsList.length === 0) ? (
            <EmptyStateBox>
              <Typography variant="h6" sx={{ color: 'var(--text-muted)', mb: 2 }}>
                No complaints have been filed yet.
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                This is a good sign! It means everything is running smoothly.
              </Typography>
            </EmptyStateBox>
          ) : (
            <GlassCard>
              {Array.isArray(complainsList) && complainsList.length > 0 &&
                <TableTemplate buttonHaver={ComplainButtonHaver} columns={complainColumns} rows={complainRows} />
              }
            </GlassCard>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SeeComplains;

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