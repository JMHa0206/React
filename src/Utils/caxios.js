import axios from 'axios';


const caxios = axios.create({
    baseURL:'http://10.5.5.2'
});

caxios.interceptors.request.use(
    (config)=>{
        const token = sessionStorage.getItem("token");
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
)

export default caxios;