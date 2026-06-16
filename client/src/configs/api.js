import axios from 'axios'

console.log("BASE URL:", import.meta.env.VITE_BASE_URL);


const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL
})

export default api