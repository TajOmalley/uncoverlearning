import React, { useState } from 'react';
import styled from 'styled-components';
import Chat from './components/Chat';
import DocumentUpload from './components/DocumentUpload';
import ExpandedLogoCard from './components/ExpandedLogoCard';
import logo from './assets/logo.png';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
  overflow: hidden;
`;

const App: React.FC = () => {
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [fileTitle, setFileTitle] = useState<string | null>(null);

  const handleCollapseLogoCard = () => {
    setIsChatExpanded(false);
  };

  return (
    <AppContainer>
      <ExpandedLogoCard 
        onCollapse={handleCollapseLogoCard} 
        logo={logo} 
        brandText="uncover learning" 
      />
      <DocumentUpload onUploadSuccess={(title) => setFileTitle(title)} />
      <Chat isOpen={isChatExpanded} onClose={handleCollapseLogoCard} fileTitle={fileTitle} />
    </AppContainer>
  );
};

export default App;
