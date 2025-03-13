import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const HowItWorksSection = styled.section`
  padding: 100px 0;
  position: relative;
  overflow: hidden;
  background: rgba(15, 22, 36, 0.7);
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

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 800px;
  margin: 0 auto;
`;

const Step = styled(motion.div)`
  display: flex;
  margin-bottom: 60px;
  position: relative;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:not(:last-child):before {
    content: '';
    position: absolute;
    top: 80px;
    left: 40px;
    width: 2px;
    height: calc(100% - 40px);
    background: linear-gradient(to bottom, var(--primary), var(--secondary));
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    
    &:not(:last-child):before {
      left: 50%;
      transform: translateX(-50%);
      top: 100px;
      height: 80px;
    }
  }
`;

const StepNumber = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.gradient || 'var(--gradient-primary)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-right: 30px;
  flex-shrink: 0;
  z-index: 1;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 20px;
  }
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 10px;
  
  span {
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const StepDescription = styled.p`
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 15px;
`;

const StepExample = styled.div`
  background: rgba(26, 26, 46, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 15px;
  margin-top: 15px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  font-family: 'Space Grotesk', monospace;
  color: var(--text-primary);
  
  span {
    color: var(--accent);
  }
`;

const HowItWorks = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  const steps = [
    {
      number: 1,
      title: "Enter Your Prompt",
      description: "Describe the transaction you want to create in simple English. No need to know complex blockchain terminology or coding.",
      example: 'stake 10 EGLD with validator',
      gradient: 'linear-gradient(135deg, #4161FF, #8395FF)',
    },
    {
      number: 2,
      title: "Generate Your Warp",
      description: "WarpX converts your prompt into a properly formatted blockchain transaction and creates a shareable link and QR code.",
      example: 'Transaction Hash: 4f97a4ac2f78d5a347460451a6b557b1dc89d4df2bda2cb3ce7d419cc61a39cb',
      gradient: 'linear-gradient(135deg, #00CCFF, #4CC6FF)',
    },
    {
      number: 3,
      title: "Share With Anyone",
      description: "Send your Warp link or QR code to anyone. They can execute the transaction exactly as you designed it without any technical knowledge.",
      example: 'https://devnet.usewarp.to/stake-may-2023',
      gradient: 'linear-gradient(135deg, #FF5CAA, #FF85BC)',
    },
    {
      number: 4,
      title: "Transaction Execution",
      description: "Recipients connect their wallet, review the transaction details, and execute it with a single click. They'll need EGLD in their wallet for transaction fees.",
      example: 'Transaction successful! View on explorer',
      gradient: 'linear-gradient(135deg, #00C853, #69F0AE)',
    },
  ];

  return (
    <HowItWorksSection id="how-it-works">
      <Container>
        <SectionTitle>
          How It <span>Works</span>
        </SectionTitle>
        
        <SectionDescription>
          Creating and sharing blockchain transactions has never been easier. Follow these simple steps to get started with WarpX.
        </SectionDescription>
        
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <StepsContainer>
            {steps.map((step, index) => (
              <Step key={index} variants={itemVariants}>
                <StepNumber gradient={step.gradient}>{step.number}</StepNumber>
                <StepContent>
                  <StepTitle>
                    <span>{step.title}</span>
                  </StepTitle>
                  <StepDescription>{step.description}</StepDescription>
                  <StepExample>
                    <span>›</span> {step.example}
                  </StepExample>
                </StepContent>
              </Step>
            ))}
          </StepsContainer>
        </motion.div>
      </Container>
    </HowItWorksSection>
  );
};

export default HowItWorks; 