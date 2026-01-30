import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import ExpenseForm from '../components/ExpenseForm';
import { FaEdit, FaTrash, FaFilter, FaPlus } from 'react-icons/fa';
import moment from 'moment';

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [showForm, setShowForm] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [filterCategory, setFilterCategory] = useState('all');

    useEffect(() => {
        fetchExpenses();
        fetchCategories();
    }, []);

    useEffect(() => {
        if (filterCategory === 'all') {
            setFilteredExpenses(expenses);
        } else {
            setFilteredExpenses(expenses.filter(exp => exp.category === filterCategory));
        }
    }, [expenses, filterCategory]);

    const fetchExpenses = async () => {
        try {
            const res = await api.get('/expenses');
            setExpenses(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching expenses');
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                await api.delete(`/expenses/${id}`);
                setExpenses(expenses.filter(exp => exp._id !== id));
                toast.success('Expense deleted successfully');
            } catch (error) {
                console.error('Error deleting expense');
                toast.error('Failed to delete expense');
            }
        }
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const onExpenseAdded = () => {
        fetchExpenses();
        setShowForm(false);
        setEditingExpense(null);
    };

    return (
        <div className='container' style={{ marginTop: '30px', paddingBottom: '50px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ margin: 0 }}>My Expenses</h1>
                <button
                    className='btn'
                    onClick={() => {
                        setEditingExpense(null);
                        setShowForm(!showForm);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    {showForm ? 'Close Form' : <><FaPlus /> Add Expense</>}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: showForm ? '1fr 1fr' : '1fr', gap: '30px' }}>
                {/* Form Section - Conditionally shown or side-by-side on desktop */}
                {showForm && (
                    <div style={{ marginBottom: '30px' }}>
                        <ExpenseForm
                            onExpenseAdded={onExpenseAdded}
                            existingExpense={editingExpense}
                            onCancel={() => {
                                setShowForm(false);
                                setEditingExpense(null);
                            }}
                        />
                    </div>
                )}

                {/* List Section */}
                <div style={showForm ? { gridColumn: '2' } : {}}>
                    {/* Filters */}
                    <div className='card' style={{ padding: '15px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <FaFilter style={{ color: 'var(--text-secondary)' }} />
                        <span style={{ fontWeight: 500 }}>Filter by Category:</span>
                        <select
                            className='form-control'
                            style={{ width: 'auto', padding: '8px', marginBottom: 0 }}
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value='all'>All Categories</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {loading ? (
                        <p>Loading expenses...</p>
                    ) : (
                        <div className='card' style={{ padding: '0' }}>
                            {filteredExpenses.length > 0 ? (
                                <div>
                                    {filteredExpenses.map(expense => (
                                        <div key={expense._id} className='expense-item'>
                                            <div className='expense-info'>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '10px',
                                                    background: 'var(--primary-color)', color: 'white',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                                                }}>
                                                    {expense.categoryName ? expense.categoryName[0].toUpperCase() : '?'}
                                                </div>
                                                <div>
                                                    <h4 style={{ marginBottom: '4px' }}>{expense.title}</h4>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                        {moment(expense.date).format('MMM Do, YYYY')} • <span style={{ fontWeight: 600 }}>{expense.categoryName}</span>
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div className='expense-amount'>
                                                    -₹{expense.amount.toFixed(2)}
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => handleEdit(expense)}
                                                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(expense._id)}
                                                        style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    <p>No expenses found. Add one to get started!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Expenses;
