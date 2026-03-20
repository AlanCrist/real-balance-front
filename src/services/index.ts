import { api as realApi } from './api'
import { api as mockApi } from './mockApi'

export const api = import.meta.env.VITE_USE_MOCK === 'true' ? mockApi : realApi
