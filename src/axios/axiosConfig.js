import axios from 'axios';

const daxios = axios.create({});

// 요청 인터셉터: JWT 토큰 자동 첨부
daxios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export default daxios;

