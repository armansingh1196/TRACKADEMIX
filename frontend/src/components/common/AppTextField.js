import React from 'react';
import { TextField, styled } from '@mui/material';

const StyledTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    border-radius: 14px;
    background-color: white;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    & fieldset {
      border-color: var(--border);
      transition: all 0.3s ease;
    }
    
    &:hover fieldset {
      border-color: var(--secondary);
    }
    
    &.Mui-focused fieldset {
      border-color: var(--secondary);
      border-width: 2px;
    }

    &.Mui-error fieldset {
      border-color: #ef4444;
    }
  }

  & .MuiInputLabel-root {
    font-family: 'Inter', sans-serif;
    color: var(--text-muted);
    &.Mui-focused {
      color: var(--secondary);
    }
  }

  & .MuiInputBase-input {
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    padding: 16px;
  }
`;

const AppTextField = (props) => {
  return <StyledTextField {...props} variant="outlined" />;
};

export default AppTextField;
