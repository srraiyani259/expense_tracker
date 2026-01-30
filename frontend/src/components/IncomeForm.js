import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';

const IncomeForm = ({ onIncomeAdded, existingIncome = null, onCancel }) => {
    const [formData, setFormData] = useState({
        source: '',
        amount: '',
        category: 'Salary',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (existingIncome) {
            setFormData({
                source: existingIncome.source,
                amount: existingIncome.amount,
                category: existingIncome.category || 'Salary',
                date: existingIncome.date.split('T')[0],
                description: existingIncome.description || ''
            });
        }
    }, [existingIncome]);

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (existingIncome) {
                await api.put(`/incomes/${existingIncome._id}`, formData);
                toast.success('Income updated successfully');
            } else {
                await api.post('/incomes', formData);
                toast.success('Income added successfully');
            }

            // Reset form if adding new
            if (!existingIncome) {
                setFormData({
                    source: '',
                    amount: '',
                    category: 'Salary',
                    date: new Date().toISOString().split('T')[0],
                    description: ''
                });
            }

            onIncomeAdded();
            if (onCancel) onCancel();

        } catch (err) {
            toast.error(err.response?.data?.message || 'Error processing income');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='card'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>{existingIncome ? 'Edit Income' : 'Add New Income'}</h3>
                {onCancel && <button onClick={onCancel} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}><FaTimes /></button>}
            </div>


            <form onSubmit={onSubmit}>
                <div className='form-group'>
                    <label>Source</label>
                    <input
                        type='text'
                        name='source'
                        value={formData.source}
                        onChange={onChange}
                        className='form-control'
                        required
                        placeholder="e.g. Monthly Salary"
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
                        <option value="Salary">Salary</option>
                        <option value="Freelancing">Freelancing</option>
                        <option value="Investments">Investments</option>
                        <option value="Gift">Gift</option>
                        <option value="Other">Other</option>
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
                    {loading ? 'Processing...' : (existingIncome ? 'Update Income' : 'Add Income')}
                </button>
            </form>
        </div>
    );
};

export default IncomeForm;
