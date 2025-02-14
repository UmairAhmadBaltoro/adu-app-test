import React from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import Message from './Message';
import UserInput from './UserInput';
import useChat from '../hooks/useChat';

function Chat() {
  const { messages, handleUserMessage, isLoading, isInitializing, options, responseType } = useChat();

  if (isInitializing) {
    return (
      <Container fluid className="h-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid className="h-100">
      <div className="chat-container h-100 d-flex flex-column border rounded">
        <div className="chat-messages flex-grow-1 overflow-auto p-3" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          {messages.map((msg, idx) => (
            <Message 
              key={idx} 
              type={msg.type || 'assistant'} 
              text={typeof msg.message === 'string' ? msg.message : msg.text || ''} 
            />
          ))}
        </div>
        <div className="chat-input border-top p-3">
          <UserInput 
            onSend={handleUserMessage} 
            options={options} 
            isLoading={isLoading}
            responseType={responseType}
          />
        </div>
      </div>
    </Container>
  );
}

export default Chat;
