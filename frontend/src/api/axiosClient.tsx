import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5000', // backend URL
  withCredentials: false,
});

export default axiosClient;