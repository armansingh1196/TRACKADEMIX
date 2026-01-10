import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import styled, { keyframes } from 'styled-components';
import CampusImage from "../assets/BIT_ariel_View.jpg";
import { LightPurpleButton } from '../components/buttonStyles';

const Homepage = () => {
  return (
    <Page>
      <Overlay />
      <Card>
        <Content>
          <Title>
            <span>College</span> Management System
          </Title>

          <Subtitle>
            A simple and efficient platform to manage students, faculty, classes,
            attendance, and performance—all in one place.
          </Subtitle>

          <Actions>
            <StyledLink to="/choose">
              <LightPurpleButton fullWidth>
                Login
              </LightPurpleButton>
            </StyledLink>

            <StyledLink to="/chooseasguest">
              <OutlinedButton fullWidth>
                Login as Guest
              </OutlinedButton>
            </StyledLink>

            <FooterText>
              Don’t have an account?{" "}
              <Link to="/Adminregister">Sign up</Link>
            </FooterText>
          </Actions>
        </Content>
      </Card>
    </Page>
  );
};

export default Homepage;

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Page = styled.div`
  min-height: 100vh;
  background: url(${CampusImage}) center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    rgba(20, 12, 40, 0.7),
    rgba(20, 12, 40, 0.85)
  );
`;

const Card = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 460px;
  padding: 36px 28px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  animation: ${fadeUp} 0.6s ease-out;
`;

const Content = styled.div`
  text-align: center;
  color: #ffffff;
`;

const Title = styled.h1`
  font-size: clamp(1.9rem, 1.2rem + 2vw, 2.6rem);
  font-weight: 800;
  margin-bottom: 14px;

  span {
    color: #9a73ff;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 28px;
  color: rgba(255, 255, 255, 0.85);
`;

const Actions = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const OutlinedButton = styled(Button)`
  border: 1px solid #9a73ff !important;
  color: #ffffff !important;
  font-weight: 600 !important;

  &:hover {
    background: rgba(154, 115, 255, 0.1) !important;
    border-color: #b59cff !important;
  }
`;

const FooterText = styled.p`
  margin-top: 10px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);

  a {
    color: #9a73ff;
    font-weight: 600;
    text-decoration: none;
  }
`;

const StyledLink = styled(Link)`
  width: 100%;
  text-decoration: none;
`;
