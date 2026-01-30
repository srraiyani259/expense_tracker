const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Category = require('../models/Category'); // Add this line
const { protect } = require('../middleware/auth');

// @desc    Get expenses
// @route   GET /api/expenses
// @access  Private
router.get('/', protect, async (req, res) => {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(expenses);
});

// @desc    Set expense
// @route   POST /api/expenses
// @access  Private
router.post('/', protect, async (req, res) => {
    if (!req.body.title || !req.body.amount || !req.body.category) {
        return res.status(400).json({ message: 'Please add title, amount and category' });
    }

    // Find category to get name if not provided (though frontend should send both ideally, or backend looks it up)
    // We'll trust the frontend sent category ID. We need to look up the name to store it denormalized or just rely on ID.
    // My model has categoryName required. Let's look it up.

    let categoryName = req.body.categoryName;
    if (!categoryName) {
        // Try to find category
        try {
            const category = await Category.findById(req.body.category);
            if (category) {
                categoryName = category.name;
            } else {
                categoryName = 'Uncategorized';
            }
        } catch (e) {
            categoryName = 'Uncategorized';
        }
    }

    const expense = await Expense.create({
        user: req.user.id,
        title: req.body.title,
        amount: req.body.amount,
        category: req.body.category,
        categoryName: categoryName,
        description: req.body.description,
        date: req.body.date || Date.now(),
    });

    res.status(200).json(expense);
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
        res.status(400);
        throw new Error('Expense not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the expense user
    if (expense.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    // If category changed, update name too
    let updateData = req.body;
    if (req.body.category) {
        // verify category and get name
        try {
            const category = await Category.findById(req.body.category);
            if (category) {
                updateData.categoryName = category.name;
            }
        } catch (e) {
            // keep old name or set unknown
        }
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
    );

    res.status(200).json(updatedExpense);
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
        return res.status(400).json({ message: 'Expense not found' });
    }

    // Check for user
    if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
    }

    // Make sure the logged in user matches the expense user
    if (expense.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized' });
    }

    await expense.deleteOne();

    res.status(200).json({ id: req.params.id });
});

// @desc    Get expense statistics
// @route   GET /api/expenses/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
    // Get total expenses
    const expenses = await Expense.find({ user: req.user.id });

    const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    // Group by category
    const categoryStats = {};
    expenses.forEach(expense => {
        if (categoryStats[expense.categoryName]) {
            categoryStats[expense.categoryName] += expense.amount;
        } else {
            categoryStats[expense.categoryName] = expense.amount;
        }
    });

    // Last 7 days chart data
    // This is a simple implementation, can be optimized with aggregation pipeline

    // ...

    res.status(200).json({
        totalAmount,
        categoryStats,
        count: expenses.length
    });
});

module.exports = router;
