const express = require('express');
const router = express.Router();
const {
    createTodo,
    getAllTodos,
    getTodo,
    updateTodo,
    deleteTodo
} = require('../controllers/todoController');
const auth = require('../middleware/auth');

// Add auth middleware to all routes
router.post('/todos', auth, createTodo);
router.get('/todos', auth, getAllTodos);
router.get('/todos/:id', auth, getTodo);
router.put('/todos/:id', auth, updateTodo);
router.delete('/todos/:id', auth, deleteTodo);

module.exports = router;