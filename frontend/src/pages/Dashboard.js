import { useEffect, useState } from 'react';
import api from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { FaMoneyBillWave, FaChartLine, FaList, FaWallet, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import moment from 'moment';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
    const [expenses, setExpenses] = useState([]);
    const [incomes, setIncomes] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({ totalAmount: 0, categoryStats: {} });
    const [incomeStats, setIncomeStats] = useState({ totalAmount: 0 });

    const fetchData = async () => {
        try {
            const expensesRes = await api.get('/expenses');
            const dataExpenses = expensesRes.data;
            setExpenses(dataExpenses);

            const incomesRes = await api.get('/incomes');
            const dataIncomes = incomesRes.data;
            setIncomes(dataIncomes);

            const statsRes = await api.get('/expenses/stats');
            setStats(statsRes.data);

            const incomeStatsRes = await api.get('/incomes/stats');
            setIncomeStats(incomeStatsRes.data);

            // Merge and sort transactions
            const mixedTransactions = [
                ...dataExpenses.map(item => ({ ...item, type: 'expense' })),
                ...dataIncomes.map(item => ({ ...item, type: 'income', title: item.source, categoryName: item.category }))
            ].sort((a, b) => new Date(b.date) - new Date(a.date));

            setTransactions(mixedTransactions);

        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Chart Data Processing ---

    // 1. Spending Trend (Bar Chart) -> Income vs Expense Trend
    const expensesByDate = {};
    expenses.forEach(exp => {
        const date = moment(exp.date).format('MMM Do');
        expensesByDate[date] = (expensesByDate[date] || 0) + exp.amount;
    });

    const incomeByDate = {};
    incomes.forEach(inc => {
        const date = moment(inc.date).format('MMM Do');
        incomeByDate[date] = (incomeByDate[date] || 0) + inc.amount;
    });

    // Timeline Labels
    const timelineLabels = [...new Set(transactions.map(t => moment(t.date).format('MMM Do')))].reverse();

    const barChartData = {
        labels: timelineLabels,
        datasets: [
            {
                label: 'Income',
                data: timelineLabels.map(date => incomeByDate[date] || 0),
                backgroundColor: 'rgba(46, 204, 113, 0.6)',
                borderColor: '#2ecc71',
                borderWidth: 1,
            },
            {
                label: 'Expense',
                data: timelineLabels.map(date => expensesByDate[date] || 0),
                backgroundColor: 'rgba(231, 76, 60, 0.6)',
                borderColor: '#e74c3c',
                borderWidth: 1,
            }
        ]
    };

    // 2. Spending by Category -> "Income & Expense Distribution"
    // Aggregate income by category (source)
    const incomeCategoryStats = {};
    incomes.forEach(inc => {
        const cat = inc.category || 'Income';
        incomeCategoryStats[cat] = (incomeCategoryStats[cat] || 0) + inc.amount;
    });

    const mixedCategoryLabels = [...Object.keys(incomeCategoryStats), ...Object.keys(stats.categoryStats)];
    const mixedCategoryData = [...Object.values(incomeCategoryStats), ...Object.values(stats.categoryStats)];

    const chartData = {
        labels: mixedCategoryLabels,
        datasets: [
            {
                label: 'Amount',
                data: mixedCategoryData,
                backgroundColor: [
                    '#2ecc71', '#27ae60', '#1abc9c', // Greens for Income
                    '#e74c3c', '#c0392b', '#e67e22', '#f1c40f', '#9b59b6', '#3498db' // Reds/Others for Expenses
                ],
                borderWidth: 1,
            },
        ],
    };

    const balance = incomeStats.totalAmount - stats.totalAmount;

    return (
        <div className='container' style={{ marginTop: '30px', paddingBottom: '50px' }}>
            <h1 style={{ marginBottom: '20px' }}>Dashboard</h1>

            <div className='stats-grid' style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                <div className='card stat-card' style={{ background: 'linear-gradient(135deg, #2ecc71 0%, #26a69a 100%)', color: 'white' }}>
                    <div className='stat-icon' style={{ background: 'rgba(255,255,255,0.2)' }}><FaMoneyBillWave /></div>
                    <div>
                        <h3>Total Income</h3>
                        <h2 style={{ fontSize: '2rem' }}>₹{incomeStats.totalAmount.toFixed(2)}</h2>
                    </div>
                </div>
                <div className='card stat-card' style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5253 100%)', color: 'white' }}>
                    <div className='stat-icon' style={{ background: 'rgba(255,255,255,0.2)' }}><FaList /></div>
                    <div>
                        <h3>Total Expenses</h3>
                        <h2 style={{ fontSize: '2rem' }}>₹{stats.totalAmount.toFixed(2)}</h2>
                    </div>
                </div>
                <div className='card stat-card' style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <div className='stat-icon' style={{ background: 'rgba(255,255,255,0.2)' }}><FaWallet /></div>
                    <div>
                        <h3>Balance</h3>
                        <h2 style={{ fontSize: '2rem' }}>₹{balance.toFixed(2)}</h2>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className='card'>
                    <h3 style={{ marginBottom: '15px' }}>Income & Expense Distribution</h3>
                    <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                        {mixedCategoryData.length > 0 ? (
                            <Doughnut data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                        ) : (
                            <p style={{ alignSelf: 'center', color: 'var(--text-secondary)' }}>No data to display</p>
                        )}
                    </div>
                </div>
                <div className='card'>
                    <h3 style={{ marginBottom: '15px' }}>Financial Trend</h3>
                    <div style={{ height: '300px' }}>
                        {timelineLabels.length > 0 ? (
                            <Bar data={barChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }} />
                        ) : (
                            <p style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text-secondary)' }}>No data to display</p>
                        )}
                    </div>
                </div>
            </div>

            <div className='card'>
                <h3 style={{ marginBottom: '20px' }}>Recent Transactions</h3>
                {transactions.length > 0 ? (
                    <div>
                        {transactions.slice(0, 5).map((txn) => (
                            <div key={txn._id} className='expense-item' style={{ borderLeft: `4px solid ${txn.type === 'income' ? '#2ecc71' : '#e74c3c'}` }}>
                                <div className='expense-info'>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '10px',
                                        background: txn.type === 'income' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                                        color: txn.type === 'income' ? '#2ecc71' : '#e74c3c',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                                    }}>
                                        {txn.type === 'income' ? <FaArrowUp /> : <FaArrowDown />}
                                    </div>
                                    <div>
                                        <h4 style={{ marginBottom: '4px' }}>{txn.title}</h4>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {moment(txn.date).format('MMM Do, YYYY')} • {txn.categoryName}
                                        </span>
                                    </div>
                                </div>
                                <div className='expense-amount' style={{ color: txn.type === 'income' ? '#2ecc71' : '#e74c3c', fontWeight: 'bold' }}>
                                    {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No transactions found. Start by adding one!</p>
                )}
            </div>

            {/* Floating Action Buttons */}
            <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link to="/incomes" className="btn" style={{
                    width: '60px', height: '60px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', boxShadow: '0 10px 25px rgba(46, 204, 113, 0.4)',
                    backgroundColor: '#2ecc71',
                    marginBottom: '10px'
                }} title="Add Income">
                    +
                </Link>
                <Link to="/expenses" className="btn" style={{
                    width: '60px', height: '60px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', boxShadow: '0 10px 25px rgba(231, 76, 60, 0.4)',
                    backgroundColor: '#e74c3c'
                }} title="Add Expense">
                    -
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;
