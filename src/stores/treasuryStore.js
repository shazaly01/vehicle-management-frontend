import { defineStore } from 'pinia'
import { ref } from 'vue'
import treasuryService from '@/services/TreasuryService'

export const useTreasuryStore = defineStore('treasury', () => {
  const treasuries = ref([])
  const pagination = ref({})
  const currentTreasury = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const validationErrors = ref({})

  async function fetchTreasuries(page = 1, search = '') {
    loading.value = true
    error.value = null
    try {
      const response = await treasuryService.get(page, search)
      treasuries.value = response.data.data
      pagination.value = response.data.meta || {}
    } catch (err) {
      error.value = 'فشل في جلب بيانات الخزائن.'
      console.error(err)
      treasuries.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchTreasury(id) {
    loading.value = true
    error.value = null
    currentTreasury.value = null
    try {
      const response = await treasuryService.find(id)
      currentTreasury.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب بيانات الخزينة.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createTreasury(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = {}
    try {
      await treasuryService.create(payload)
    } catch (err) {
      handleServerErrors(err, 'فشل في إضافة الخزينة.')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTreasury(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = {}
    try {
      await treasuryService.update(id, payload)
    } catch (err) {
      handleServerErrors(err, 'فشل في تحديث بيانات الخزينة.')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteTreasury(id) {
    loading.value = true
    error.value = null
    try {
      await treasuryService.delete(id)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف الخزينة.'
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
    treasuries,
    pagination,
    currentTreasury,
    loading,
    error,
    validationErrors,
    fetchTreasuries,
    fetchTreasury,
    createTreasury,
    updateTreasury,
    deleteTreasury,
  }
})
