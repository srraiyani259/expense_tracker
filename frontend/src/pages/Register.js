import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import { FaUserPlus, FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const { name, email, password, confirmPassword } = formData;
    const { register, user, isLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        setError('');

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9_&]+$/;
        if (!passwordRegex.test(password)) {
            toast.error('Password must contain A-Z, a-z, and can only include letters, numbers, _, &');
            return;
        }

        try {
            await register({ name, email, password });
        } catch (err) {
            toast.error(
                err.response && err.response.data.message
                    ? err.response.data.message
                    : 'Registration failed'
            );
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className='container' style={{ marginTop: '80px', maxWidth: '500px' }}>
            <div className='card'>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <FaUserPlus style={{ fontSize: '3rem', color: 'var(--secondary-color)' }} />
                    <h1 style={{ marginTop: '10px' }}>Register</h1>
                    <p>Create an account to track expenses</p>
                </div>


                <form onSubmit={onSubmit}>
                    <div className='form-group'>
                        <label>Name</label>
                        <input
                            type='text'
                            className='form-control'
                            name='name'
                            value={name}
                            onChange={onChange}
                            placeholder='Enter your name'
                            required
                        />
                    </div>
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
                    <div className='form-group' style={{ position: 'relative' }}>
                        <label>Confirm Password</label>
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            className='form-control'
                            name='confirmPassword'
                            value={confirmPassword}
                            onChange={onChange}
                            placeholder='Confirm password'
                            required
                        />
                        <span
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '38px',
                                cursor: 'pointer',
                                color: '#6c757d'
                            }}
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    <button type='submit' className='btn btn-block'>
                        Submit
                    </button>
                </form>

                <p style={{ marginTop: '20px', textAlign: 'center' }}>
                    Already have an account? <Link to='/login' style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
