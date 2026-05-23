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
    border: '1px solid rgba(124, 77, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(124,77,255,0.06), inset 0 1px 0 rgba(255,255,255,0.1)',
    background: 'rgba(255, 255, 255, 0.055)',
    backdropFilter: 'blur(40px) saturate(200%) brightness(1.06)',
    WebkitBackdropFilter: 'blur(40px) saturate(200%) brightness(1.06)',
    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    cursor: 'default',
    '&:hover': {
        transform: 'translateY(-6px) scale(1.01)',
        boxShadow: `0 20px 48px rgba(0,0,0,0.55), 0 0 0 1px ${color || 'rgba(124,77,255,0.3)'}, inset 0 1px 0 rgba(255,255,255,0.14)`,
        borderColor: color ? `${color}40` : 'rgba(124, 77, 255, 0.3)',
        background: 'rgba(255, 255, 255, 0.08)',
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
    backgroundColor: color ? `${color}14` : 'rgba(124, 77, 255, 0.1)',
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
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        fontSize: '0.6875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: 'rgba(226, 232, 255, 0.5)',
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
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                        letterSpacing: '-0.035em',
                        color: '#F5F5FF',
                        lineHeight: 1,
                        fontFeatureSettings: "'tnum'",
                    }}
                >
                    <CountUp start={0} end={value || 0} duration={duration} />
                </Typography>
            </Box>
        </StyledCard>
    );
};

export default DashboardCard;
