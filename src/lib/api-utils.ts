import { API_BASE_URL } from './constants'
import { jwtDecode } from 'jwt-decode'

interface DecodedToken {
  userId: string
  exp: number
}

export async function authenticatedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = localStorage.getItem('token')
  let userId = ''

  if (token) {
    try {
      const decodedToken = jwtDecode<DecodedToken>(token)
      userId = decodedToken.userId

      // Optional: Check for token expiration
      if (decodedToken.exp * 1000 < Date.now()) {
        console.warn('Token expired, logging out...')
        localStorage.removeItem('token')
        // Optionally, redirect to login page or trigger a logout action
        // window.location.href = '/login'
      }
    } catch (error) {
      console.error('Error decoding token:', error)
      localStorage.removeItem('token')
      // window.location.href = '/login'
    }
  }

  const headers = new Headers(init?.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  if (userId) {
    headers.set('x-user-id', userId)
  }

  const url = typeof input === 'string' && input.startsWith('/') ? `${API_BASE_URL}${input}` : input

  return fetch(url, { ...init, headers })
}
