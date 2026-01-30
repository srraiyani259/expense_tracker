const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect } = require('../middleware/auth');

// @desc    Get categories
// @route   GET /api/categories
// @access  Private
router.get('/', protect, async (req, res) => {
    const categories = await Category.find({ user: req.user.id });
    res.status(200).json(categories);
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private
router.post('/', protect, async (req, res) => {
    if (!req.body.name) {
        return res.status(400).json({ message: 'Please add a category name' });
    }

    const category = await Category.create({
        user: req.user.id,
        name: req.body.name,
        icon: req.body.icon || 'circle',
        color: req.body.color || '#000000',
        type: 'custom'
    });

    res.status(200).json(category);
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return res.status(400).json({ message: 'Category not found' });
    }

    if (category.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    await category.deleteOne();

    res.status(200).json({ id: req.params.id });
});

module.exports = router;
