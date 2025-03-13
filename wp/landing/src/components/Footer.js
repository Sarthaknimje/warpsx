import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaGithub, FaTelegramPlane, FaTwitter, FaHeart } from 'react-icons/fa';

const FooterSection = styled.footer`
  padding: 80px 0 40px;
  position: relative;
  overflow: hidden;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 60px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 40px;
  }
`;

const LogoSection = styled.div`
  max-width: 300px;
  
  @media (max-width: 768px) {
    max-width: 100%;
    text-align: center;
  }
`;

const Logo = styled.div`
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 2rem;
  margin-bottom: 20px;
  
  span {
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const LogoDescription = styled.p`
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 20px;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 15px;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const SocialIcon = styled(motion.a)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(26, 26, 46, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--primary);
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(65, 97, 255, 0.3);
  }
`;

const LinksSection = styled.div`
  display: flex;
  gap: 60px;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-around;
  }
  
  @media (max-width: 576px) {
    flex-direction: column;
    text-align: center;
    gap: 30px;
  }
`;

const LinkColumn = styled.div``;

const ColumnTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 20px;
  color: white;
`;

const LinksList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const LinkItem = styled.li`
  margin-bottom: 10px;
  
  a {
    color: var(--text-secondary);
    transition: all 0.3s ease;
    
    &:hover {
      color: var(--primary);
    }
  }
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin-bottom: 30px;
`;

const FooterBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
`;

const Copyright = styled.p`
  color: var(--text-secondary);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
  
  svg {
    color: var(--accent);
  }
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 20px;
  
  a {
    color: var(--text-secondary);
    font-size: 0.9rem;
    transition: all 0.3s ease;
    
    &:hover {
      color: var(--primary);
    }
  }
`;

const Footer = () => {
  return (
    <FooterSection>
      <Container>
        <FooterContent>
          <LogoSection>
            <Logo>
              <span>WarpX</span>
            </Logo>
            <LogoDescription>
              Create blockchain transactions with natural language prompts. Share links and QR codes for easy execution.
            </LogoDescription>
            <SocialLinks>
              <SocialIcon 
                href="https://github.com/Sarthaknimje/wp" 
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaGithub />
              </SocialIcon>
              <SocialIcon 
                href="https://t.me/WarpX_bot" 
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTelegramPlane />
              </SocialIcon>
              <SocialIcon 
                href="https://twitter.com/" 
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTwitter />
              </SocialIcon>
            </SocialLinks>
          </LogoSection>
          
          <LinksSection>
            <LinkColumn>
              <ColumnTitle>Product</ColumnTitle>
              <LinksList>
                <LinkItem>
                  <a href="#features">Features</a>
                </LinkItem>
                <LinkItem>
                  <a href="#how-it-works">How It Works</a>
                </LinkItem>
                <LinkItem>
                  <a href="#prompts">Example Prompts</a>
                </LinkItem>
                <LinkItem>
                  <a href="#telegram">Telegram Bot</a>
                </LinkItem>
              </LinksList>
            </LinkColumn>
            
            <LinkColumn>
              <ColumnTitle>Resources</ColumnTitle>
              <LinksList>
                <LinkItem>
                  <a href="https://github.com/Sarthaknimje/wp" target="_blank" rel="noreferrer">
                    GitHub Repository
                  </a>
                </LinkItem>
                <LinkItem>
                  <a href="https://docs.multiversx.com/" target="_blank" rel="noreferrer">
                    MultiversX Docs
                  </a>
                </LinkItem>
                <LinkItem>
                  <a href="https://devnet.usewarp.to/" target="_blank" rel="noreferrer">
                    Warp Protocol
                  </a>
                </LinkItem>
                <LinkItem>
                  <a href="https://t.me/WarpX_bot" target="_blank" rel="noreferrer">
                    Telegram Bot
                  </a>
                </LinkItem>
              </LinksList>
            </LinkColumn>
            
            <LinkColumn>
              <ColumnTitle>Contact</ColumnTitle>
              <LinksList>
                <LinkItem>
                  <a href="https://github.com/Sarthaknimje" target="_blank" rel="noreferrer">
                    GitHub Profile
                  </a>
                </LinkItem>
                <LinkItem>
                  <a href="https://t.me/WarpX_bot" target="_blank" rel="noreferrer">
                    Telegram
                  </a>
                </LinkItem>
                <LinkItem>
                  <a href="mailto:contact@example.com">
                    Email Us
                  </a>
                </LinkItem>
              </LinksList>
            </LinkColumn>
          </LinksSection>
        </FooterContent>
        
        <Divider />
        
        <FooterBottom>
          <Copyright>
            © {new Date().getFullYear()} WarpX. Made with <FaHeart /> for the MultiversX Hackathon
          </Copyright>
          
          <FooterLinks>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </FooterLinks>
        </FooterBottom>
      </Container>
    </FooterSection>
  );
};

export default Footer; 