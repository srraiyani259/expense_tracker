import axios from 'axios';


// Get the current hostname (e.g., 'localhost' or '192.168.1.5')
const hostname = window.location.hostname;
export const BACKEND_URL = `http://${hostname}:5000`;

const api = axios.create({
    baseURL: `${BACKEND_URL}/api`,
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(sessionStorage.getItem('user'));

        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
