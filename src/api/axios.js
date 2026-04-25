import axios from 'axios';

const currentHost = window.location.hostname;

const api = axios.create({
    baseURL: `http://${currentHost}:8000/api`,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    withCredentials: true, 
});

export default api;