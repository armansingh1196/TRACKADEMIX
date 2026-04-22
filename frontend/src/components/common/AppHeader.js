import React from 'react';
import { Box, Typography, IconButton, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import styled from 'styled-components';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const AppHeader = ({ title, subtitle, showBack = true }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <HeaderWrapper>
      <TopRow>
        {showBack && pathnames.length > 2 && (
          <IconButton 
            onClick={() => navigate(-1)} 
            sx={{ 
                mr: 2, 
                bgcolor: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--border)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                color: 'var(--text-main)'
            }}
            size="small"
          >
            <ArrowBackIosNewIcon sx={{ fontSize: 12 }} />
          </IconButton>
        )}
        <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" sx={{ color: 'var(--border)' }} />}
            aria-label="breadcrumb" 
            sx={{ 
                mb: 1, 
                '& .MuiBreadcrumbs-li': { 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                },
                '& .MuiBreadcrumbs-separator': {
                    mx: 1
                }
            }}
        >
          <MuiLink 
            underline="none" 
            color="inherit" 
            onClick={() => navigate(`/${pathnames[0]}/dashboard`)} 
            sx={{ 
                cursor: 'pointer', 
                color: 'var(--text-muted) !important',
                '&:hover': { color: 'var(--primary) !important' }
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
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    color: 'var(--primary-light) !important',
                    letterSpacing: '1px'
                }}
              >
                {value.replace('-', ' ')}
              </Typography>
            ) : (
              <MuiLink 
                underline="none" 
                color="inherit" 
                key={value} 
                sx={{ 
                    textTransform: 'uppercase', 
                    color: 'var(--text-muted) !important' 
                }}
              >
                {value.replace('-', ' ')}
              </MuiLink>
            );
          })}
        </Breadcrumbs>
      </TopRow>
      <Title variant="h3">{title}</Title>
      {subtitle && <Subtitle variant="body1">{subtitle}</Subtitle>}
    </HeaderWrapper>
  );
};

export default AppHeader;

const HeaderWrapper = styled(Box)`
  margin-bottom: 32px;
  animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
`;

const TopRow = styled(Box)`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const Title = styled(Typography)`
  font-weight: 900 !important;
  font-family: 'Outfit', sans-serif !important;
  background: var(--gradient-vibrant);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px !important;
  letter-spacing: -1px !important;
`;

const Subtitle = styled(Typography)`
  color: var(--text-secondary) !important;
  font-weight: 500 !important;
  max-width: 600px;
  line-height: 1.6 !important;
`;
