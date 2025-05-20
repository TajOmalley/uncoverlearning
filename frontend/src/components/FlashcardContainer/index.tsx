import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Flashcard from '../Flashcard/Flashcard';
import { FlashcardData } from '../../types';

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

const MenuIcon = styled.div`
  font-size: 1.5rem;
  cursor: pointer;
  color: #5c6a5a;
  transition: color 0.2s ease;

  &:hover {
    color: #4a5649;
  }
`;

const ContactText = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  color: #5c6a5a;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #4a5649;
  }
`;

const Logo = styled.div<{ $visible: boolean }>`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.3s ease;
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  color: #5c6a5a;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: #f5f5f5;
  position: relative;
  padding-top: 100px;
`;

const CardStack = styled.div`
  position: relative;
  width: 100%;
  height: 85vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 2rem;
`;

const CardWrapper = styled.div<{ $offset: number; $zIndex: number; $isVisible: boolean }>`
  position: absolute;
  transform: translateX(${props => props.$offset * 60}px);
  z-index: ${props => props.$zIndex};
  opacity: ${props => props.$isVisible ? 1 : 0};
  transition: transform 0.3s ease, opacity 0.3s ease;
  cursor: pointer;
  width: 100%;
  max-width: 1200px;

  &:hover {
    transform: translateX(${props => props.$offset * 60}px) translateY(-10px);
  }
`;

const ArrowButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 2.5rem;
  color: #5c6a5a;
  cursor: pointer;
  padding: 1rem;
  z-index: 10;
  transition: color 0.2s ease;

  &:hover {
    color: #4a5649;
  }

  &.left {
    left: 2rem;
  }

  &.right {
    right: 2rem;
  }
`;

interface FlashcardContainerProps {
  cards: FlashcardData[];
  onExpandLogoCard: () => void;
  onCollapseLogoCard: () => void;
}

const FlashcardContainer: React.FC<FlashcardContainerProps> = ({
  cards,
  onExpandLogoCard,
  onCollapseLogoCard
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLogo, setShowLogo] = useState(false);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + cards.length) % cards.length);
  };

  useEffect(() => {
    setShowLogo(currentIndex > 0);
  }, [currentIndex]);

  return (
    <>
      <Header>
        <MenuIcon>☰</MenuIcon>
        <Logo $visible={showLogo}>LOGO</Logo>
        <ContactText>Contact</ContactText>
      </Header>
      <Container>
        <CardStack>
          {cards.map((card, index) => {
            const offset = index - currentIndex;
            const isVisible = index === currentIndex || 
                            index === (currentIndex + 1) % cards.length || 
                            index === (currentIndex + 2) % cards.length;
            const zIndex = index === currentIndex ? 3 : 2 - Math.abs(offset);

            return (
              <CardWrapper
                key={index}
                $offset={offset}
                $zIndex={zIndex}
                $isVisible={isVisible}
              >
                <Flashcard
                  id={card.id}
                  frontContent={card.frontContent}
                  backContent={card.backContent}
                  isLogoCard={card.isLogoCard}
                  onExpand={card.isLogoCard ? onExpandLogoCard : undefined}
                  onCollapse={card.isLogoCard ? onCollapseLogoCard : undefined}
                />
              </CardWrapper>
            );
          })}
        </CardStack>
        <ArrowButton className="left" onClick={handlePrev}>←</ArrowButton>
        <ArrowButton className="right" onClick={handleNext}>→</ArrowButton>
      </Container>
    </>
  );
};

export default FlashcardContainer; 