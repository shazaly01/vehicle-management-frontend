import { defineStore } from 'pinia'
import { ref } from 'vue'
import driverService from '@/services/DriverService'

export const useDriverStore = defineStore('driver', () => {
  const drivers = ref([])
  const pagination = ref({})
  const currentDriver = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const validationErrors = ref({})

  async function fetchDrivers(page = 1, search = '') {
    loading.value = true
    error.value = null
    try {
      const response = await driverService.get(page, search)
      drivers.value = response.data.data
      pagination.value = response.data.meta || {}
    } catch (err) {
      error.value = 'فشل في جلب بيانات السائقين.'
      console.error(err)
      drivers.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchDriver(id) {
    loading.value = true
    error.value = null
    currentDriver.value = null
    try {
      const response = await driverService.find(id)
      currentDriver.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب بيانات السائق.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createDriver(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = {}
    try {
      await driverService.create(payload)
    } catch (err) {
      handleServerErrors(err, 'فشل في إضافة السائق.')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateDriver(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = {}
    try {
      await driverService.update(id, payload)
    } catch (err) {
      handleServerErrors(err, 'فشل في تحديث بيانات السائق.')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteDriver(id) {
    loading.value = true
    error.value = null
    try {
      await driverService.delete(id)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف السائق.'
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
    drivers,
    pagination,
    currentDriver,
    loading,
    error,
    validationErrors,
    fetchDrivers,
    fetchDriver,
    createDriver,
    updateDriver,
    deleteDriver,
  }
})
