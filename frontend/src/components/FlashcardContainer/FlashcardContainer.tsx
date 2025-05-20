import React, { useState, useEffect } from 'react';
import Flashcard from '../Flashcard/Flashcard';
import './FlashcardContainer.css';

const FlashcardContainer: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<boolean[]>(Array(3).fill(false));

  useEffect(() => {
    console.log('FlashcardContainer mounted');
  }, []);

  const handleFlip = (index: number) => {
    console.log('Flipping card:', index);
    const newFlippedCards = [...flippedCards];
    newFlippedCards[index] = !newFlippedCards[index];
    setFlippedCards(newFlippedCards);
  };

  const handleNext = () => {
    console.log('Next card');
    setCurrentIndex((prevIndex) => (prevIndex + 1) % 3);
  };

  const handlePrev = () => {
    console.log('Previous card');
    setCurrentIndex((prevIndex) => (prevIndex - 1 + 3) % 3);
  };

  return (
    <div className="flashcard-container">
      <div className="flashcard-stack">
        {[0, 1, 2].map((index) => {
          const isVisible = index === currentIndex || index === (currentIndex + 1) % 3 || index === (currentIndex + 2) % 3;
          const style = {
            transform: `translateX(${(index - currentIndex) * 20}px)`,
            zIndex: index === currentIndex ? 3 : 2 - Math.abs(index - currentIndex),
            opacity: isVisible ? 1 : 0,
            transition: 'transform 0.3s ease, opacity 0.3s ease',
          };
          return (
            <div key={index} className="flashcard-wrapper" style={style}>
              <Flashcard
                id={`card-${index}`}
                isFlipped={flippedCards[index]}
                onFlip={() => handleFlip(index)}
                frontContent={<div>Card {index + 1} Front</div>}
                backContent={<div>Card {index + 1} Back</div>}
              />
            </div>
          );
        })}
      </div>
      <button className="arrow-button left" onClick={handlePrev}>←</button>
      <button className="arrow-button right" onClick={handleNext}>→</button>
    </div>
  );
};

export default FlashcardContainer; 