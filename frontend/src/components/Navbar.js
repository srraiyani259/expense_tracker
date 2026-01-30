import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { FaWallet, FaSignOutAlt, FaUserCircle, FaUser } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const onLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className='navbar'>
            <div className='container navbar-container'>
                <Link to='/' className='logo'>
                    <FaWallet /> ExpenseTracker
                </Link>
                <div className='nav-links'>
                    {user ? (
                        <>
                            <Link to='/' className='nav-link'>
                                Dashboard
                            </Link>
                            <Link to='/expenses' className='nav-link'>
                                Expenses
                            </Link>
                            <Link to='/incomes' className='nav-link'>
                                Income
                            </Link>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <Link to='/profile' style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{
                                        width: '35px', height: '35px', borderRadius: '50%',
                                        background: '#ecf0f1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '2px solid white', overflow: 'hidden'
                                    }}>
                                        {user.photo ? (
                                            <img src={`http://localhost:5000/${user.photo.replace(/\\/g, '/')}`} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <FaUser />
                                        )}
                                    </div>
                                    <span style={{ fontWeight: 600 }}>{user.name}</span>
                                </Link>
                                <button onClick={onLogout} className='btn btn-danger' style={{ padding: '5px 15px', fontSize: '0.9rem' }}>
                                    <FaSignOutAlt />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to='/login' className='nav-link'>
                                Login
                            </Link>
                            <Link to='/register' className='btn'>
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
