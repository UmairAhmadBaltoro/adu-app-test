import React, { useState } from 'react';
import { Form, Button, InputGroup, FormControl, ButtonGroup } from 'react-bootstrap';
import { motion } from 'framer-motion';

function UserInput({ onSend, options = [], isLoading = false, responseType = 'text' }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  const handleOptionClick = (option) => {
    onSend(option);
  };

  const getQuickReplyButtons = () => {
    if (options.length === 0) return null;

    const isYesNo = options.length === 2 && 
      options.every(opt => ['YES', 'NO'].includes(opt.toUpperCase()));
    
    const isSpecificChoices = options.some(opt => 
      ['maximize', 'specific', 'dimensions', 'structures'].includes(opt.toLowerCase())
    );

    if (isYesNo) {
      return (
        <ButtonGroup className="w-100">
          <motion.div whileHover={{ scale: 1.05 }} className="w-50">
            <Button
              variant="outline-success"
              onClick={() => handleOptionClick('YES')}
              className="w-100"
            >
              Yes
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="w-50">
            <Button
              variant="outline-danger"
              onClick={() => handleOptionClick('NO')}
              className="w-100"
            >
              No
            </Button>
          </motion.div>
        </ButtonGroup>
      );
    }

    if (isSpecificChoices) {
      return (
        <div className="d-grid gap-2">
          {options.map((option, index) => (
            <motion.div key={index} whileHover={{ scale: 1.02 }}>
              <Button
                variant="outline-primary"
                onClick={() => handleOptionClick(option)}
                className="w-100 text-start"
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Button>
            </motion.div>
          ))}
        </div>
      );
    }

    return (
      <div className="d-grid gap-2">
        {options.map((option, index) => (
          <motion.div key={index} whileHover={{ scale: 1.02 }}>
            <Button
              variant="outline-secondary"
              onClick={() => handleOptionClick(option)}
              className="w-100 text-start"
              size="sm"
            >
              {option}
            </Button>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="user-input-container">
      {responseType === 'buttons' && options.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3"
        >
          {getQuickReplyButtons()}
        </motion.div>
      )}
      
      {responseType === 'text' && (
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <FormControl
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
            />
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button 
                type="submit" 
                variant="primary"
                disabled={isLoading || !message.trim()}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </Button>
            </motion.div>
          </InputGroup>
        </Form>
      )}
    </div>
  );
}

export default UserInput;
