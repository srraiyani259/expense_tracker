import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import IncomeForm from '../components/IncomeForm';
import { FaEdit, FaTrash, FaPlus, FaMoneyBillWave, FaFilter } from 'react-icons/fa';
import moment from 'moment';

const Income = () => {
    const [incomes, setIncomes] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [showForm, setShowForm] = useState(false);
    const [editingIncome, setEditingIncome] = useState(null);

    const [filteredIncomes, setFilteredIncomes] = useState([]);
    const [filterCategory, setFilterCategory] = useState('all');

    useEffect(() => {
        fetchIncomes();
    }, []);

    useEffect(() => {
        if (filterCategory === 'all') {
            setFilteredIncomes(incomes);
        } else {
            setFilteredIncomes(incomes.filter(inc => inc.category === filterCategory));
        }
    }, [incomes, filterCategory]);

    const fetchIncomes = async () => {
        try {
            const res = await api.get('/incomes');
            setIncomes(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching incomes');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this income entry?')) {
            try {
                await api.delete(`/incomes/${id}`);
                setIncomes(incomes.filter(inc => inc._id !== id));
                toast.success('Income deleted successfully');
            } catch (error) {
                console.error('Error deleting income');
                toast.error('Failed to delete income');
            }
        }
    };

    const handleEdit = (income) => {
        setEditingIncome(income);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const onIncomeAdded = () => {
        fetchIncomes();
        setShowForm(false);
        setEditingIncome(null);
    };

    // Get unique categories for filter
    const uniqueCategories = [...new Set(incomes.map(item => item.category))];

    return (
        <div className='container' style={{ marginTop: '30px', paddingBottom: '50px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ margin: 0 }}>My Income</h1>
                <button
                    className='btn'
                    onClick={() => {
                        setEditingIncome(null);
                        setShowForm(!showForm);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    {showForm ? 'Close Form' : <><FaPlus /> Add Income</>}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: showForm ? '1fr 1fr' : '1fr', gap: '30px' }}>
                {/* Form Section */}
                {showForm && (
                    <div style={{ marginBottom: '30px' }}>
                        <IncomeForm
                            onIncomeAdded={onIncomeAdded}
                            existingIncome={editingIncome}
                            onCancel={() => {
                                setShowForm(false);
                                setEditingIncome(null);
                            }}
                        />
                    </div>
                )}

                {/* List Section */}
                <div style={showForm ? { gridColumn: '2' } : {}}>
                    {/* Filter UI */}
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
                            {uniqueCategories.map((cat, index) => (
                                <option key={index} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {loading ? (
                        <p>Loading income...</p>
                    ) : (
                        <div className='card' style={{ padding: '0' }}>
                            {filteredIncomes.length > 0 ? (
                                <div>
                                    {filteredIncomes.map(income => (
                                        <div key={income._id} className='expense-item'>
                                            <div className='expense-info'>
                                                <div style={{
                                                    width: '40px', height: '40px', borderRadius: '10px',
                                                    background: '#2ecc71', color: 'white', // Green for income
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                                                }}>
                                                    <FaMoneyBillWave />
                                                </div>
                                                <div>
                                                    <h4 style={{ marginBottom: '4px' }}>{income.source}</h4>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                        {moment(income.date).format('MMM Do, YYYY')} • <span style={{ fontWeight: 600 }}>{income.category}</span>
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div className='expense-amount' style={{ color: '#2ecc71' }}>
                                                    +₹{income.amount.toFixed(2)}
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => handleEdit(income)}
                                                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(income._id)}
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
                                    <p>No income entries found matching criteria.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Income;
