// src/stores/authStore.js
import { defineStore } from 'pinia'
import authService from '@/services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    returnUrl: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,

    // تحويل كل صلاحيات الأدوار إلى مصفوفة واحدة مسطحة من الأسماء
    permissions: (state) => {
      if (state.user && state.user.roles) {
        const allPermissions = state.user.roles.flatMap((role) =>
          role.permissions.map((p) => p.name),
        )
        return [...new Set(allPermissions)]
      }
      return []
    },
  },

  actions: {
    // --- [إضافة] دالة التحقق من الدور ---
    hasRole(roleName) {
      if (!this.user || !this.user.roles) return false
      // السوبر أدمن له صلاحيات كل الأدوار دائماً
      if (this.user.roles.some((role) => role.name === 'Super Admin')) return true

      return this.user.roles.some((role) => role.name === roleName)
    },

    // --- [تعديل] دالة التحقق من الصلاحية ---
    can(permissionName) {
      if (this.hasRole('Super Admin')) return true
      return this.permissions.includes(permissionName)
    },

    async login(credentials) {
      const response = await authService.login(credentials)
      const { access_token, user } = response.data

      this.token = access_token
      this.user = user

      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(user))
    },

    async logout() {
      try {
        await authService.logout()
      } catch (error) {
        console.error('Logout API call failed, but clearing local state anyway:', error)
      } finally {
        this.user = null
        this.token = null
        this.returnUrl = null

        localStorage.removeItem('token')
        localStorage.removeItem('user')

        window.location.href = '/login'
      }
    },
  },
})
