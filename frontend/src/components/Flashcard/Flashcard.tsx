import React, { useState } from 'react';
import styled from 'styled-components';

interface FlashcardProps {
  id: string;
  frontContent: React.ReactNode;
  backContent: React.ReactNode | null;
  isLogoCard?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
  isFlippable?: boolean;
  isFlipped?: boolean;
  onFlip?: () => void;
}

const Card = styled.div<{ $isFlipped: boolean; $isFlippable: boolean }>`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
  transform: ${props => props.$isFlipped ? 'rotateY(180deg)' : 'rotateY(0)'};
  cursor: ${props => props.$isFlippable ? 'pointer' : 'default'};
`;

const CardFace = styled.div<{ $isBack?: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: ${props => props.$isBack ? 'rotateY(180deg)' : 'rotateY(0)'};
  overflow: hidden;
`;

const ContentWrapper = styled.div<{ $isVisible: boolean }>`
  opacity: ${props => props.$isVisible ? 1 : 0};
  transition: opacity 0.3s ease;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow: auto;

  /* Make images responsive */
  img {
    max-width: 100%;
    height: auto;
    object-fit: contain;
  }

  /* Make text responsive */
  p, h1, h2, h3, h4, h5, h6 {
    width: 100%;
    text-align: center;
    margin: 0.5rem 0;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  /* Make lists responsive */
  ul, ol {
    width: 100%;
    padding: 0 1rem;
    margin: 0.5rem 0;
  }

  /* Make tables responsive */
  table {
    width: 100%;
    max-width: 100%;
    border-collapse: collapse;
    margin: 0.5rem 0;
  }

  /* Make code blocks responsive */
  pre, code {
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  /* Make buttons and interactive elements responsive */
  button, a {
    max-width: 100%;
    white-space: normal;
    word-wrap: break-word;
  }

  /* Make flex containers responsive */
  .flex-container {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  /* Make grid containers responsive */
  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    width: 100%;
  }
`;

const Flashcard: React.FC<FlashcardProps> = ({
  frontContent,
  backContent,
  isLogoCard,
  onExpand,
  onCollapse,
  isFlippable = true,
  isFlipped: controlledIsFlipped,
  onFlip
}) => {
  const [internalIsFlipped, setInternalIsFlipped] = useState(false);
  
  // Use controlled or uncontrolled flipping
  const isFlipped = controlledIsFlipped !== undefined ? controlledIsFlipped : internalIsFlipped;

  const handleClick = () => {
    if (!isFlippable) return;
    
    if (isLogoCard) {
      if (isFlipped) {
        onCollapse?.();
      } else {
        onExpand?.();
      }
    } else {
      if (onFlip) {
        onFlip();
      } else {
        setInternalIsFlipped(!internalIsFlipped);
      }
    }
  };

  return (
    <Card $isFlipped={isFlipped} $isFlippable={isFlippable} onClick={handleClick}>
      <CardFace>
        <ContentWrapper $isVisible={isFlippable}>
          {frontContent}
        </ContentWrapper>
      </CardFace>
      {backContent && (
        <CardFace $isBack>
          <ContentWrapper $isVisible={isFlippable}>
            {backContent}
          </ContentWrapper>
        </CardFace>
      )}
    </Card>
  );
};

export default Flashcard; 