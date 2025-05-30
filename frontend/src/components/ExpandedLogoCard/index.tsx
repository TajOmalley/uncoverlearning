import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Chat from '../Chat';
import { uploadDocument } from '../../services/api';

interface ExpandedLogoCardProps {
  onCollapse: () => void;
  logo: string;
  brandText: string;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2000;
  background: rgba(255,255,255,0.98);
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.3s;
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 2rem 1rem 2rem;
  border-bottom: 1px solid #eee;
`;

const Logo = styled.img`
  width: 120px;
  height: auto;
`;

const Brand = styled.h1`
  font-family: 'Fraunces', serif;
  font-size: 2rem;
  color: #5c6a5a;
  font-weight: 600;
  margin: 0;
`;

const Main = styled.div`
  flex: 1;
  display: flex;
  height: calc(100vh - 80px);
`;

const PdfPanel = styled.div`
  flex: 0 0 60%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
  border-right: 1px solid #eee;
  position: relative;
`;

const UploadButton = styled.label`
  display: inline-block;
  padding: 1.25rem 2.5rem;
  background: #5c6a5a;
  color: #fff;
  border-radius: 8px;
  font-size: 1.25rem;
  font-family: 'Montserrat', sans-serif;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #4a5649; }
`;

const ErrorContainer = styled.div`
  margin-top: 1rem;
  color: #d32f2f;
  font-family: 'Montserrat', sans-serif;
  max-width: 400px;
  text-align: center;
`;

const StatusContainer = styled.div`
  margin-top: 1rem;
  color: #5c6a5a;
  font-family: 'Montserrat', sans-serif;
  max-width: 400px;
  text-align: center;
`;

const PdfIframe = styled.iframe`
  width: 100%;
  height: 90vh;
  border: none;
  background: #fff;
`;

const ChatPanel = styled.div`
  flex: 0 0 40%;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
`;

const HiddenInput = styled.input`
  display: none;
`;

// Set maximum file size to 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
const MAX_FILE_SIZE_MB = MAX_FILE_SIZE / (1024 * 1024);

const ExpandedLogoCard: React.FC<ExpandedLogoCardProps> = ({ onCollapse, logo, brandText }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileTitle, setFileTitle] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Prevent background scroll when overlay is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalStyle; };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Reset states
    setUploadError(null);
    setUploadStatus(null);
    
    const file = e.target.files?.[0];
    
    // Validate file is present
    if (!file) {
      setUploadError('No file selected.');
      return;
    }
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are allowed.');
      return;
    }
    
    // Validate file size (limit to 50MB for this component's initial check)
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
      return;
    }
    
    // Create object URL for preview
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    setUploadStatus('Uploading document... This may take a moment.');
    setIsUploading(true);
    
    try {
      console.log('Uploading document:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
      // uploadDocument from api.ts will handle chunking for files > 10MB
      const result = await uploadDocument(file, file.name);
      console.log('Upload result:', result);
      
      setFileTitle(file.name);
      setUploadStatus('Document uploaded and processing started! You can now ask questions about it.');
      setIsUploading(false);
    } catch (err: any) {
      console.error('Upload error:', err);
      setIsUploading(false);
      
      let errorMessage = 'Failed to upload document: Unknown error.';
      
      if (err.response) {
        console.error('Server response:', err.response.data);
        if (err.response.status === 413) {
          // This error might still come from the direct upload endpoint if a file > 10MB somehow bypassed the api.ts chunking logic,
          // or if the chunking itself has an issue. The message in api.ts is more user-friendly for this.
          errorMessage = `File is too large for the server to process directly. Chunked upload might be attempted or a smaller file (under 10MB for direct, or check chunking limits).`;
        } else if (err.response.status === 401 || err.response.status === 403) {
          errorMessage = 'Not authorized to upload files.';
        } else if (err.response.status >= 500) {
          if (err.response.data && err.response.data.detail) {
            errorMessage = `Server Error: ${err.response.data.detail}`;
          } else {
            errorMessage = 'Server error occurred. Please try again later.';
          }
        } else {
          errorMessage = `Upload failed: ${err.response.data?.detail || err.response.statusText || 'Unknown error'}`;
        }
      } else if (err.request) {
        console.error('No response received:', err.request);
        errorMessage = 'No response from server. Please check your connection and try again.';
      } else {
        console.error('Error setting up request:', err.message);
        errorMessage = `Error: ${err.message}`;
      }
      
      setUploadError(errorMessage);
    }
  };

  return (
    <Overlay>
      <Header>
        <Logo src={logo} alt="Logo" />
      </Header>
      <Main>
        <PdfPanel>
          <UploadButton htmlFor="pdf-upload">
            Upload PDF
          </UploadButton>
          <HiddenInput
            ref={fileInputRef}
            type="file"
            id="pdf-upload"
            accept=".pdf"
            onChange={handleFileChange}
          />
          {uploadError && <ErrorContainer>{uploadError}</ErrorContainer>}
          {uploadStatus && <StatusContainer>{uploadStatus}</StatusContainer>}
          {pdfUrl && <PdfIframe src={pdfUrl} title="PDF Preview" />}
        </PdfPanel>
        <ChatPanel>
          <Chat isOpen={true} onClose={onCollapse} fileTitle={fileTitle} />
        </ChatPanel>
      </Main>
    </Overlay>
  );
};

export default ExpandedLogoCard; 