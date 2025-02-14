import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

function Message({ type, text }) {
  const isUser = type === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`message-container d-flex ${isUser ? 'justify-content-end' : 'justify-content-start'} mb-3`}
    >
      <div className={`message p-2 rounded ${isUser ? 'bg-primary text-white' : 'bg-light'}`}>
        {text}
      </div>
    </motion.div>
  );
}

Message.propTypes = {
  type: PropTypes.oneOf(['assistant', 'user']),
  text: PropTypes.string.isRequired
};

Message.defaultProps = {
  type: 'user'
};

export default Message;
