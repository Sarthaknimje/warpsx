import React, { useState, useEffect } from 'react';
import { Link } from 'react-scroll';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FaBars, FaTimes, FaTelegramPlane, FaGithub } from 'react-icons/fa';

const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  transition: all 0.3s ease;
  backdrop-filter: ${props => props.scrolled ? 'blur(10px)' : 'none'};
  background: ${props => props.scrolled ? 'rgba(15, 22, 36, 0.8)' : 'transparent'};
  box-shadow: ${props => props.scrolled ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none'};
`;

const Logo = styled.div`
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  
  span {
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const NavItems = styled.div`
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'flex' : 'none'};
    flex-direction: column;
    position: absolute;
    top: 80px;
    left: 0;
    right: 0;
    background: rgba(15, 22, 36, 0.95);
    backdrop-filter: blur(10px);
    padding: 1rem;
    border-radius: 0 0 20px 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
`;

const NavLink = styled(Link)`
  margin: 0 1rem;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--gradient-primary);
    transition: width 0.3s ease;
  }
  
  &:hover:after {
    width: 100%;
  }
  
  @media (max-width: 768px) {
    margin: 1rem 0;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  align-items: center;
  margin-left: 2rem;
  
  a {
    margin-left: 1rem;
    font-size: 1.2rem;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-3px);
      color: var(--primary);
    }
  }
  
  @media (max-width: 768px) {
    margin: 1rem 0 0 0;
  }
`;

const NavButton = styled.button`
  background: var(--gradient-primary);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(65, 97, 255, 0.3);
  }
  
  @media (max-width: 768px) {
    margin-top: 1rem;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: white;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const closeMenu = () => {
    setIsOpen(false);
  };
  
  return (
    <NavbarContainer scrolled={scrolled}>
      <Logo>
        <span>WarpX</span>
      </Logo>
      
      <MobileMenuButton onClick={toggleMenu}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </MobileMenuButton>
      
      <NavItems isOpen={isOpen}>
        <NavLink to="features" smooth={true} duration={500} onClick={closeMenu}>
          Features
        </NavLink>
        <NavLink to="how-it-works" smooth={true} duration={500} onClick={closeMenu}>
          How It Works
        </NavLink>
        <NavLink to="prompts" smooth={true} duration={500} onClick={closeMenu}>
          Prompts
        </NavLink>
        <NavLink to="telegram" smooth={true} duration={500} onClick={closeMenu}>
          Telegram
        </NavLink>
        
        <SocialLinks>
          <a href="https://t.me/WarpX_bot" target="_blank" rel="noreferrer">
            <FaTelegramPlane />
          </a>
          <a href="https://github.com/Sarthaknimje/wp" target="_blank" rel="noreferrer">
            <FaGithub />
          </a>
        </SocialLinks>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <NavButton onClick={() => window.open('https://warpx-7d6ojchxi-sarthaknimjes-projects.vercel.app', '_blank')}>
            Launch App
          </NavButton>
        </motion.div>
      </NavItems>
    </NavbarContainer>
  );
};

export default Navbar; 