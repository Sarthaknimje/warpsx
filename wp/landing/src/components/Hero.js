import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import ReactTypingEffect from 'react-typing-effect';
import { FaRocket, FaTelegramPlane, FaArrowRight, FaQrcode } from 'react-icons/fa';

const HeroContainer = styled.section`
  height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding-top: 80px;
  background: linear-gradient(135deg, rgba(15, 22, 36, 0.95) 0%, rgba(20, 30, 48, 0.95) 100%);
`;

const HeroContent = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 992px) {
    flex-direction: column;
    justify-content: center;
    text-align: center;
  }
`;

const HeroText = styled.div`
  max-width: 600px;
  z-index: 1;
  
  @media (max-width: 992px) {
    margin-bottom: 40px;
  }
`;

const HeroTitle = styled(motion.h1)`
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  
  span {
    display: block;
    background: linear-gradient(90deg, #4161FF 0%, #8A6FFF 50%, #FF61E6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-size: 200% auto;
    animation: gradientShift 5s ease infinite;
  }
  
  @keyframes gradientShift {
    0% { background-position: 0% center; }
    50% { background-position: 100% center; }
    100% { background-position: 0% center; }
  }
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: var(--text-secondary);
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ButtonContainer = styled(motion.div)`
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

const PrimaryButton = styled(motion.button)`
  background: linear-gradient(90deg, #4161FF 0%, #8A6FFF 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(65, 97, 255, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: all 0.5s ease;
  }
  
  &:hover:before {
    left: 100%;
  }
  
  svg {
    font-size: 1.2rem;
  }
`;

const SecondaryButton = styled(motion.button)`
  background: transparent;
  color: white;
  border: 2px solid #4161FF;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: rgba(65, 97, 255, 0.1);
  }
  
  svg {
    font-size: 1.2rem;
  }
`;

const HeroImageContainer = styled(motion.div)`
  max-width: 500px;
  width: 100%;
  z-index: 1;
  
  @media (max-width: 992px) {
    max-width: 400px;
  }
`;

const HeroImage = styled.div`
  position: relative;
  padding: 20px;
  
  .app-mockup {
    width: 100%;
    height: auto;
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    background: rgba(26, 26, 46, 0.8);
    padding: 20px;
    border: 1px solid rgba(65, 97, 255, 0.3);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
    }
  }
  
  .qr-sample {
    position: absolute;
    bottom: -20px;
    right: -20px;
    width: 120px;
    height: 120px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    border: 3px solid #fff;
    animation: float 3s ease-in-out infinite;
  }
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 20px;
    padding: 2px;
    background: linear-gradient(90deg, #4161FF 0%, #8A6FFF 50%, #FF61E6 100%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    animation: borderRotate 10s linear infinite;
  }
  
  @keyframes borderRotate {
    0% { background-position: 0% center; }
    100% { background-position: 200% center; }
  }
`;

const BackgroundElement = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(65, 97, 255, 0.2) 0%, rgba(15, 22, 36, 0) 70%);
  width: 70vw;
  height: 70vw;
  top: 10%;
  right: -20%;
  z-index: 0;
  animation: pulse 8s ease-in-out infinite;
  
  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.2; }
    50% { transform: scale(1.05); opacity: 0.3; }
    100% { transform: scale(1); opacity: 0.2; }
  }
`;

const FloatingParticle = styled(motion.div)`
  position: absolute;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  background: ${props => props.color};
  opacity: ${props => props.opacity};
  z-index: 0;
  filter: blur(${props => props.blur}px);
`;

const TypedContainer = styled.div`
  height: 4rem;
  margin-bottom: 1rem;
  font-weight: 700;
  font-size: 1.5rem;
  
  span {
    background: linear-gradient(90deg, #4161FF 0%, #8A6FFF 50%, #FF61E6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-size: 200% auto;
    animation: gradientShift 5s ease infinite;
  }
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    height: 3rem;
  }
`;

const CommandPrompt = styled(motion.div)`
  background: rgba(26, 26, 46, 0.8);
  border-radius: 12px;
  padding: 15px;
  font-family: 'Space Grotesk', monospace;
  border: 1px solid rgba(65, 97, 255, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  margin-bottom: 15px;
  
  .prompt-header {
    color: var(--text-secondary);
    font-size: 0.8rem;
    margin-bottom: 5px;
    display: flex;
    justify-content: space-between;
  }
  
  .prompt-text {
    color: var(--text-primary);
  }
  
  .cursor {
    display: inline-block;
    width: 8px;
    height: 16px;
    background: #4161FF;
    animation: blink 1s infinite;
    margin-left: 5px;
    vertical-align: middle;
  }
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
`;

const ResponseBlock = styled(motion.div)`
  background: rgba(26, 26, 46, 0.7);
  border-radius: 12px;
  padding: 15px;
  font-family: 'Space Grotesk', monospace;
  border: 1px solid rgba(65, 97, 255, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  color: #00C853;
  font-size: 0.9rem;
  position: relative;
  margin-top: 10px;
`;

const QRCodeContainer = styled(motion.div)`
  position: absolute;
  bottom: -30px;
  right: -30px;
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 3px solid #4161FF;
  
  svg {
    font-size: 2.5rem;
    color: #4161FF;
  }
`;

const Hero = () => {
  const [showQR, setShowQR] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowQR(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Generate random particles for background effect
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 20 + 5,
    color: i % 3 === 0 ? '#4161FF' : i % 3 === 1 ? '#8A6FFF' : '#FF61E6',
    opacity: Math.random() * 0.3 + 0.1,
    blur: Math.random() * 5 + 2,
    duration: Math.random() * 20 + 10
  }));

  return (
    <HeroContainer id="home">
      <BackgroundElement 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.2 }}
        transition={{ duration: 2 }}
      />
      
      {particles.map(particle => (
        <FloatingParticle
          key={particle.id}
          size={particle.size}
          color={particle.color}
          opacity={particle.opacity}
          blur={particle.blur}
          style={{ top: `${particle.y}%`, left: `${particle.x}%` }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
      
      <HeroContent>
        <HeroText>
          <HeroTitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            MultiversX <span>Warp Generator</span>
          </HeroTitle>
          
          <TypedContainer>
            <ReactTypingEffect
              text={[
                "Stake 10 EGLD with validator...",
                "Swap 1 EGLD for USDC at the best rate...",
                "Borrow 500 USDC with 2 EGLD as collateral...",
                "Mint an NFT for 0.5 EGLD from collection X..."
              ]}
              speed={70}
              eraseSpeed={30}
              typingDelay={1000}
              eraseDelay={2000}
            />
          </TypedContainer>
          
          <HeroSubtitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            Create blockchain transactions using natural language prompts. Generate shareable links and QR codes that anyone can use to execute your transactions. Available on web and Telegram.
          </HeroSubtitle>
          
          <ButtonContainer
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          >
            <PrimaryButton
              whileHover={{ scale: 1.05, boxShadow: "0 15px 25px rgba(65, 97, 255, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('http://localhost:3000', '_blank')}
            >
              <FaRocket /> Launch App <FaArrowRight style={{ marginLeft: '5px' }} />
            </PrimaryButton>
            
            <SecondaryButton
              whileHover={{ scale: 1.05, borderColor: "#8A6FFF" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('https://t.me/WarpX_bot', '_blank')}
            >
              <FaTelegramPlane /> Try on Telegram
            </SecondaryButton>
          </ButtonContainer>
        </HeroText>
        
        <HeroImageContainer
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          <HeroImage>
            <div className="app-mockup">
              <CommandPrompt
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <div className="prompt-header">
                  <span>$ Enter your prompt:</span>
                  <span style={{ color: '#4161FF' }}>WarpX</span>
                </div>
                <div className="prompt-text">stake 10 EGLD<span className="cursor"></span></div>
              </CommandPrompt>
              
              <ResponseBlock
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.3 }}
              >
                ✅ Warp created successfully!<br />
                🔗 Shareable Link: https://devnet.usewarp.to/stake-egld<br />
                📱 Scan QR code to execute transaction
              </ResponseBlock>
              
              <AnimatePresence>
                {showQR && (
                  <QRCodeContainer
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 2 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <FaQrcode />
                  </QRCodeContainer>
                )}
              </AnimatePresence>
            </div>
          </HeroImage>
        </HeroImageContainer>
      </HeroContent>
    </HeroContainer>
  );
};

export default Hero; 