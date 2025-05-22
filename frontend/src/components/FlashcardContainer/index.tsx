import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Flashcard from '../Flashcard/Flashcard';
import { FlashcardData } from '../../types';
import logo from '../../assets/logo.png';

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const CenterSection = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
`;

const MenuIcon = styled.div`
  font-size: 1.5rem;
  cursor: pointer;
  color: #5c6a5a;
  transition: color 0.2s ease;
  padding: 0.5rem;

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

const Logo = styled.img`
  height: 40px;
  width: auto;
  margin: 0 1rem;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: #c5cfc4;
  position: relative;
  padding-top: 100px;
`;

const CardStack = styled.div`
  position: relative;
  width: 100%;
  height: 85vh;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 2rem;
  perspective: 1000px;
`;

const CardWrapper = styled.div<{ $offset: number; $zIndex: number; $isVisible: boolean }>`
  position: absolute;
  left: 50%;
  transform: translateX(calc(-50% + ${props => props.$offset * 60}px));
  z-index: ${props => props.$zIndex};
  opacity: ${props => props.$isVisible ? 1 : 0};
  transition: transform 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  width: 70vw;
  height: 80vh;
  max-width: 1200px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
  border-radius: 20px;
  overflow: hidden;

  &:hover {
    transform: translateX(calc(-50% + ${props => props.$offset * 60}px)) translateY(-10px);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.35);
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
  transition: color 0.2s ease, transform 0.2s ease;

  &:hover {
    color: #4a5649;
    transform: translateY(-50%) scale(1.1);
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
  const [flippedCards, setFlippedCards] = useState<boolean[]>(new Array(cards.length).fill(false));

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + cards.length) % cards.length);
  };

  const handleCardClick = (index: number) => {
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const handleFlip = (index: number) => {
    setFlippedCards(prev => {
      const newFlipped = [...prev];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
  };

  const isCardVisible = (index: number) => {
    // For the last card, only show itself
    if (currentIndex === cards.length - 1) {
      return index === currentIndex;
    }
    
    // For the second-to-last card, show itself and the last card
    if (currentIndex === cards.length - 2) {
      return index === currentIndex || index === cards.length - 1;
    }
    
    // For all other cards, show current and next two
    return index >= currentIndex && index <= currentIndex + 2;
  };

  return (
    <>
      <Header>
        <LeftSection>
          <MenuIcon onClick={() => {}}>☰</MenuIcon>
        </LeftSection>
        <CenterSection>
          <Logo src={logo} alt="Uncover Learning" />
        </CenterSection>
        <RightSection>
          <ContactText>contact</ContactText>
        </RightSection>
      </Header>
      <Container>
        <CardStack>
          {cards.map((card, index) => {
            const offset = index - currentIndex;
            const isVisible = isCardVisible(index);
            const zIndex = index === currentIndex ? 3 : 2 - Math.abs(offset);

            return (
              <CardWrapper
                key={index}
                $offset={offset}
                $zIndex={zIndex}
                $isVisible={isVisible}
                onClick={() => handleCardClick(index)}
              >
                <Flashcard
                  id={card.id}
                  frontContent={card.frontContent}
                  backContent={card.backContent}
                  isLogoCard={card.isLogoCard}
                  onExpand={card.isLogoCard ? onExpandLogoCard : undefined}
                  onCollapse={card.isLogoCard ? onCollapseLogoCard : undefined}
                  isFlippable={index === currentIndex}
                  isFlipped={flippedCards[index]}
                  onFlip={() => handleFlip(index)}
                />
              </CardWrapper>
            );
          })}
        </CardStack>
        <ArrowButton className="left" onClick={handlePrev}>◂</ArrowButton>
        <ArrowButton className="right" onClick={handleNext}>▸</ArrowButton>
      </Container>
    </>
  );
};

export default FlashcardContainer; 