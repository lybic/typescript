'use client'
import { sessionStore } from '@/stores/session'
import axios, { AxiosError } from 'axios'

export const myAxios = axios.create({
  baseURL: import.meta.env.VITE_LYBIC_BASE_URL ?? '/',
})
myAxios.interceptors.request.use((config) => {
  const { trialSessionToken } = sessionStore
  if (trialSessionToken) {
    config.headers.set('x-trial-session-token', trialSessionToken)
  }
  return config
})
myAxios.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    if (!(error instanceof AxiosError)) {
      throw error
    }

    const data: any = error.response?.data
    if (data.message) {
      error.message = data.message
    }

    throw error
  },
)
