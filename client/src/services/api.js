import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  // We set the base URL to our backend server
  // This avoids us having to type http://localhost:5000 every time
  baseURL: 'https://glad-we-met-backend-9vms.onrender.com', 
});

/*
  This is a 'request interceptor'. It's a function that
  runs BEFORE any API request is sent.
  
  We use it to dynamically grab the token from localStorage
  and add it to the 'Authorization' header.
*/
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
