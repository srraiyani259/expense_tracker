import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { BACKEND_URL } from '../services/api';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaCamera, FaLock, FaCheck, FaEye, FaEyeSlash } from 'react-icons/fa';

const Profile = () => {
    const { user, updateUser, logout } = useContext(AuthContext); // We might need to update user context after edit
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        mobile: '',
        photo: ''
    });

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        mobile: '',
        photoFile: null
    });
    const [previewUrl, setPreviewUrl] = useState('');

    // Password Change State
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showNewPassword, setShowNewPassword] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/me');
            setProfile(res.data);
            setEditForm({
                name: res.data.name,
                email: res.data.email,
                mobile: res.data.mobile || '',
                photoFile: null
            });
            // Update context user if needed (optional optimization)
        } catch (error) {
            console.error('Error fetching profile', error);
        }
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        setPreviewUrl('');
        setEditForm({
            name: profile.name,
            email: profile.email,
            mobile: profile.mobile || '',
            photoFile: null
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditForm({ ...editForm, photoFile: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', editForm.name);
        formData.append('email', editForm.email);
        formData.append('mobile', editForm.mobile);
        if (editForm.photoFile) {
            formData.append('photo', editForm.photoFile);
        }

        try {
            const res = await api.put('/auth/updatedetails', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setProfile(res.data);
            setProfile(res.data);
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });

            // Update context to reflect changes in Navbar immediately
            updateUser({ name: res.data.name, photo: res.data.photo });

        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        }
    };

    // Password Change Logic
    const handleSendOtp = async () => {
        try {
            await api.post('/auth/send-verification');
            setOtpSent(true);
            setMessage({ type: 'success', text: 'Verification code sent to your email.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to send verification code.' });
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9_&]+$/;
        if (!passwordRegex.test(newPassword)) {
            toast.error('Password must contain A-Z, a-z, and can only include letters, numbers, _, &');
            return;
        }

        try {
            const res = await api.put('/auth/updatepassword', { otp, newPassword });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setOtpSent(false);
            setShowPasswordChange(false);
            setOtp('');
            setNewPassword('');
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.')) {
            try {
                await api.delete('/auth/deleteaccount');
                toast.success('Account deleted successfully');
                logout();
                navigate('/login');
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete account');
            }
        }
    };

    const getPhotoUrl = (photoPath) => {
        if (!photoPath) return null;
        // Normalize path separators for Windows
        const normalizedPath = photoPath.replace(/\\/g, '/');
        // Check if path already contains 'uploads/' to avoid doubling if needed, though backend returns 'uploads/filename'
        return `${BACKEND_URL}/${normalizedPath}`;
    };

    return (
        <div className='container' style={{ marginTop: '50px', maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>User Profile</h1>

            {message.text && (
                <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'}`} style={{ marginBottom: '20px' }}>
                    {message.text}
                </div>
            )}

            <div className='card' style={{ display: 'flex', flexDirection: 'column', gap: '30px', padding: '40px' }}>

                {/* Profile Header / View Mode */}
                {!isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                width: '150px', height: '150px', borderRadius: '50%',
                                background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden', border: '5px solid white', boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                            }}>
                                {profile.photo ? (
                                    <img src={getPhotoUrl(profile.photo)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <FaUser size={60} color="#ccc" />
                                )}
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: '20px' }}>
                                <small style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>FULL NAME</small>
                                <h2 style={{ marginTop: '5px' }}>{profile.name}</h2>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <small style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>EMAIL ADDRESS</small>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px', fontSize: '1.1rem' }}>
                                        <FaEnvelope color="var(--primary-color)" /> {profile.email}
                                    </div>
                                </div>
                                <div>
                                    <small style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>MOBILE NUMBER</small>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px', fontSize: '1.1rem' }}>
                                        {profile.mobile ? (
                                            <>
                                                <FaPhone color="var(--primary-color)" /> {profile.mobile}
                                            </>
                                        ) : (
                                            <span style={{ color: '#999', fontStyle: 'italic' }}>Not provided</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <button className='btn' onClick={handleEditToggle} style={{ padding: '10px 20px' }}>
                                Edit Profile
                            </button>
                        </div>
                    </div>
                ) : (
                    // Edit Form
                    <form onSubmit={handleUpdateProfile}>
                        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '150px', height: '150px', borderRadius: '50%',
                                    background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    overflow: 'hidden', border: '5px solid white', boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                                    marginBottom: '15px'
                                }}>
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : profile.photo ? (
                                        <img src={getPhotoUrl(profile.photo)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <FaUser size={60} color="#ccc" />
                                    )}
                                </div>
                                <label className="btn" style={{ width: '100%', cursor: 'pointer', fontSize: '0.9rem' }}>
                                    <FaCamera /> Change Photo
                                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                </label>
                            </div>

                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <h3 style={{ marginBottom: '20px' }}>Edit Details</h3>
                                <div className='form-group'>
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        className='form-control'
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className='form-group'>
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        className='form-control'
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className='form-group'>
                                    <label>Mobile Number</label>
                                    <input
                                        type="tel"
                                        className='form-control'
                                        value={editForm.mobile}
                                        onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                                        placeholder="e.g. enter number"
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                    <button type="submit" className='btn' style={{ background: '#2ecc71' }}>Save Changes</button>
                                    <button type="button" className='btn' style={{ background: '#e74c3c' }} onClick={handleEditToggle}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    </form>
                )}

                <hr style={{ border: '0', borderTop: '1px solid #eee' }} />

                {/* Password Change Section */}
                <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3>Security</h3>
                        {!showPasswordChange && (
                            <button className='btn' style={{ background: '#34495e' }} onClick={() => setShowPasswordChange(true)}>
                                <FaLock /> Change Password
                            </button>
                        )}
                    </div>

                    {showPasswordChange && (
                        <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '15px' }}>
                            <h4 style={{ marginBottom: '15px' }}>Change Password</h4>

                            {!otpSent ? (
                                <div>
                                    <p style={{ marginBottom: '15px', color: 'var(--text-secondary)' }}>
                                        To protect your account, we need to verify your identity. <br />
                                        Click below to send a verification code to <strong>{profile.email}</strong>.
                                    </p>
                                    <button className="btn" onClick={handleSendOtp} style={{ background: 'var(--primary-color)' }}>
                                        Send Verification Code
                                    </button>
                                    <button className="btn" onClick={() => setShowPasswordChange(false)} style={{ background: 'transparent', color: '#999', marginLeft: '10px' }}>
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleChangePassword}>
                                    <div className="form-group">
                                        <label>Verification Code (OTP)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter 6-digit code"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                        />
                                        <small style={{ color: '#999' }}>Check your email (or server console in dev mode) for the code.</small>
                                    </div>
                                    <div className="form-group" style={{ position: 'relative' }}>
                                        <label>New Password</label>
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            className="form-control"
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            minLength="6"
                                        />
                                        <span
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '38px',
                                                cursor: 'pointer',
                                                color: '#6c757d'
                                            }}
                                        >
                                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                        <button type="submit" className='btn' style={{ background: '#2ecc71' }}>Change Password</button>
                                        <button type="button" className='btn' style={{ background: '#999' }} onClick={() => { setOtpSent(false); setMessage({ type: '', text: '' }); }}>Back</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>

                <hr style={{ border: '0', borderTop: '1px solid #eee' }} />

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button
                        className='btn'
                        style={{ background: '#e74c3c', width: '100%' }}
                        onClick={handleDeleteAccount}
                    >
                        Delete Account
                    </button>
                    <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '10px' }}>
                        Warning: This action is permanent.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Profile;
