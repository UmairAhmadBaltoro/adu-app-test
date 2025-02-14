const express = require('express');
const cors = require('cors');
const chatflowApi = require('./api/chatflow');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/chatflow', chatflowApi);

// Catch-all route for unknown endpoints
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
