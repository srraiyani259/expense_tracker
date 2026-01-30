const mongoose = require('mongoose');

const incomeSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        source: {
            type: String,
            required: [true, 'Please add a source (e.g. Salary, Freelancing)'],
        },
        amount: {
            type: Number,
            required: [true, 'Please add an amount'],
        },
        category: {
            type: String, // Keeping it simple as a string for now, or could be linked to a Category model if we want shared categories
            required: false,
            default: 'Income'
        },
        description: {
            type: String,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Income', incomeSchema);
