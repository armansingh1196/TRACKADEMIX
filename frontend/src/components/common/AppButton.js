import styled from 'styled-components';
import { Button } from '@mui/material';

/* ── iOS-style Button — spring press, solid accent, SF Pro ── */
const StyledButton = styled(Button)`
  && {
    padding: ${props =>
      props.size === 'small'   ? '8px 18px' :
      props.size === 'large'   ? '14px 32px' :
                                 '11px 24px'};
    border-radius: var(--radius-md, 14px);
    font-weight: 600;
    font-size: var(--text-callout, 1rem);
    text-transform: none;
    letter-spacing: -0.01em;
    font-family: var(--font-sf, -apple-system, BlinkMacSystemFont, 'Inter', sans-serif);
    transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
    overflow: hidden;
    will-change: transform;

    /* iOS haptic press — scale down on active */
    &:active {
      transform: scale(0.96) !important;
      transition: all 0.1s ease !important;
    }

    /* Primary — solid accent fill */
    &.MuiButton-containedPrimary {
      background: var(--accent, #6E3FF3) !important;
      color: #ffffff !important;
      box-shadow: 0 4px 18px rgba(110, 63, 243, 0.35) !important;

      &:hover {
        background: var(--accent-hover, #5A2FD6) !important;
        box-shadow: 0 8px 28px rgba(110, 63, 243, 0.45) !important;
        transform: translateY(-1px);
      }
    }

    /* Secondary / contained default */
    &.MuiButton-containedSecondary {
      background: var(--blue, #0A84FF) !important;
      color: #ffffff !important;
      box-shadow: 0 4px 18px rgba(10, 132, 255, 0.3) !important;

      &:hover {
        box-shadow: 0 8px 24px rgba(10, 132, 255, 0.4) !important;
        transform: translateY(-1px);
      }
    }

    /* Outlined — hairline border, glass bg */
    &.MuiButton-outlinedPrimary {
      border: 1px solid rgba(110, 63, 243, 0.55) !important;
      color: var(--accent, #6E3FF3) !important;
      background: rgba(110, 63, 243, 0.06) !important;

      &:hover {
        background: rgba(110, 63, 243, 0.12) !important;
        border-color: var(--accent, #6E3FF3) !important;
        transform: translateY(-1px);
      }
    }

    &.MuiButton-outlinedSecondary {
      border: 1px solid rgba(84, 84, 88, 0.65) !important;
      color: rgba(235, 235, 245, 0.75) !important;
      background: rgba(120, 120, 128, 0.1) !important;

      &:hover {
        background: rgba(120, 120, 128, 0.18) !important;
        border-color: rgba(110, 63, 243, 0.4) !important;
        transform: translateY(-1px);
      }
    }
  }
`;

export const AppButton = ({ children, ...props }) => {
  return <StyledButton {...props}>{children}</StyledButton>;
};

export default AppButton;
