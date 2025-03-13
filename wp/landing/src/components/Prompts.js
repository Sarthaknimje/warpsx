import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaArrowRight } from 'react-icons/fa';

const PromptsSection = styled.section`
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

const TabsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const Tab = styled.button`
  padding: 10px 20px;
  margin: 0 10px 10px;
  background: ${props => props.active ? 'var(--gradient-primary)' : 'rgba(26, 26, 46, 0.7)'};
  border: none;
  border-radius: 50px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: ${props => props.active ? '0 10px 20px rgba(65, 97, 255, 0.3)' : '0 10px 20px rgba(0, 0, 0, 0.1)'};
  }
`;

const PromptsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const PromptCard = styled(motion.div)`
  background: rgba(26, 26, 46, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

const PromptHeader = styled.div`
  background: ${props => props.gradient || 'var(--gradient-primary)'};
  padding: 15px 20px;
  color: white;
  font-weight: 600;
`;

const PromptContent = styled.div`
  padding: 20px;
`;

const PromptText = styled.div`
  font-family: 'Space Grotesk', monospace;
  background: rgba(15, 22, 36, 0.5);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  color: var(--text-primary);
  font-size: 1.1rem;
`;

const PromptDescription = styled.p`
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 15px;
`;

const PromptResult = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(15, 22, 36, 0.3);
  padding: 10px 15px;
  border-radius: 8px;
  margin-top: 15px;
  font-size: 0.9rem;
  
  a {
    color: var(--primary);
    display: flex;
    align-items: center;
    gap: 5px;
    transition: all 0.3s ease;
    
    &:hover {
      color: var(--secondary);
      transform: translateX(3px);
    }
  }
`;

const Prompts = () => {
  const [activeTab, setActiveTab] = useState('staking');
  const [ref, inView] = useInView({
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

  const tabs = [
    { id: 'staking', label: 'Staking' },
    { id: 'swapping', label: 'Swapping' },
    { id: 'lending', label: 'Lending/Borrowing' },
    { id: 'nft', label: 'NFTs' },
  ];

  const promptsByCategory = {
    staking: [
      {
        text: 'Stake 10 EGLD with validator erd1qqqqqqqqqqqqqpgqqz6vp7vs3p7u8t8gxppjq8qwkx7urj4g7a3s69j92r',
        description: 'Stake EGLD with a specific validator by providing their address.',
        result: 'Creates a staking transaction with 10 EGLD.',
        gradient: 'linear-gradient(135deg, #4161FF, #8395FF)',
      },
      {
        text: 'Stake 5 EGLD',
        description: 'Stake EGLD using a default validator selected by the system.',
        result: 'Creates a staking transaction with 5 EGLD to the default validator.',
        gradient: 'linear-gradient(135deg, #4161FF, #8395FF)',
      },
    ],
    swapping: [
      {
        text: 'Swap 1 EGLD for USDC at the best rate',
        description: 'Exchange EGLD for USDC using the best available rate.',
        result: 'Creates a swap transaction on a DEX.',
        gradient: 'linear-gradient(135deg, #00CCFF, #4CC6FF)',
      },
      {
        text: 'Exchange 100 USDC for MEX',
        description: 'Swap USDC to MEX tokens.',
        result: 'Creates a swap transaction with 100 USDC.',
        gradient: 'linear-gradient(135deg, #00CCFF, #4CC6FF)',
      },
    ],
    lending: [
      {
        text: 'Lend 100 USDC to earn interest',
        description: 'Deposit USDC in a lending platform to earn yield.',
        result: 'Creates a lending deposit transaction with 100 USDC.',
        gradient: 'linear-gradient(135deg, #FF5CAA, #FF85BC)',
      },
      {
        text: 'Borrow 500 USDC with 2 EGLD as collateral',
        description: 'Borrow USDC by providing EGLD as collateral.',
        result: 'Creates a transaction to deposit collateral and borrow tokens.',
        gradient: 'linear-gradient(135deg, #FF5CAA, #FF85BC)',
      },
    ],
    nft: [
      {
        text: 'Mint an NFT for 0.5 EGLD from collection XOXO',
        description: 'Purchase an NFT from a specific collection.',
        result: 'Creates a transaction to mint an NFT for 0.5 EGLD.',
        gradient: 'linear-gradient(135deg, #9C27B0, #CE93D8)',
      },
      {
        text: 'Send my NFT with token ID EXAMPLE-123456 to erd1qqqqqqqqqqqqqpgqd9rvv2n378e27jcts8vfwynpkm8ng7g7945s2ey76d',
        description: 'Transfer an NFT to another wallet address.',
        result: 'Creates a transaction to transfer the specified NFT.',
        gradient: 'linear-gradient(135deg, #9C27B0, #CE93D8)',
      },
    ],
  };

  return (
    <PromptsSection id="prompts">
      <Container>
        <SectionTitle>
          Example <span>Prompts</span>
        </SectionTitle>
        
        <SectionDescription>
          You can create almost any blockchain transaction with simple English prompts. Here are some examples to get you started.
        </SectionDescription>
        
        <TabsContainer>
          {tabs.map(tab => (
            <Tab 
              key={tab.id} 
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Tab>
          ))}
        </TabsContainer>
        
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          key={activeTab}
        >
          <PromptsGrid>
            {promptsByCategory[activeTab].map((prompt, index) => (
              <PromptCard key={index} variants={itemVariants}>
                <PromptHeader gradient={prompt.gradient}>
                  Example {index + 1}
                </PromptHeader>
                <PromptContent>
                  <PromptText>
                    {prompt.text}
                  </PromptText>
                  <PromptDescription>
                    {prompt.description}
                  </PromptDescription>
                  <PromptResult>
                    <span>Result:</span>
                    <a href="#how-it-works">
                      {prompt.result} <FaArrowRight />
                    </a>
                  </PromptResult>
                </PromptContent>
              </PromptCard>
            ))}
          </PromptsGrid>
        </motion.div>
      </Container>
    </PromptsSection>
  );
};

export default Prompts; 