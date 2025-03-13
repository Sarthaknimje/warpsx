import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaTelegramPlane, FaRocket, FaArrowRight } from 'react-icons/fa';

const TelegramSection = styled.section`
  padding: 100px 0;
  position: relative;
  overflow: hidden;
  background: rgba(15, 22, 36, 0.7);
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 60px;
  
  @media (max-width: 992px) {
    flex-direction: column;
    text-align: center;
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  max-width: 500px;
  
  @media (max-width: 992px) {
    max-width: 100%;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
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
  margin-bottom: 2rem;
  color: var(--text-secondary);
  font-size: 1.1rem;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 2.5rem;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  
  svg {
    margin-right: 15px;
    color: var(--primary);
    font-size: 1.2rem;
    flex-shrink: 0;
  }
  
  @media (max-width: 992px) {
    justify-content: center;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 992px) {
    justify-content: center;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const TelegramButton = styled(motion.a)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #0088cc;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  
  svg {
    font-size: 1.2rem;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0, 136, 204, 0.3);
  }
`;

const SecondaryButton = styled(motion.a)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  border: 2px solid var(--primary);
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  
  svg {
    font-size: 1.2rem;
  }
  
  &:hover {
    transform: translateY(-3px);
    background: rgba(65, 97, 255, 0.1);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
`;

const ImageContainer = styled(motion.div)`
  flex: 1;
  max-width: 500px;
  position: relative;
  
  @media (max-width: 992px) {
    max-width: 400px;
    width: 100%;
  }
`;

const TelegramMockup = styled.div`
  position: relative;
  padding: 20px;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 24px;
    padding: 2px;
    background: linear-gradient(135deg, #0088cc, #29B6F6);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
`;

const ChatWindow = styled.div`
  background: #17212B;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const ChatHeader = styled.div`
  background: #2B5278;
  color: white;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  
  .bot-name {
    font-weight: 600;
    margin-left: 10px;
  }
  
  .bot-icon {
    width: 30px;
    height: 30px;
    background: #0088cc;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
      color: white;
      font-size: 1rem;
    }
  }
`;

const ChatBody = styled.div`
  padding: 15px;
  height: 320px;
  overflow-y: auto;
`;

const ChatMessage = styled.div`
  margin-bottom: 15px;
  
  &.user {
    text-align: right;
    
    .message-bubble {
      background: #2B5278;
      border-radius: 15px 15px 0 15px;
      margin-left: auto;
    }
  }
  
  &.bot {
    .message-bubble {
      background: #242F3D;
      border-radius: 15px 15px 15px 0;
    }
  }
  
  .message-bubble {
    display: inline-block;
    padding: 10px 15px;
    max-width: 80%;
    font-size: 0.9rem;
    margin-bottom: 5px;
  }
  
  .timestamp {
    font-size: 0.7rem;
    opacity: 0.7;
  }
`;

const CommandBadge = styled.div`
  position: absolute;
  background: linear-gradient(135deg, #0088cc, #29B6F6);
  color: white;
  padding: 10px 15px;
  border-radius: 50px;
  font-weight: 600;
  box-shadow: 0 10px 25px rgba(0, 136, 204, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Space Grotesk', monospace;
  
  &.top-right {
    top: 20px;
    right: -15px;
  }
  
  &.bottom-left {
    bottom: 20px;
    left: -15px;
  }
`;

const QRBlock = styled.div`
  background: white;
  width: 120px;
  height: 120px;
  border-radius: 10px;
  position: absolute;
  bottom: -30px;
  right: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  
  .qr-header {
    color: #333;
    font-size: 0.7rem;
    font-weight: 600;
    margin-bottom: 5px;
  }
  
  .qr-grid {
    width: 80px;
    height: 80px;
    background: #333;
    position: relative;
    
    &:before, &:after {
      content: '';
      position: absolute;
      background: white;
    }
    
    &:before {
      top: 10px;
      left: 10px;
      right: 10px;
      bottom: 10px;
    }
    
    &:after {
      top: 20px;
      left: 20px;
      right: 20px;
      bottom: 20px;
      background: #333;
    }
  }
`;

const Telegram = () => {
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

  return (
    <TelegramSection id="telegram" ref={ref}>
      <Container>
        <ContentContainer>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <motion.div variants={itemVariants}>
              <SectionTitle>
                Interact with <span>Telegram Bot</span>
              </SectionTitle>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <SectionDescription>
                WarpX is available as a Telegram bot, allowing you to create and share blockchain transactions directly in your chats and groups. Try our Telegram bot for a seamless mobile experience.
              </SectionDescription>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <FeaturesList>
                <FeatureItem>
                  <FaTelegramPlane />
                  <span>Use natural language commands to create transactions</span>
                </FeatureItem>
                <FeatureItem>
                  <FaTelegramPlane />
                  <span>Share transaction links directly in chats and groups</span>
                </FeatureItem>
                <FeatureItem>
                  <FaTelegramPlane />
                  <span>Access templates for common operations</span>
                </FeatureItem>
                <FeatureItem>
                  <FaTelegramPlane />
                  <span>Preview transactions before creating them</span>
                </FeatureItem>
              </FeaturesList>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <ButtonContainer>
                <TelegramButton 
                  href="https://t.me/WarpX_bot" 
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaTelegramPlane /> Start Bot Chat
                </TelegramButton>
                
                <SecondaryButton 
                  href="http://localhost:3000" 
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaRocket /> Launch Web App
                </SecondaryButton>
              </ButtonContainer>
            </motion.div>
          </motion.div>
        </ContentContainer>
        
        <ImageContainer
          variants={{
            hidden: { opacity: 0, x: 50 },
            visible: {
              opacity: 1,
              x: 0,
              transition: {
                duration: 0.8,
              },
            },
          }}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <TelegramMockup>
            <ChatWindow>
              <ChatHeader>
                <div className="bot-icon">
                  <FaTelegramPlane />
                </div>
                <div className="bot-name">WarpX Bot</div>
              </ChatHeader>
              <ChatBody>
                <ChatMessage className="bot">
                  <div className="message-bubble">👋 Welcome to WarpX Bot! Create blockchain transactions with natural language prompts.</div>
                  <div className="timestamp">11:42 AM</div>
                </ChatMessage>
                <ChatMessage className="user">
                  <div className="message-bubble">/warp stake 10 EGLD</div>
                  <div className="timestamp">11:43 AM</div>
                </ChatMessage>
                <ChatMessage className="bot">
                  <div className="message-bubble">⚙️ Creating your Warp...</div>
                  <div className="timestamp">11:43 AM</div>
                </ChatMessage>
                <ChatMessage className="bot">
                  <div className="message-bubble">
                    ✅ Warp created successfully!
                    <br /><br />
                    📋 Transaction Hash: 4f97a4ac2f78d5a3...
                    <br /><br />
                    🔗 Shareable Link: https://devnet.usewarp.to/stake-egld
                    <br /><br />
                    📱 Share this link or QR code to let anyone execute the transaction!
                  </div>
                  <div className="timestamp">11:44 AM</div>
                </ChatMessage>
              </ChatBody>
            </ChatWindow>
            <CommandBadge className="top-right">
              <FaTelegramPlane /> /warp
            </CommandBadge>
            <CommandBadge className="bottom-left">
              <FaTelegramPlane /> /templates
            </CommandBadge>
            <QRBlock>
              <div className="qr-header">Scan Me</div>
              <div className="qr-grid"></div>
            </QRBlock>
          </TelegramMockup>
        </ImageContainer>
      </Container>
    </TelegramSection>
  );
};

export default Telegram; 