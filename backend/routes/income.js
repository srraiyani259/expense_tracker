const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const { protect } = require('../middleware/auth');

// @desc    Get incomes
// @route   GET /api/incomes
// @access  Private
router.get('/', protect, async (req, res) => {
    const incomes = await Income.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(incomes);
});

// @desc    Add income
// @route   POST /api/incomes
// @access  Private
router.post('/', protect, async (req, res) => {
    if (!req.body.source || !req.body.amount) {
        return res.status(400).json({ message: 'Please add source and amount' });
    }

    const income = await Income.create({
        user: req.user.id,
        source: req.body.source,
        amount: req.body.amount,
        category: req.body.category || 'Income',
        description: req.body.description,
        date: req.body.date || Date.now(),
    });

    res.status(200).json(income);
});

// @desc    Update income
// @route   PUT /api/incomes/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    const income = await Income.findById(req.params.id);

    if (!income) {
        res.status(400);
        throw new Error('Income entry not found');
    }

    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    if (income.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updatedIncome = await Income.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.status(200).json(updatedIncome);
});

// @desc    Delete income
// @route   DELETE /api/incomes/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    const income = await Income.findById(req.params.id);

    if (!income) {
        return res.status(400).json({ message: 'Income entry not found' });
    }

    if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
    }

    if (income.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized' });
    }

    await income.deleteOne();

    res.status(200).json({ id: req.params.id });
});

// @desc    Get income statistics
// @route   GET /api/incomes/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
    const incomes = await Income.find({ user: req.user.id });

    const totalAmount = incomes.reduce((acc, curr) => acc + curr.amount, 0);

    res.status(200).json({
        totalAmount,
        count: incomes.length
    });
});

module.exports = router;
