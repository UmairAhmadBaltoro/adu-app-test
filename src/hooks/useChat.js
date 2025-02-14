import { useState, useEffect } from 'react';
import { fetchChatFlow } from '../utils/api';

export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatFlow, setChatFlow] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeChatFlow = async () => {
      try {
        const flow = await fetchChatFlow();
        setChatFlow(flow);
        // Initialize with first message
        const firstMessage = flow.find(m => m.id === 1);
        if (firstMessage) {
          setMessages([{ message: firstMessage.message, type: 'assistant' }]);
          setCurrentId(1);
        }
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeChatFlow();
  }, []);

  const getCurrentNode = () => {
    return chatFlow.find(m => m.id === currentId);
  };

  const getCurrentOptions = () => {
    const currentNode = getCurrentNode();
    return currentNode?.options?.map(opt => opt.response) || [];
  };

  const getCurrentResponseType = () => {
    const currentNode = getCurrentNode();
    return currentNode?.responseType || 'text';
  };

  const handleUserMessage = (userInput) => {
    const userMessage = { message: userInput, type: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const currentNode = getCurrentNode();
    if (currentNode && currentNode.options) {
      const foundOption = currentNode.options.find(opt => 
        opt.response.toLowerCase() === userInput.toLowerCase()
      );
      if (foundOption) {
        setTimeout(() => {
          const nextId = parseInt(foundOption.next, 10);
          goToNext(nextId);
          setIsLoading(false);
        }, 1000);
        return;
      }
    }

    if (currentNode && currentNode.next) {
      setTimeout(() => {
        const nextId = typeof currentNode.next === 'string' 
          ? parseInt(currentNode.next, 10) 
          : currentNode.next;
        goToNext(nextId);
        setIsLoading(false);
      }, 1000);
    } else {
      setIsLoading(false);
    }
  };

  const goToNext = (nextId) => {
    if (!nextId) return;
    const nextNode = chatFlow.find(m => m.id === nextId);
    if (nextNode) {
      setMessages((prev) => [...prev, {
        message: nextNode.message,
        type: 'assistant'
      }]);
      setCurrentId(nextId);

      // Auto-advance if response type is 'auto'
      if (nextNode.responseType === 'auto' && nextNode.next) {
        setTimeout(() => {
          const nextIdAuto = typeof nextNode.next === 'string' 
            ? parseInt(nextNode.next, 10) 
            : nextNode.next;
          goToNext(nextIdAuto);
        }, 2000);
      }
    }
  };

  return { 
    messages, 
    handleUserMessage, 
    isLoading,
    isInitializing,
    options: getCurrentOptions(),
    responseType: getCurrentResponseType()
  };
}