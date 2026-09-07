import { create } from 'zustand'
import type { User } from '../types'
import { authApi } from '../lib/api'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  init: () => Promise<void>
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, password: string, phone?: string) => Promise<User>
  logout: () => Promise<void>
}

// The PHP API keeps the logged-in user in a session cookie, but there's
// no dedicated "who am I" endpoint in the original API, so admin-extra.php
// adds a tiny ?resource=me one. On boot we ask it once so a page refresh
// doesn't lose the logged-in state (as long as the session cookie is
// still valid).
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,
  init: async () => {
    try {
      const user = await authApi.me()
      set({ user, initialized: true })
    } catch {
      set({ user: null, initialized: true })
    }
  },
  login: async (email, password) => {
    set({ loading: true })
    try {
      const res = await authApi.login({ email, password })
      set({ user: res.user, loading: false })
      return res.user
    } catch (e) {
      set({ loading: false })
      throw e
    }
  },
  register: async (name, email, password, phone) => {
    set({ loading: true })
    try {
      const res = await authApi.register({ name, email, password, phone })
      set({ user: res.user, loading: false })
      return res.user
    } catch (e) {
      set({ loading: false })
      throw e
    }
  },
  logout: async () => {
    await authApi.logout()
    set({ user: null })
  },
}))
