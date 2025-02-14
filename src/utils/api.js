const API_BASE_URL = 'http://localhost:5000/api';

export const fetchChatFlow = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/chatflow`);
    if (!response.ok) throw new Error('Failed to fetch chat flow');
    return await response.json();
  } catch (error) {
    console.error('Error fetching chat flow:', error);
    throw error;
  }
};
