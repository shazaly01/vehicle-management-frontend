import { defineStore } from 'pinia'
import { ref } from 'vue'
import dispatchOrderService from '@/services/DispatchOrderService'

export const useDispatchOrderStore = defineStore('dispatchOrder', () => {
  const dispatchOrders = ref([])
  const pagination = ref({})
  const currentOrder = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const validationErrors = ref({})

  // دمجنا filters لتسهيل البحث المتقدم (حسب المشروع، الحالة، المورد، الخ)
  async function fetchOrders(page = 1, search = '', filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await dispatchOrderService.get(page, search, filters)
      dispatchOrders.value = response.data.data
      pagination.value = response.data.meta || {}
    } catch (err) {
      error.value = 'فشل في جلب بيانات أوامر التشغيل.'
      console.error(err)
      dispatchOrders.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchOrder(id) {
    loading.value = true
    error.value = null
    currentOrder.value = null
    try {
      const response = await dispatchOrderService.find(id)
      currentOrder.value = response.data.data
    } catch (err) {
      error.value = 'فشل في جلب بيانات أمر التشغيل.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createOrder(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = {}
    try {
      await dispatchOrderService.create(payload)
    } catch (err) {
      handleServerErrors(err, 'فشل في إنشاء أمر التشغيل.')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateOrder(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = {}
    try {
      await dispatchOrderService.update(id, payload)
    } catch (err) {
      handleServerErrors(err, 'فشل في تحديث أمر التشغيل.')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteOrder(id) {
    loading.value = true
    error.value = null
    try {
      await dispatchOrderService.delete(id)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف أمر التشغيل.'
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
    dispatchOrders,
    pagination,
    currentOrder,
    loading,
    error,
    validationErrors,
    fetchOrders,
    fetchOrder,
    createOrder,
    updateOrder,
    deleteOrder,
  }
})
