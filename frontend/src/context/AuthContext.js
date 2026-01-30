import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            const storedUser = JSON.parse(localStorage.getItem('user'));

            if (storedUser) {
                setUser(storedUser);
            }
            setIsLoading(false);
        };

        checkUserLoggedIn();
    }, []);

    const register = async (userData) => {
        const response = await api.post('/auth/register', userData);

        if (response.data) {
            localStorage.setItem('user', JSON.stringify(response.data));
            setUser(response.data);
        }

        return response.data;
    };

    const login = async (userData) => {
        const response = await api.post('/auth/login', userData);

        if (response.data) {
            console.log('Login response user data:', response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
            setUser(response.data);
        }

        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = (updatedUserData) => {
        // Merge existing user data with updates (preserve token, id etc if not passed)
        const newUser = { ...user, ...updatedUserData };
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                register,
                login,
                logout,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
