import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const ChatContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: min(90vw, 400px);
  height: min(80vh, 600px);
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    width: 95vw;
    height: 90vh;
    bottom: 1rem;
    right: 1rem;
  }
`;

const ChatHeader = styled.div`
  padding: 1rem;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatTitle = styled.h2`
  margin: 0;
  font-size: clamp(1rem, 2vw, 1.5rem);
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0.5rem;
  transition: color 0.2s ease;

  &:hover {
    color: #333;
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Message = styled.div<{ $isUser: boolean }>`
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 15px;
  background: ${props => props.$isUser ? '#007bff' : '#f0f0f0'};
  color: ${props => props.$isUser ? 'white' : '#333'};
  align-self: ${props => props.$isUser ? 'flex-end' : 'flex-start'};
  word-wrap: break-word;
  overflow-wrap: break-word;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
`;

const ChatInput = styled.div`
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 0.5rem;
  background: white;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: #007bff;
  }
`;

const SendButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  transition: background-color 0.2s ease;

  &:hover {
    background: #0056b3;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const UploadButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  transition: background-color 0.2s ease;

  &:hover {
    background: #218838;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const UploadStatus = styled.div`
  padding: 0.5rem;
  margin: 0.5rem;
  border-radius: 10px;
  background: #f8f9fa;
  font-size: clamp(0.75rem, 1.2vw, 0.875rem);
  color: #666;
  text-align: center;
`;

interface ChatProps {
  onClose: () => void;
}

const Chat: React.FC<ChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      setMessages([...messages, { text: inputValue, isUser: true }]);
      setInputValue('');
      // Here you would typically send the message to your backend
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Here you would typically upload the file to your backend
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>Chat with AI</ChatTitle>
        <CloseButton onClick={onClose}>&times;</CloseButton>
      </ChatHeader>
      <ChatMessages>
        {messages.map((message, index) => (
          <Message key={index} $isUser={message.isUser}>
            {message.text}
          </Message>
        ))}
        {uploadedFile && (
          <UploadStatus>
            Uploaded: {uploadedFile.name}
          </UploadStatus>
        )}
        <div ref={messagesEndRef} />
      </ChatMessages>
      <ChatInput>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
        />
        <UploadButton onClick={triggerFileInput}>
          Upload
        </UploadButton>
        <FileInput
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx,.txt"
        />
        <SendButton onClick={handleSend} disabled={!inputValue.trim()}>
          Send
        </SendButton>
      </ChatInput>
    </ChatContainer>
  );
};

export default Chat; 