import { defineStore } from 'pinia'
import { ref } from 'vue'
import financialTransactionService from '@/services/FinancialTransactionService'

export const useFinancialTransactionStore = defineStore('financialTransaction', () => {
  const transactions = ref([])
  const pagination = ref({})
  const currentTransaction = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const validationErrors = ref({})

  async function fetchTransactions(page = 1, search = '', filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await financialTransactionService.get(page, search, filters)
      transactions.value = response.data.data
      pagination.value = response.data.meta || {}
    } catch (err) {
      error.value = 'فشل في جلب المعاملات المالية.'
      console.error(err)
      transactions.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchTransaction(id) {
    loading.value = true
    error.value = null
    currentTransaction.value = null
    try {
      const response = await financialTransactionService.find(id)
      currentTransaction.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب بيانات المعاملة.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createTransaction(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = {}
    try {
      await financialTransactionService.create(payload)
    } catch (err) {
      handleServerErrors(err, 'فشل في إنشاء المعاملة المالية.')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTransaction(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = {}
    try {
      await financialTransactionService.update(id, payload)
    } catch (err) {
      handleServerErrors(err, 'فشل في تحديث المعاملة المالية.')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteTransaction(id) {
    loading.value = true
    error.value = null
    try {
      await financialTransactionService.delete(id)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف المعاملة المالية.'
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
    transactions,
    pagination,
    currentTransaction,
    loading,
    error,
    validationErrors,
    fetchTransactions,
    fetchTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  }
})
