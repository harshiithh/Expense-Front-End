import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080/api' 
    : 'https://expense-front-end-2bp1.onrender.com/api')

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

export const expenseAPI = {
  getAll: () => api.get('/expenses'),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  exportCsv: () => api.get('/expenses/export/csv', { responseType: 'blob' }),
}

export const incomeAPI = {
  getAll: () => api.get('/income'),
  getById: (id) => api.get(`/income/${id}`),
  create: (data) => api.post('/income', data),
  update: (id, data) => api.put(`/income/${id}`, data),
  delete: (id) => api.delete(`/income/${id}`),
}

export const budgetAPI = {
  getAll: () => api.get('/budgets'),
  getForMonth: (month, year) => api.get(`/budgets/${month}/${year}`),  // ← added
  getById: (id) => api.get(`/budgets/${id}`),
  create: (data) => api.post('/budgets', data),
  createOrUpdate: (data) => api.post('/budgets', data),                // ← added
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
}

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getExpense: () => api.get('/categories/expense'),
  getIncome: () => api.get('/categories/income'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
}

export const analyticsAPI = {
  getSummary: () => api.get('/analytics/dashboard'),
  getMonthly: () => api.get('/analytics/trends'),
  getByCategory: () => api.get('/analytics/categories'),
  getTrends: (year) => api.get(`/analytics/trends?year=${year}`),          // ← added
  getCategories: (month, year) => api.get(`/analytics/categories?month=${month}&year=${year}`), // ← added
}

export default api
