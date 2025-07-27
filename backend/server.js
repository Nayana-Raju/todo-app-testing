const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS SETUP (fix here) ---
app.use(cors({
  origin: 'http://localhost:3000', // or your deployed frontend URL
  credentials: true
}));


// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Todo API Server is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /api/auth/login': 'User login',
      'GET /api/todos': 'Get user todos',
      'POST /api/todos': 'Create todo',
      'PUT /api/todos/:id': 'Update todo',
      'DELETE /api/todos/:id': 'Delete todo'
    }
  });
});

// Root endpoint for basic info
app.get('/', (req, res) => {
  res.json({
    message: 'Todo API Server',
    version: '1.0.0',
    status: 'Running',
    documentation: 'This is a REST API server. Use /api/health for health check.',
    frontend: 'Access the application at http://localhost:3000'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'POST /api/auth/login',
      'GET /api/todos',
      'POST /api/todos',
      'PUT /api/todos/:id',
      'DELETE /api/todos/:id'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Todo API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Frontend should run on: http://localhost:3000`);
});

module.exports = app;