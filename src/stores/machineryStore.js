import { defineStore } from 'pinia'
import { ref } from 'vue'
import machineryService from '@/services/MachineryService'

export const useMachineryStore = defineStore('machinery', () => {
  const machineries = ref([])
  const availableMachineries = ref([]) // قائمة منفصلة للآليات المتاحة للعمل
  const pagination = ref({})
  const currentMachinery = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const validationErrors = ref({})

  // أضفنا filters كمعامل ثالث للدالة
  async function fetchMachineries(page = 1, search = '', filters = {}) {
    loading.value = true
    error.value = null
    try {
      // تمرير الفلاتر إلى الخدمة (Service)
      const response = await machineryService.get(page, search, filters)
      machineries.value = response.data.data
      pagination.value = response.data.meta || {}
    } catch (err) {
      error.value = 'فشل في جلب بيانات الآليات.'
      console.error(err)
      machineries.value = []
    } finally {
      loading.value = false
    }
  }

  // دالة مخصصة لجلب الآليات المتاحة فقط (للقوائم المنسدلة في أذونات الخروج)
  async function fetchAvailableMachineries() {
    loading.value = true
    error.value = null
    try {
      const response = await machineryService.getAvailable()
      availableMachineries.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب الآليات المتاحة.'
      console.error(err)
      availableMachineries.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchMachinery(id) {
    loading.value = true
    error.value = null
    currentMachinery.value = null
    try {
      const response = await machineryService.find(id)
      currentMachinery.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب بيانات الآلية.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createMachinery(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = {}
    try {
      await machineryService.create(payload)
    } catch (err) {
      handleServerErrors(err, 'فشل في إضافة الآلية.')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateMachinery(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = {}
    try {
      await machineryService.update(id, payload)
    } catch (err) {
      handleServerErrors(err, 'فشل في تحديث بيانات الآلية.')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteMachinery(id) {
    loading.value = true
    error.value = null
    try {
      await machineryService.delete(id)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف الآلية.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function handleServerErrors(err, defaultMessage) {
    if (err.response?.status === 422) {
      validationErrors.value = err.response.data.errors
      error.value = err.response.data.message || 'يوجد خطأ في البيانات المدخلة.'
    } else if (err.response?.status === 403) {
      error.value = 'عذراً، ليس لديك صلاحية للقيام بهذه العملية.'
    } else {
      error.value = err.response?.data?.message || defaultMessage
    }
    console.error(err)
  }

  return {
    machineries,
    availableMachineries, // تصدير القائمة المتاحة
    pagination,
    currentMachinery,
    loading,
    error,
    validationErrors,
    fetchMachineries,
    fetchAvailableMachineries, // تصدير دالة الجلب المخصصة
    fetchMachinery,
    createMachinery,
    updateMachinery,
    deleteMachinery,
  }
})
