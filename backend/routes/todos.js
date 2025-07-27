const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// In-memory todo storage (in production, use a database)
let todos = [
  { id: 1, userId: 1, title: 'Sample Todo', description: 'This is a sample todo', completed: false, createdAt: new Date() },
  { id: 2, userId: 1, title: 'Another Todo', description: 'Another sample todo', completed: true, createdAt: new Date() }
];
let nextId = 3;

// Get all todos for authenticated user
router.get('/', authenticateToken, (req, res) => {
  try {
    const userTodos = todos.filter(todo => todo.userId === req.user.id);
    res.json(userTodos);
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new todo
router.post('/', authenticateToken, (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const newTodo = {
      id: nextId++,
      userId: req.user.id,
      title,
      description: description || '',
      completed: false,
      createdAt: new Date()
    };

    todos.push(newTodo);
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update todo
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const todoId = parseInt(req.params.id);
    const { title, description, completed } = req.body;

    const todoIndex = todos.findIndex(todo => todo.id === todoId && todo.userId === req.user.id);
    
    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    if (title !== undefined) todos[todoIndex].title = title;
    if (description !== undefined) todos[todoIndex].description = description;
    if (completed !== undefined) todos[todoIndex].completed = completed;

    res.json(todos[todoIndex]);
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete todo
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const todoId = parseInt(req.params.id);
    const todoIndex = todos.findIndex(todo => todo.id === todoId && todo.userId === req.user.id);

    if (todoIndex === -1) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    todos.splice(todoIndex, 1);
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;