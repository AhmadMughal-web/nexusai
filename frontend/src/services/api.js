import axios from 'axios'

// Development mein: Vite proxy use hoga (/api → localhost:5000)
// Production mein: Render ka URL use hoga
const baseURL = import.meta.env.PROD
  ? import.meta.env.VITE_API_URL + '/api'
  : '/api'

const api = axios.create({
  baseURL,
  timeout: 30000,
})

// Har request ke saath token bhejo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nai_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Error messages clean karo
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Something went wrong'
    const error = new Error(message)
    error.status = err.response?.status
    return Promise.reject(error)
  }
)

export default api
