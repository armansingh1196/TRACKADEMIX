import styled from 'styled-components';
import { Button } from '@mui/material';

/* ── Premium Button — Inter, spring press, accent glow ── */
const StyledButton = styled(Button)`
  && {
    padding: ${props =>
      props.size === 'small'   ? '8px 18px' :
      props.size === 'large'   ? '14px 32px' :
                                 '11px 24px'};
    border-radius: var(--radius-md, 14px);
    font-weight: 600;
    font-size: var(--text-callout, 0.9375rem);
    text-transform: none;
    letter-spacing: -0.01em;
    font-family: var(--font-body, 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif);
    transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
    overflow: hidden;
    will-change: transform;

    /* Haptic press — scale down on active */
    &:active {
      transform: scale(0.96) !important;
      transition: all 0.1s ease !important;
    }

    /* Primary — solid accent fill with purple glow */
    &.MuiButton-containedPrimary {
      background: var(--accent, #7C4DFF) !important;
      color: #ffffff !important;
      box-shadow: 0 4px 18px rgba(124, 77, 255, 0.3), 0 1px 3px rgba(0,0,0,0.2) !important;

      &:hover {
        background: var(--accent-hover, #6E3FF3) !important;
        box-shadow: 0 8px 28px rgba(124, 77, 255, 0.4), 0 2px 6px rgba(0,0,0,0.25) !important;
        transform: translateY(-1px);
      }
    }

    /* Secondary / contained default */
    &.MuiButton-containedSecondary {
      background: var(--blue, #448AFF) !important;
      color: #ffffff !important;
      box-shadow: 0 4px 18px rgba(68, 138, 255, 0.25) !important;

      &:hover {
        box-shadow: 0 8px 24px rgba(68, 138, 255, 0.35) !important;
        transform: translateY(-1px);
      }
    }

    /* Outlined — accent-tinted glass border */
    &.MuiButton-outlinedPrimary {
      border: 1px solid rgba(124, 77, 255, 0.4) !important;
      color: var(--accent, #7C4DFF) !important;
      background: rgba(124, 77, 255, 0.06) !important;

      &:hover {
        background: rgba(124, 77, 255, 0.12) !important;
        border-color: var(--accent, #7C4DFF) !important;
        transform: translateY(-1px);
      }
    }

    &.MuiButton-outlinedSecondary {
      border: 1px solid rgba(124, 77, 255, 0.15) !important;
      color: rgba(226, 232, 255, 0.75) !important;
      background: rgba(255, 255, 255, 0.04) !important;

      &:hover {
        background: rgba(124, 77, 255, 0.08) !important;
        border-color: rgba(124, 77, 255, 0.3) !important;
        transform: translateY(-1px);
      }
    }
  }
`;

export const AppButton = ({ children, ...props }) => {
  return <StyledButton {...props}>{children}</StyledButton>;
};

export default AppButton;
