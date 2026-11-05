require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // local development: frontend runs on a different port
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Student Management API is running' });
});

app.use('/api/students', studentRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  testConnection();
});
