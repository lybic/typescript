'use client'
import { sessionStore } from '@/stores/session'
import axios, { AxiosError } from 'axios'

export const myAxios = axios.create({
  baseURL: import.meta.env.VITE_LYBIC_BASE_URL ?? '/',
})
myAxios.interceptors.request.use((config) => {
  const { trialSessionToken, dashboardSessionToken } = sessionStore
  if (trialSessionToken) {
    config.headers.set('x-trial-session-token', trialSessionToken)
  } else if (dashboardSessionToken) {
    config.headers.set('authorization', `Bearer ${dashboardSessionToken}`)
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
      error.code = data.code
    }

    throw error
  },
)
