const mongoose = require('mongoose');

const categorySchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        name: {
            type: String,
            required: [true, 'Please add a category name'],
        },
        icon: {
            type: String,
            default: 'circle',
        },
        color: {
            type: String,
            default: '#000000',
        },
        type: {
            type: String,
            default: 'custom' // default or custom
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Category', categorySchema);
