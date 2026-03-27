import axios from 'axios'

// Use environment variable for API URL
const API_URL = import.meta.env.VITE_API_URL || 'https://expense-front-end-lsgy.vercel.app'

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000
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

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

// Expenses
export const expenseAPI = {
  getAll: () => api.get('/expenses'),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getByRange: (start, end) => api.get(`/expenses/range?start=${start}&end=${end}`),
  getByCategory: (id) => api.get(`/expenses/category/${id}`),
  search: (q) => api.get(`/expenses/search?q=${encodeURIComponent(q)}`),
  exportCsv: () => api.get('/expenses/export/csv', { responseType: 'blob' }),
}

// Income
export const incomeAPI = {
  getAll: () => api.get('/income'),
  create: (data) => api.post('/income', data),
  update: (id, data) => api.put(`/income/${id}`, data),
  delete: (id) => api.delete(`/income/${id}`),
  getByRange: (start, end) => api.get(`/income/range?start=${start}&end=${end}`),
}

// Budgets
export const budgetAPI = {
  getCurrent: () => api.get('/budgets'),
  getForMonth: (m, y) => api.get(`/budgets/${m}/${y}`),
  createOrUpdate: (data) => api.post('/budgets', data),
  delete: (id) => api.delete(`/budgets/${id}`),
}

// Categories
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getExpense: () => api.get('/categories/expense'),
  getIncome: () => api.get('/categories/income'),
}

// Analytics
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getCategories: (m, y) => api.get(`/analytics/categories?month=${m}&year=${y}`),
  getTrends: (y) => api.get(`/analytics/trends?year=${y}`),
}

export default api
