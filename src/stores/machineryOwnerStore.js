import { defineStore } from 'pinia'
import { ref } from 'vue'
import machineryOwnerService from '@/services/MachineryOwnerService'

export const useMachineryOwnerStore = defineStore('machineryOwner', () => {
  const owners = ref([])
  const pagination = ref({})
  const currentOwner = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const validationErrors = ref({})

  async function fetchOwners(page = 1, search = '') {
    loading.value = true
    error.value = null
    try {
      const response = await machineryOwnerService.get(page, search)
      owners.value = response.data.data
      pagination.value = response.data.meta || {}
    } catch (err) {
      error.value = 'فشل في جلب بيانات أصحاب الآليات.'
      console.error(err)
      owners.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchOwner(id) {
    loading.value = true
    error.value = null
    currentOwner.value = null
    try {
      const response = await machineryOwnerService.find(id)
      currentOwner.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب بيانات صاحب الآلية.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createOwner(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = {}
    try {
      await machineryOwnerService.create(payload)
    } catch (err) {
      handleServerErrors(err, 'فشل في إضافة صاحب الآلية.')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateOwner(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = {}
    try {
      await machineryOwnerService.update(id, payload)
    } catch (err) {
      handleServerErrors(err, 'فشل في تحديث بيانات صاحب الآلية.')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteOwner(id) {
    loading.value = true
    error.value = null
    try {
      await machineryOwnerService.delete(id)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف صاحب الآلية.'
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
    owners,
    pagination,
    currentOwner,
    loading,
    error,
    validationErrors,
    fetchOwners,
    fetchOwner,
    createOwner,
    updateOwner,
    deleteOwner,
  }
})
