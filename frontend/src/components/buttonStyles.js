import styled from 'styled-components';
import { Button } from '@mui/material';

export const RedButton = styled(Button)`
  && {
    background-color: var(--error);
    color: white;
    border-radius: 12px;
    font-family: var(--font-body);
    font-weight: 600;
    letter-spacing: -0.01em;
    transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    &:hover {
      background-color: #ef4444;
      box-shadow: 0 4px 16px rgba(248, 113, 113, 0.25);
      transform: translateY(-1px);
    }
    &:active {
      transform: scale(0.97);
    }
  }
`;

export const BlackButton = styled(Button)`
  && {
    background-color: var(--bg-surface);
    color: var(--text-1);
    border-radius: 12px;
    border: 1px solid var(--separator);
    font-family: var(--font-body);
    font-weight: 600;
    letter-spacing: -0.01em;
    transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    &:hover {
      background-color: rgba(255, 255, 255, 0.06);
      border-color: var(--separator-strong);
      transform: translateY(-1px);
    }
  }
`;

export const BlueButton = styled(Button)`
  && {
    background: var(--gradient-vibrant);
    color: #fff;
    border-radius: 12px;
    font-family: var(--font-body);
    font-weight: 600;
    letter-spacing: -0.01em;
    box-shadow: 0 4px 16px rgba(124, 77, 255, 0.25);
    transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    &:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(124, 77, 255, 0.35);
    }
    &:active {
      transform: scale(0.97);
    }
  }
`;

export const PurpleButton = styled(Button)`
  && {
    background-color: var(--primary);
    color: #fff;
    border-radius: 12px;
    font-family: var(--font-body);
    font-weight: 600;
    letter-spacing: -0.01em;
    transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    &:hover {
      background-color: var(--accent-hover);
      box-shadow: 0 4px 16px var(--accent-glow);
      transform: translateY(-1px);
    }
  }
`;

export const LightPurpleButton = styled(Button)`
  && {
    background: var(--gradient-vibrant);
    color: #fff;
    border-radius: 12px;
    font-family: var(--font-body);
    font-weight: 600;
    letter-spacing: -0.01em;
    box-shadow: 0 4px 14px rgba(124, 77, 255, 0.2);
    transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    &:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
  }
`;

export const GreenButton = styled(Button)`
  && {
    background-color: var(--success);
    color: #fff;
    border-radius: 12px;
    font-family: var(--font-body);
    font-weight: 600;
    letter-spacing: -0.01em;
    transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    &:hover {
      filter: brightness(0.92);
      transform: translateY(-1px);
    }
  }
`;

export const IndigoButton = styled(Button)`
  && {
    background-color: #5C6BC0;
    color: white;
    border-radius: 12px;
    font-family: var(--font-body);
    font-weight: 600;
    letter-spacing: -0.01em;
    transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    &:hover {
      background-color: #3F51B5;
      transform: translateY(-1px);
    }
  }
`;
