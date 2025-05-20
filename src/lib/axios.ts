import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const customAxios = axios.create({
  baseURL: BASE_URL,
});

customAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// TODO:
// handle 403 error (log out user (token expired))

export default customAxios;
