import styled from 'styled-components';
import { Button } from '@mui/material';

const StyledButton = styled(Button)`
  && {
    padding: ${props => props.size === 'small' ? '8px 16px' : '12px 24px'};
    border-radius: 12px;
    font-weight: 600;
    text-transform: none;
    font-family: 'Inter', sans-serif;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: ${props => props.variant === 'contained' ? 'var(--shadow-md)' : 'none'};

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${props => props.variant === 'contained' ? 'var(--shadow-lg)' : 'none'};
      background-color: ${props => 
        props.color === 'primary' ? 'var(--primary-light)' : 
        props.color === 'secondary' ? 'var(--secondary-hover)' : 'inherit'};
    }

    &.MuiButton-containedPrimary {
      background-color: var(--primary);
    }

    &.MuiButton-containedSecondary {
      background-color: var(--secondary);
    }

    &.MuiButton-outlinedPrimary {
      border-color: var(--primary);
      color: var(--primary);
    }
    
    &.MuiButton-outlinedSecondary {
      border-color: var(--secondary);
      color: var(--secondary);
    }
  }
`;

export const AppButton = ({ children, ...props }) => {
  return <StyledButton {...props}>{children}</StyledButton>;
};

export default AppButton;
