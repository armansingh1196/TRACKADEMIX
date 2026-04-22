import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import CountUp from 'react-countup';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: '28px',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    borderRadius: '32px',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-md)',
    transition: 'var(--transition)',
    background: 'var(--bg-card)',
    backdropFilter: 'blur(24px)',
    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: 'var(--shadow-xl)',
        borderColor: 'var(--primary)',
    },
}));

const IconWrapper = styled(Box)(({ color }) => ({
  width: '64px',
  height: '64px',
  borderRadius: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: `${color}15`,
  color: color,
  border: `1px solid ${color}30`,
  '& svg': {
    fontSize: '32px',
  },
}));

const DashboardCard = ({ title, value, icon, color, duration = 2.5 }) => {
    return (
        <StyledPaper elevation={0}>
            <IconWrapper color={color || 'var(--primary)'}>
                {icon}
            </IconWrapper>
            <Box>
                <Typography variant="subtitle2" sx={{ color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', mb: 0.5, fontSize: '0.7rem' }}>
                    {title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: 'white', fontFamily: 'Outfit', letterSpacing: '-1px' }}>
                    <CountUp start={0} end={value || 0} duration={duration} />
                </Typography>
            </Box>
        </StyledPaper>
    );
};

export default DashboardCard;
