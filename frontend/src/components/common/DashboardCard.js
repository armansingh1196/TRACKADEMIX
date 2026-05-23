import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import CountUp from 'react-countup';

/* ── iOS Widget-style Stat Card ── */
const StyledCard = styled(Paper)(({ color }) => ({
    padding: '22px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    borderRadius: '20px',
    border: '1px solid rgba(84, 84, 88, 0.5)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
    background: 'rgba(28, 28, 30, 0.72)',
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    cursor: 'default',
    '&:hover': {
        transform: 'translateY(-6px) scale(1.01)',
        boxShadow: `0 16px 40px rgba(0,0,0,0.6), 0 0 0 1px ${color || 'rgba(110,63,243,0.4)'}`,
        borderColor: color || 'rgba(110, 63, 243, 0.45)',
    },
}));

/* Circular icon — like iOS app icon style */
const IconCircle = styled(Box)(({ color }) => ({
    width: '52px',
    height: '52px',
    borderRadius: '14px',  /* iOS app icon corner radius */
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color ? `${color}18` : 'rgba(110, 63, 243, 0.14)',
    color: color || 'var(--accent)',
    flexShrink: 0,
    '& svg': {
        fontSize: '26px',
    },
}));

const DashboardCard = ({ title, value, icon, color, duration = 2.5 }) => {
    return (
        <StyledCard elevation={0} color={color}>
            <IconCircle color={color}>
                {icon}
            </IconCircle>
            <Box>
                {/* iOS Caption style label */}
                <Typography
                    sx={{
                        fontFamily: 'var(--font-sf)',
                        fontWeight: 600,
                        fontSize: '0.6875rem',  /* 11px caption2 */
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                        color: 'rgba(235, 235, 245, 0.45)',
                        mb: '4px',
                        lineHeight: 1,
                        display: 'block',
                    }}
                >
                    {title}
                </Typography>
                {/* iOS Large Number */}
                <Typography
                    sx={{
                        fontFamily: 'var(--font-sf)',
                        fontWeight: 700,
                        fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                        letterSpacing: '-0.03em',
                        color: '#FFFFFF',
                        lineHeight: 1,
                    }}
                >
                    <CountUp start={0} end={value || 0} duration={duration} />
                </Typography>
            </Box>
        </StyledCard>
    );
};

export default DashboardCard;
