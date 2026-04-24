import axios from 'axios';

const api = axios.create({
    baseURL: 'https://smartcitybackend-main-oqgeeg.free.laravel.cloud/api', 
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    withCredentials: true, 
});

export default api;