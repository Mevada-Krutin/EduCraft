const express = require('express');
const Category = require('../models/Category');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/categories
// @desc    Create a category
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    const { name, description } = req.body;

    try {
        const categoryExists = await Category.findOne({ name });

        if (categoryExists) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const category = new Category({ name, description });
        const createdCategory = await category.save();

        res.status(201).json(createdCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    const { name, description } = req.body;

    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        category.name = name || category.name;
        category.description = description || category.description;

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await Category.deleteOne({ _id: category._id });
        res.json({ message: 'Category removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
