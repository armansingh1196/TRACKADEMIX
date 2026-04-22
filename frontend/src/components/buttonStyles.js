import styled from 'styled-components';
import { Button } from '@mui/material';

export const RedButton = styled(Button)`
  && {
    background-color: var(--error);
    color: white;
    border-radius: 10px;
    &:hover {
      background-color: #d32f2f;
      box-shadow: 0 4px 12px rgba(211, 47, 47, 0.2);
    }
  }
`;

export const BlackButton = styled(Button)`
  && {
    background-color: var(--bg-surface);
    color: white;
    border-radius: 10px;
    border: 1px solid var(--border);
    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
      border-color: var(--text-muted);
    }
  }
`;

export const BlueButton = styled(Button)`
  && {
    background: var(--gradient-primary);
    color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 14px rgba(132, 94, 194, 0.3);
    &:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
  }
`;

export const PurpleButton = styled(Button)`
  && {
    background-color: var(--primary);
    color: #fff;
    border-radius: 10px;
    &:hover {
      background-color: var(--primary-light);
    }
  }
`;

export const LightPurpleButton = styled(Button)`
  && {
    background: var(--gradient-vibrant);
    color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 14px rgba(255, 128, 102, 0.3);
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
    border-radius: 10px;
    &:hover {
      filter: brightness(0.9);
    }
  }
`;

export const IndigoButton = styled(Button)`
  && {
    background-color: #3F51B5;
    color: white;
    border-radius: 10px;
    &:hover {
      background-color: #303F9F;
    }
  }
`;
