import React from 'react';
import { Box, Typography, IconButton, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import styled from 'styled-components';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const AppHeader = ({ title, subtitle, showBack = true, rightSide }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // "ai-insights" → "AI Insights", "complain" → "Complaint", "subjects" → "Subjects"
  const formatCrumb = (value) => {
    const overrides = { 'complain': 'Complaint', 'ai-insights': 'AI Insights' };
    if (overrides[value]) return overrides[value];
    return value
      .replace(/-/g, ' ')
      .split(' ')
      .map(w => (w.length <= 2 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
      .join(' ');
  };

  return (
    <HeaderWrapper>
      {/* Breadcrumb + Back row */}
      <TopRow>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1, flexWrap: 'wrap' }}>
          {showBack && pathnames.length > 2 && (
            <BackBtn onClick={() => navigate(-1)} size="small">
              <ArrowBackIosNewIcon sx={{ fontSize: 11 }} />
            </BackBtn>
          )}
          <Breadcrumbs
            separator={<NavigateNextIcon sx={{ fontSize: 12, opacity: 0.4 }} />}
            aria-label="breadcrumb"
            sx={{ '& .MuiBreadcrumbs-ol': { flexWrap: 'wrap' } }}
          >
            <MuiLink
              underline="none"
              onClick={() => navigate(`/${pathnames[0]}/dashboard`)}
              sx={{
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'rgba(226,232,255,0.35) !important',
                letterSpacing: '0.01em',
                '&:hover': { color: 'rgba(226,232,255,0.6) !important' },
                transition: 'color 0.2s ease',
              }}
            >
              Dashboard
            </MuiLink>
            {pathnames.slice(1).map((value, index) => {
              const last = index === pathnames.slice(1).length - 1;
              return last ? (
                <Typography
                  key={value}
                  sx={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'rgba(124, 77, 255, 0.9) !important',
                    letterSpacing: '0.01em',
                  }}
                >
                  {formatCrumb(value)}
                </Typography>
              ) : (
                <MuiLink
                  underline="none"
                  key={value}
                  sx={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: 'rgba(226,232,255,0.35) !important',
                  }}
                >
                  {formatCrumb(value)}
                </MuiLink>
              );
            })}
          </Breadcrumbs>
        </Box>
        {rightSide && <Box>{rightSide}</Box>}
      </TopRow>

      {/* iOS Large Title */}
      <LargeTitle>{title}</LargeTitle>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
    </HeaderWrapper>
  );
};

export default AppHeader;

/* ── Styled Parts ── */
const HeaderWrapper = styled(Box)`
  margin-bottom: 28px;
  animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
`;

const TopRow = styled(Box)`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 8px;
`;

const BackBtn = styled(IconButton)`
  && {
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(124, 77, 255, 0.1);
    color: rgba(226, 232, 255, 0.7);
    border-radius: 50%;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(124, 77, 255, 0.12);
      color: #F5F5FF;
    }
  }
`;

const LargeTitle = styled(Typography)`
  font-family: var(--font-display) !important;
  font-weight: 800 !important;
  font-size: clamp(1.75rem, 4vw, 2.5rem) !important;
  letter-spacing: -0.035em !important;
  color: #F5F5FF !important;
  line-height: 1.1 !important;
  margin-bottom: 6px !important;
`;

const Subtitle = styled(Typography)`
  font-family: var(--font-body) !important;
  font-size: 0.875rem !important;
  font-weight: 400 !important;
  color: rgba(226, 232, 255, 0.5) !important;
  line-height: 1.5 !important;
  letter-spacing: -0.011em !important;
  max-width: 600px;
  word-break: break-word;
`;
