import apiClient from './apiClient'

const resource = '/dashboard'

export default {
  // جلب إحصائيات الشاشة الرئيسية
  getStats() {
    return apiClient.get(`${resource}/stats`)
  },
}
