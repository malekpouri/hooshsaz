const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'HooshSaz API is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// TODO: Import and use auth and chat routes
// const authRoutes = require('./routes/auth.routes');
// app.use('/api/auth', authRoutes);

module.exports = app;
