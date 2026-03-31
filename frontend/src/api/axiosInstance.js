import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust this if your backend API has a different base path
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
