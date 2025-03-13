import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaRobot, FaLink, FaQrcode, FaTelegramPlane, FaShieldAlt, FaGlobe } from 'react-icons/fa';

const FeaturesSection = styled.section`
  padding: 100px 0;
  position: relative;
  overflow: hidden;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 2rem;
  
  span {
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SectionDescription = styled.p`
  text-align: center;
  max-width: 700px;
  margin: 0 auto 4rem;
  color: var(--text-secondary);
  font-size: 1.1rem;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 3rem;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled(motion.div)`
  background: rgba(26, 26, 46, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

const IconContainer = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.gradient || 'var(--gradient-primary)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  
  svg {
    font-size: 2rem;
    color: white;
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 15px;
`;

const FeatureDescription = styled.p`
  color: var(--text-secondary);
  line-height: 1.6;
`;

const BackgroundGradient = styled.div`
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 92, 170, 0.15) 0%, rgba(15, 22, 36, 0) 70%);
  width: 80vw;
  height: 80vw;
  bottom: -30%;
  left: -30%;
  z-index: -1;
`;

const Features = () => {
  const [featuresRef, featuresInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const features = [
    {
      icon: <FaRobot />,
      title: 'Natural Language',
      description: 'Create blockchain transactions using simple English prompts. No technical knowledge required.',
      gradient: 'linear-gradient(135deg, #4161FF, #8395FF)',
    },
    {
      icon: <FaLink />,
      title: 'Shareable Links',
      description: 'Generate links that anyone can use to execute your transaction exactly as you designed it.',
      gradient: 'linear-gradient(135deg, #00CCFF, #4CC6FF)',
    },
    {
      icon: <FaQrcode />,
      title: 'QR Codes',
      description: 'Create scannable QR codes for easy sharing of your Warps across devices.',
      gradient: 'linear-gradient(135deg, #FF5CAA, #FF85BC)',
    },
    {
      icon: <FaTelegramPlane />,
      title: 'Telegram Integration',
      description: 'Use the WarpX Telegram bot to create and share Warps directly in chats and groups.',
      gradient: 'linear-gradient(135deg, #0088CC, #29B6F6)',
    },
    {
      icon: <FaShieldAlt />,
      title: 'Secure Execution',
      description: 'Recipients can review and approve all transaction details before execution.',
      gradient: 'linear-gradient(135deg, #00C853, #69F0AE)',
    },
    {
      icon: <FaGlobe />,
      title: 'MultiversX Ecosystem',
      description: 'Fully integrated with the MultiversX blockchain for fast, low-cost transactions.',
      gradient: 'linear-gradient(135deg, #9C27B0, #CE93D8)',
    },
  ];

  return (
    <FeaturesSection id="features" ref={featuresRef}>
      <BackgroundGradient />
      
      <Container>
        <SectionTitle>
          Powerful <span>Features</span>
        </SectionTitle>
        
        <SectionDescription>
          WarpX combines natural language processing with blockchain technology to make transactions accessible to everyone, regardless of technical expertise.
        </SectionDescription>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={featuresInView ? 'visible' : 'hidden'}
        >
          <FeaturesGrid>
            {features.map((feature, index) => (
              <FeatureCard key={index} variants={itemVariants}>
                <IconContainer gradient={feature.gradient}>
                  {feature.icon}
                </IconContainer>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </motion.div>
      </Container>
    </FeaturesSection>
  );
};

export default Features; 