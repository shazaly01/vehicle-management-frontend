import { defineStore } from 'pinia'
import { ref } from 'vue'
import dashboardService from '@/services/DashboardService'

export const useDashboardStore = defineStore('dashboard', () => {
  // --- State ---
  const stats = ref(null) // سيحتوي على الكائن الذي يضم كل الإحصائيات
  const loading = ref(false)
  const error = ref(null)

  // --- Actions ---
  async function fetchStats() {
    loading.value = true
    error.value = null
    try {
      const response = await dashboardService.getStats()
      // البيانات ستأتي جاهزة من الـ API بفضل الـ DashboardController الذي برمجناه
      stats.value = response.data
    } catch (err) {
      error.value = 'فشل في جلب إحصائيات لوحة التحكم.'
      console.error(err)
      stats.value = null
    } finally {
      loading.value = false
    }
  }

  // --- Return public API ---
  return {
    stats,
    loading,
    error,
    fetchStats,
  }
})
