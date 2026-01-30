import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import { FaSignInAlt, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { email, password } = formData;
    const { login, user, isLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(formData);
        } catch (err) {
            toast.error(
                err.response && err.response.data.message
                    ? err.response.data.message
                    : 'Login failed'
            );
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className='container' style={{ marginTop: '80px', maxWidth: '500px' }}>
            <div className='card'>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <FaSignInAlt style={{ fontSize: '3rem', color: 'var(--primary-color)' }} />
                    <h1 style={{ marginTop: '10px' }}>Login</h1>
                    <p>Login to manage your expenses</p>
                </div>


                <form onSubmit={onSubmit}>
                    <div className='form-group'>
                        <label>Email Address</label>
                        <input
                            type='email'
                            className='form-control'
                            name='email'
                            value={email}
                            onChange={onChange}
                            placeholder='Enter your email'
                            required
                        />
                    </div>
                    <div className='form-group' style={{ position: 'relative' }}>
                        <label>Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className='form-control'
                            name='password'
                            value={password}
                            onChange={onChange}
                            placeholder='Enter password'
                            required
                        />
                        <span
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '38px',
                                cursor: 'pointer',
                                color: '#6c757d'
                            }}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    <button type='submit' className='btn btn-block'>
                        Submit
                    </button>
                </form>

                <p style={{ marginTop: '20px', textAlign: 'center' }}>
                    Don't have an account? <Link to='/register' style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
