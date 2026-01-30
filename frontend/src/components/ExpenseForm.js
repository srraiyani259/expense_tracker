import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ExpenseForm = ({ onExpenseAdded, existingExpense = null, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/categories');
                setCategories(res.data);
                if (res.data.length > 0 && !existingExpense) {
                    setFormData(prev => ({ ...prev, category: res.data[0]._id }));
                }
            } catch (err) {
                console.error('Error fetching categories');
            }
        };

        fetchCategories();

        if (existingExpense) {
            setFormData({
                title: existingExpense.title,
                amount: existingExpense.amount,
                category: existingExpense.category,
                date: existingExpense.date.split('T')[0],
                description: existingExpense.description || ''
            });
        }
    }, [existingExpense]);

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (existingExpense) {
                await api.put(`/expenses/${existingExpense._id}`, formData);
                toast.success('Expense updated successfully');
            } else {
                await api.post('/expenses', formData);
                toast.success('Expense added successfully');
            }

            // Reset form if adding new
            if (!existingExpense) {
                setFormData({
                    title: '',
                    amount: '',
                    category: categories.length > 0 ? categories[0]._id : '',
                    date: new Date().toISOString().split('T')[0],
                    description: ''
                });
            }

            onExpenseAdded();
            if (onCancel) onCancel(); // Close modal/form if in edit mode

        } catch (err) {
            toast.error(err.response?.data?.message || 'Error processing expense');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='card'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>{existingExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
                {onCancel && <button onClick={onCancel} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}><FaTimes /></button>}
            </div>


            <form onSubmit={onSubmit}>
                <div className='form-group'>
                    <label>Title</label>
                    <input
                        type='text'
                        name='title'
                        value={formData.title}
                        onChange={onChange}
                        className='form-control'
                        required
                        placeholder="e.g. Grocery Shopping"
                    />
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <div className='form-group' style={{ flex: 1 }}>
                        <label>Amount</label>
                        <input
                            type='number'
                            name='amount'
                            value={formData.amount}
                            onChange={onChange}
                            className='form-control'
                            required
                            placeholder="0.00"
                            min="0.01"
                            step="0.01"
                        />
                    </div>

                    <div className='form-group' style={{ flex: 1 }}>
                        <label>Date</label>
                        <input
                            type='date'
                            name='date'
                            value={formData.date}
                            onChange={onChange}
                            className='form-control'
                            required
                        />
                    </div>
                </div>

                <div className='form-group'>
                    <label>Category</label>
                    <select
                        name='category'
                        value={formData.category}
                        onChange={onChange}
                        className='form-control'
                    >
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className='form-group'>
                    <label>Description (Optional)</label>
                    <textarea
                        name='description'
                        value={formData.description}
                        onChange={onChange}
                        className='form-control'
                        rows='2'
                    ></textarea>
                </div>

                <button type='submit' className='btn btn-block' disabled={loading}>
                    {loading ? 'Processing...' : (existingExpense ? 'Update Expense' : 'Add Expense')}
                </button>
            </form>
        </div>
    );
};

export default ExpenseForm;
