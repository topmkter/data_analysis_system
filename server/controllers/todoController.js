const Todo = require('../models/Todo');

exports.createTodo = async (req, res) => {
    try {
        const { title, content } = req.body;
        const todo = await Todo.create({ title, content, userId: req.user.id });
        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create todo.', error: error.message });
    }
};

exports.getTodos = async (req, res) => {
    try {
        const todos = await Todo.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
        res.status(200).json(todos);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch todos.', error: error.message });
    }
};

exports.updateTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, status } = req.body;
        const [updated] = await Todo.update({ title, content, status }, { where: { id, userId: req.user.id } });
        if (updated) {
            const updatedTodo = await Todo.findOne({ where: { id } });
            res.status(200).json(updatedTodo);
        } else {
            res.status(404).json({ message: 'Todo not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to update todo.', error: error.message });
    }
};

exports.deleteTodo = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Todo.destroy({ where: { id, userId: req.user.id } });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Todo not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete todo.', error: error.message });
    }
};