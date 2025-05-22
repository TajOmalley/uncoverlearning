import React, { useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import FlashcardContainer from './components/FlashcardContainer';
// import Chat from './components/Chat'; // Removed unused import
import ExpandedLogoCard from './components/ExpandedLogoCard';
import { FlashcardData } from './types';

// Import images
import logo from './assets/new-logo.png';
import magnusImage from './assets/team/magnus.jpg';
import henryImage from './assets/team/henry.jpg';
import tajImage from './assets/team/taj.jpg';

const riseIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const WelcomeBlock = styled.section`
  width: 100%;
  min-height: 90vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: relative;
  background: #f4f2ed;
  overflow: hidden;
  padding: 0 2vw;

  @media (max-width: 900px) {
    flex-direction: column;
    padding: 2rem 0;
    min-height: 70vh;
  }
`;

const LogoCircle = styled.div<{ visible?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 18px 18px 60px 60px / 18px 18px 80px 80px;
  width: clamp(400px, 40vw, 600px);
  height: clamp(600px, 60vh, 900px);
  margin-right: 4vw;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  border: 1.5px solid #e0e0e0;
  /* Basic horizontal lines, no shadow, skip first 3 lines */
  background-image:
    linear-gradient(to bottom, transparent 0%, #fff 80%, #fff 100%),
    repeating-linear-gradient(to bottom, #d3d3d3 0px, #d3d3d3 1px, transparent 1px, transparent 32px);
  background-size: 100% 100%, 100% 32px;
  background-repeat: no-repeat, repeat-y;
  background-position: 0 0, 0 96px;
  box-shadow: none;

  /* Wavy bottom and right edge and fade */
  clip-path: polygon(
    0% 0%,
    92% 0%,
    97% 5%,
    100% 10%,
    98% 20%,
    100% 30%,
    97% 40%,
    100% 50%,
    98% 60%,
    100% 70%,
    97% 80%,
    100% 90%,
    95% 92%,
    90% 98%,
    80% 100%,
    70% 97%,
    60% 99%,
    50% 98%,
    40% 100%,
    30% 97%,
    20% 99%,
    10% 95%,
    0% 90%,
    0% 0%
  );

  &::after {
    content: '';
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 40%;
    pointer-events: none;
    background: linear-gradient(to bottom, transparent 0%, #fff 80%, #fff 100%);
  }

  /* Hole punches */
  &::before, &::after {
    content: '';
    position: absolute;
    left: 10px;
    width: 22px;
    height: 22px;
    background: #111;
    border: 2.5px solid #d3d3d3;
    border-radius: 50%;
    z-index: 2;
    box-shadow: none;
  }
  &::before {
    top: 20%;
  }
  &::after {
    top: 80%;
  }

  /* Animation for rising into view */
  opacity: 0;
  transform: translateY(60px);
  transition: opacity 3.5s cubic-bezier(0.4,0.2,0.2,1), transform 3.5s cubic-bezier(0.4,0.2,0.2,1);
  ${({ visible }) => visible && `
    opacity: 1;
    transform: translateY(0);
  `}

  @media (max-width: 900px) {
    margin: 0 0 2rem 0;
    width: 98vw;
    min-width: 0;
    max-width: 100vw;
    height: clamp(400px, 60vw, 700px);
    &::before, &::after {
      left: 4px;
      width: 16px;
      height: 16px;
      background: #111;
      box-shadow: none;
    }
  }
`;

const AnimatedLogo = styled.img`
  width: 120%;
  height: 120%;
  object-fit: contain;
  background: none;
  border: none;
  display: block;
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: clip-path 0.3s ease;
  clip-path: polygon(0 0, 100% 0, 100% var(--reveal-height, 0%), 0 var(--reveal-height, 0%));
`;

const DrawingCanvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1000;
`;

const WelcomeContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  flex: 1;
  min-width: 0;
  max-width: 700px;
  @media (max-width: 900px) {
    align-items: center;
    text-align: center;
    width: 100%;
  }
`;

const WelcomeHeadline = styled.h1`
  font-family: 'Fraunces', serif;
  font-size: clamp(2.4rem, 5vw, 3.5rem);
  color: #000;
  font-weight: 700;
  margin: 0 0 0.7rem 0;
  opacity: 0;
  animation: ${riseIn} 1.2s cubic-bezier(0.4,0.2,0.2,1) forwards;
  max-width: 100%;
  white-space: nowrap;
  &:first-child {
    animation-delay: 0.2s;
  }
  &:nth-child(2) {
    animation-delay: 0.5s;
  }
`;

const WelcomeSubtext = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.35rem;
  color: #222;
  margin: 1.5rem 0 2.7rem 0;
  max-width: 600px;
  opacity: 0;
  animation: ${riseIn} 1.2s cubic-bezier(0.4,0.2,0.2,1) forwards;
  animation-delay: 1.1s;
`;

const CTAButton = styled.button`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.45rem;
  background: rgba(255,255,255,0.12);
  color: #000;
  border: none;
  border-radius: 30px;
  padding: 1.1rem 2.6rem;
  margin-bottom: 2.5rem;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(92, 106, 90, 0.12);
  transition: background 0.2s, transform 0.2s;
  opacity: 0;
  animation: ${riseIn} 1.2s cubic-bezier(0.4,0.2,0.2,1) forwards, ctaPulse 1.5s 2.8s infinite alternate;
  animation-delay: 1.4s, 2.8s;
  &:hover {
    background: rgba(255,255,255,0.22);
    transform: translateY(-2px) scale(1.04);
  }
  @keyframes ctaPulse {
    0% { box-shadow: 0 4px 16px rgba(92, 106, 90, 0.12); }
    100% { box-shadow: 0 8px 32px rgba(92, 106, 90, 0.18); }
  }
`;

const AppContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #ffffff;
  overflow: hidden;
`;

const CTAText = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-weight: 400;
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  color: #000;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
  margin-top: 1rem;
  text-align: center;

  &:hover {
    transform: translateY(-4px);
    opacity: 0.8;
  }
`;

const LogoImage = styled.img`
  width: clamp(250px, 30vw, 400px);
  height: auto;
  margin-bottom: 2rem;
  margin-top: -6rem;
`;

const GreenBrand = styled.span`
  display: block;
  font-family: 'Fraunces', serif;
  font-size: clamp(2.5rem, 6vw, 4.2rem);
  color: #3ca06b;
  font-weight: 700;
  margin: 0.7rem 0 0.7rem 0;
  opacity: 0;
  animation: ${riseIn} 1.2s cubic-bezier(0.4,0.2,0.2,1) forwards;
  animation-delay: 0.8s;
`;

const App: React.FC = () => {
  const [isLogoCardExpanded, setIsLogoCardExpanded] = useState(false);
  const logoRef = useRef<HTMLImageElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  React.useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  // Set the CSS variable for clip-path
  React.useEffect(() => {
    if (logoRef.current) {
      logoRef.current.style.setProperty('--reveal-height', `${mousePosition.y}%`);
    }
  }, [mousePosition]);

  const handleExpandLogoCard = () => {
    setIsLogoCardExpanded(true);
  };

  const handleCollapseLogoCard = () => {
    setIsLogoCardExpanded(false);
  };

  const cards: FlashcardData[] = [
    {
      id: 'logo',
      isLogoCard: true,
      frontContent: (
        <>
          <LogoImage src={logo} alt="Logo" />
          <CTAText>click to uncover our AI textbook tutor and teaching assistant</CTAText>
        </>
      ),
      backContent: null
    },
    {
      id: 'problem',
      frontContent: (
        <>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', color: '#5c6a5a', marginBottom: '1.5rem' }}>
            the problem
          </h3>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem', color: '#000', marginBottom: '1.5rem' }}>
            College textbooks are expensive, hard to understand, and often go unused.
          </p>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: '3rem', color: '#5c6a5a', marginBottom: '0.5rem' }}>$400</h4>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1rem', color: '#000' }}>Average textbook cost</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: '3rem', color: '#5c6a5a', marginBottom: '0.5rem' }}>65%</h4>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1rem', color: '#000' }}>Students who skip buying</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: '3rem', color: '#5c6a5a', marginBottom: '0.5rem' }}>40%</h4>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1rem', color: '#000' }}>Textbooks never opened</p>
            </div>
          </div>
        </>
      ),
      backContent: (
        <>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', color: '#5c6a5a', marginBottom: '1.5rem' }}>
            the impact
          </h3>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem', color: '#000', marginBottom: '1.5rem' }}>
            This creates a significant barrier to learning and success for students.
          </p>
          <ul style={{ 
            fontFamily: 'Montserrat, sans-serif', 
            fontSize: '1.25rem', 
            color: '#000',
            listStyle: 'none',
            padding: 0,
            marginTop: '2rem'
          }}>
            <li style={{ marginBottom: '1rem' }}>• Students struggle to understand complex concepts</li>
            <li style={{ marginBottom: '1rem' }}>• Grades suffer due to lack of resources</li>
            <li style={{ marginBottom: '1rem' }}>• Financial burden affects mental health</li>
            <li style={{ marginBottom: '1rem' }}>• Learning becomes a source of stress</li>
          </ul>
        </>
      )
    },
    {
      id: 'solution',
      frontContent: (
        <>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', color: '#5c6a5a', marginBottom: '1.5rem' }}>
            the solution
          </h3>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem', color: '#000', marginBottom: '1.5rem' }}>
            We're building an AI-powered platform that makes textbooks more accessible and engaging.
          </p>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.5rem',
            marginTop: '2rem',
            maxWidth: '600px'
          }}>
            <div>
              <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.5rem', color: '#5c6a5a', marginBottom: '0.5rem' }}>
                Chat with Your Textbook
              </h4>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.25rem', color: '#000' }}>
                Ask questions and get instant, accurate answers from your textbook content.
              </p>
            </div>
            <div>
              <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.5rem', color: '#5c6a5a', marginBottom: '0.5rem' }}>
                Personalized Learning
              </h4>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.25rem', color: '#000' }}>
                Get explanations tailored to your learning style and pace.
              </p>
            </div>
            <div>
              <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.5rem', color: '#5c6a5a', marginBottom: '0.5rem' }}>
                Affordable Access
              </h4>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.25rem', color: '#000' }}>
                Pay a fraction of the cost of traditional textbooks.
              </p>
            </div>
          </div>
        </>
      ),
      backContent: (
        <>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', color: '#5c6a5a', marginBottom: '1.5rem' }}>
            how it works
          </h3>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem', color: '#000', marginBottom: '1.5rem' }}>
            Our platform uses advanced AI to make learning more interactive and effective.
          </p>
          <ol style={{ 
            fontFamily: 'Montserrat, sans-serif', 
            fontSize: '1.25rem', 
            color: '#000',
            paddingLeft: '1.5rem',
            marginTop: '2rem'
          }}>
            <li style={{ marginBottom: '1rem' }}>Upload your textbook or select from our library</li>
            <li style={{ marginBottom: '1rem' }}>Chat with the AI to understand concepts</li>
            <li style={{ marginBottom: '1rem' }}>Get personalized explanations and examples</li>
            <li style={{ marginBottom: '1rem' }}>Track your progress and understanding</li>
          </ol>
        </>
      )
    },
    {
      id: 'mission',
      frontContent: (
        <>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', color: '#5c6a5a', marginBottom: '1.5rem' }}>
            our mission
          </h3>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem', color: '#000', marginBottom: '1.5rem' }}>
            To make quality education accessible to everyone through technology.
          </p>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.5rem',
            marginTop: '2rem',
            maxWidth: '600px'
          }}>
            <div>
              <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.5rem', color: '#5c6a5a', marginBottom: '0.5rem' }}>
                Democratize Learning
              </h4>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.25rem', color: '#000' }}>
                Break down barriers to education through affordable technology.
              </p>
            </div>
            <div>
              <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.5rem', color: '#5c6a5a', marginBottom: '0.5rem' }}>
                Enhance Understanding
              </h4>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.25rem', color: '#000' }}>
                Make complex concepts accessible through AI-powered explanations.
              </p>
            </div>
            <div>
              <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.5rem', color: '#5c6a5a', marginBottom: '0.5rem' }}>
                Support Success
              </h4>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.25rem', color: '#000' }}>
                Help students achieve their academic goals through better learning tools.
              </p>
            </div>
          </div>
        </>
      ),
      backContent: (
        <>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', color: '#5c6a5a', marginBottom: '1.5rem' }}>
            our values
          </h3>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem', color: '#000', marginBottom: '1.5rem' }}>
            We believe in creating a more equitable and effective learning environment.
          </p>
          <ul style={{ 
            fontFamily: 'Montserrat, sans-serif', 
            fontSize: '1.25rem', 
            color: '#000',
            listStyle: 'none',
            padding: 0,
            marginTop: '2rem'
          }}>
            <li style={{ marginBottom: '1rem' }}>• Accessibility for all students</li>
            <li style={{ marginBottom: '1rem' }}>• Quality education at affordable prices</li>
            <li style={{ marginBottom: '1rem' }}>• Innovation in learning technology</li>
            <li style={{ marginBottom: '1rem' }}>• Student success and well-being</li>
          </ul>
        </>
      )
    },
    {
      id: 'team',
      frontContent: (
        <>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', color: '#5c6a5a', marginBottom: '1.5rem' }}>
            our team
          </h3>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem', color: '#000', marginBottom: '1.5rem' }}>
            Meet the founders behind Uncover Learning.
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '2rem',
            marginTop: '2rem',
            maxWidth: '1000px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <img 
                src={tajImage}
                alt="Taj O'Malley" 
                style={{ 
                  width: '200px', 
                  height: '200px', 
                  borderRadius: '50%',
                  marginBottom: '1rem',
                  objectFit: 'cover'
                }} 
              />
              <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.5rem', color: '#5c6a5a', marginBottom: '0.5rem' }}>
                Taj O'Malley
              </h4>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1rem', color: '#000' }}>
                Principal Co-Founder
              </p>
              <a 
                href="https://www.linkedin.com/in/taj-o-malley-94776a239/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '1rem',
                  color: '#5c6a5a',
                  textDecoration: 'none',
                  display: 'inline-block',
                  marginTop: '0.5rem'
                }}
              >
                LinkedIn
              </a>
            </div>
            <div style={{ textAlign: 'center' }}>
              <img 
                src={henryImage}
                alt="Henry Dicks" 
                style={{ 
                  width: '200px', 
                  height: '200px', 
                  borderRadius: '50%',
                  marginBottom: '1rem',
                  objectFit: 'cover'
                }} 
              />
              <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.5rem', color: '#5c6a5a', marginBottom: '0.5rem' }}>
                Henry Dicks
              </h4>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1rem', color: '#000' }}>
                Operational Co-Founder
              </p>
              <a 
                href="https://www.linkedin.com/in/henry-dicks/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '1rem',
                  color: '#5c6a5a',
                  textDecoration: 'none',
                  display: 'inline-block',
                  marginTop: '0.5rem'
                }}
              >
                LinkedIn
              </a>
            </div>
            <div style={{ textAlign: 'center' }}>
              <img 
                src={magnusImage}
                alt="Magnus Graham" 
                style={{ 
                  width: '200px', 
                  height: '200px', 
                  borderRadius: '50%',
                  marginBottom: '1rem',
                  objectFit: 'cover'
                }} 
              />
              <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.5rem', color: '#5c6a5a', marginBottom: '0.5rem' }}>
                Magnus Graham
              </h4>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1rem', color: '#000' }}>
                Technical Co-Founder
              </p>
              <a 
                href="https://www.linkedin.com/in/magnus-graham/" 
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '1rem',
                  color: '#5c6a5a',
                  textDecoration: 'none',
                  display: 'inline-block',
                  marginTop: '0.5rem'
                }}
              >
                LinkedIn
              </a>
            </div>
          </div>
        </>
      ),
      backContent: (
        <>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', color: '#5c6a5a', marginBottom: '1.5rem' }}>
            our story
          </h3>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem', color: '#000', marginBottom: '1.5rem' }}>
            We started Uncover Learning to solve the problems we faced as students.
          </p>
          <div style={{ 
            fontFamily: 'Montserrat, sans-serif', 
            fontSize: '1.25rem', 
            color: '#000',
            marginTop: '2rem',
            maxWidth: '600px'
          }}>
            <p style={{ marginBottom: '1rem' }}>
              As former students, we experienced firsthand the challenges of expensive textbooks and complex learning materials. We saw how these barriers affected not just our own education, but that of our peers as well.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              With backgrounds in technology and education, we set out to create a solution that would make learning more accessible, engaging, and effective for everyone.
            </p>
            <p>
              Today, we're building the future of education technology, one that puts students first and makes quality learning accessible to all.
            </p>
          </div>
        </>
      )
    },
    {
      id: 'contact',
      frontContent: (
        <>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', color: '#5c6a5a', marginBottom: '1.5rem' }}>
            get in touch
          </h3>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem', color: '#000', marginBottom: '1.5rem' }}>
            Join us in revolutionizing education.
          </p>
          <form style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem',
            marginTop: '2rem',
            maxWidth: '400px'
          }}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              style={{ 
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '1rem',
                padding: '0.75rem',
                border: '1px solid #5c6a5a',
                borderRadius: '6px',
                outline: 'none'
              }}
            />
            <button 
              type="submit"
              style={{ 
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '1rem',
                padding: '0.75rem',
                backgroundColor: '#5c6a5a',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Subscribe
            </button>
          </form>
        </>
      ),
      backContent: (
        <>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', color: '#5c6a5a', marginBottom: '1.5rem' }}>
            stay updated
          </h3>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem', color: '#000', marginBottom: '1.5rem' }}>
            Be the first to know about our launch and updates.
          </p>
          <div style={{ 
            fontFamily: 'Montserrat, sans-serif', 
            fontSize: '1.25rem', 
            color: '#000',
            marginTop: '2rem',
            maxWidth: '600px'
          }}>
            <p style={{ marginBottom: '1rem' }}>
              We're working hard to bring Uncover Learning to students everywhere. Subscribe to our newsletter to:
            </p>
            <ul style={{ 
              listStyle: 'none',
              padding: 0,
              marginBottom: '2rem'
            }}>
              <li style={{ marginBottom: '0.5rem' }}>• Get early access to our platform</li>
              <li style={{ marginBottom: '0.5rem' }}>• Receive exclusive launch offers</li>
              <li style={{ marginBottom: '0.5rem' }}>• Stay updated on our progress</li>
              <li style={{ marginBottom: '0.5rem' }}>• Join our community of learners</li>
            </ul>
            <p>
              Together, we can make education more accessible and effective for everyone.
            </p>
          </div>
        </>
      )
    }
  ];

  return (
    <AppContainer>
      <DrawingCanvas />
      <WelcomeBlock>
        <LogoCircle visible={true}>
          <AnimatedLogo ref={logoRef} src={logo} alt="Logo" style={{ '--reveal-height': `${mousePosition.y}%` } as React.CSSProperties} />
        </LogoCircle>
        <WelcomeContent>
          <WelcomeHeadline>welcome to the</WelcomeHeadline>
          <WelcomeHeadline>future of college education</WelcomeHeadline>
          <GreenBrand>uncover learning</GreenBrand>
          <WelcomeSubtext>
            Personalized college studying and teaching tools based directly on open source course materials
          </WelcomeSubtext>
          <CTAButton onClick={handleExpandLogoCard}>scroll to uncover your first lesson</CTAButton>
        </WelcomeContent>
      </WelcomeBlock>
      <FlashcardContainer
        cards={cards}
        onExpandLogoCard={handleExpandLogoCard}
        onCollapseLogoCard={handleCollapseLogoCard}
      />
      {isLogoCardExpanded && (
        <ExpandedLogoCard 
          onCollapse={handleCollapseLogoCard}
          logo={logo}
          brandText="uncover learning"
        />
      )}
    </AppContainer>
  );
};

export default App;
