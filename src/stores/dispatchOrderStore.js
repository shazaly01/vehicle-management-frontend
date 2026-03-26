// src/stores/dispatchOrderStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import dispatchOrderService from '@/services/DispatchOrderService'
// ستحتاج لإنشاء هذا السيرفيس الجديد للتخاطب مع الـ TripController
import dispatchOrderTripService from '@/services/DispatchOrderTripService'

export const useDispatchOrderStore = defineStore('dispatchOrder', () => {
  // --- State ---
  const dispatchOrders = ref([])
  const pagination = ref({})
  const currentOrder = ref(null)
  const trips = ref([])
  // حالات التحميل والأخطاء
  const loading = ref(false)
  const actionLoading = ref(false) // خاص بأزرار الإضافة والتعديل لتجنب تجميد الشاشة بأكملها
  const error = ref(null)
  const validationErrors = ref({})

  // ==========================================================
  // 1. عمليات الأمر الرئيسي (Dispatch Order - العقد)
  // ==========================================================

  // --- الدالة الناقصة التي سببت المشكلة ---
  async function fetchTrips(filters = {}) {
    loading.value = true
    error.value = null
    try {
      // نستخدم السيرفيس المخصص للرحلات
      const response = await dispatchOrderTripService.get(filters)
      trips.value = response.data.data
      pagination.value = response.data.meta || {}
      return response.data.data
    } catch (err) {
      error.value = 'فشل في جلب قائمة الرحلات.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchOrders(page = 1, search = '', filters = {}) {
    loading.value = true
    try {
      const response = await dispatchOrderService.get(page, search, filters)
      dispatchOrders.value = response.data.data
      pagination.value = response.data.meta || {}
    } catch (err) {
      error.value = 'فشل في جلب البيانات.'
    } finally {
      loading.value = false
    }
  }

  async function fetchOrder(id) {
    loading.value = true
    // لا نصفر currentOrder هنا فوراً لتجنب وميض الشاشة (Flicker) في الفورم
    try {
      const response = await dispatchOrderService.find(id)
      currentOrder.value = response.data.data
      return response.data.data // نعيد البيانات لاستخدامها في الـ Component
    } catch (err) {
      error.value = 'فشل في جلب تفاصيل الأمر.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createOrder(payload) {
    actionLoading.value = true
    error.value = null
    validationErrors.value = {}
    try {
      const response = await dispatchOrderService.create(payload)
      return response.data.data // إعادة البيانات لتوجيه المستخدم لصفحة التفاصيل إن أردت
    } catch (err) {
      handleServerErrors(err, 'فشل في إنشاء أمر التشغيل.')
      throw err
    } finally {
      actionLoading.value = false
    }
  }

  async function updateOrder(id, payload) {
    actionLoading.value = true
    error.value = null
    validationErrors.value = {}
    try {
      const response = await dispatchOrderService.update(id, payload)

      // تحديث العنصر في القائمة (الجدول) فوراً بدون إعادة تحميل الصفحة كاملة
      const index = dispatchOrders.value.findIndex((o) => o.id === id)
      if (index !== -1) {
        dispatchOrders.value[index] = response.data.data
      }

      currentOrder.value = response.data.data
      return response.data.data
    } catch (err) {
      handleServerErrors(err, 'فشل في تحديث الأمر.')
      throw err
    } finally {
      actionLoading.value = false
    }
  }

  async function deleteOrder(id) {
    actionLoading.value = true
    error.value = null
    try {
      await dispatchOrderService.delete(id)
      dispatchOrders.value = dispatchOrders.value.filter((order) => order.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف أمر التشغيل.'
      console.error(err)
      throw err
    } finally {
      actionLoading.value = false
    }
  }

  // ==========================================================
  // 2. عمليات الحركات/النقلات (Dispatch Order Trips)
  // ==========================================================

  // إنشاء حركة جديدة تحت الأمر الرئيسي الحالي
  async function createTrip(payload) {
    actionLoading.value = true
    error.value = null
    validationErrors.value = {}
    try {
      await dispatchOrderTripService.create(payload)
      // بعد إضافة حركة، نُعيد جلب تفاصيل الأمر لتحديث قائمة الحركات المعروضة
      if (currentOrder.value) {
        await fetchOrder(currentOrder.value.id)
      }
    } catch (err) {
      handleServerErrors(err, 'فشل في تسجيل الحركة للآلية.')
      throw err
    } finally {
      actionLoading.value = false
    }
  }

  // تحديث حالة الحركة (دورة الاعتماد: loaded, delivered)
  async function updateTripStatus(tripId, status) {
    actionLoading.value = true
    error.value = null
    try {
      await dispatchOrderTripService.updateStatus(tripId, status)
      if (currentOrder.value) {
        await fetchOrder(currentOrder.value.id) // تحديث القائمة
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تحديث حالة الحركة.'
      console.error(err)
      throw err
    } finally {
      actionLoading.value = false
    }
  }

  // حذف حركة
  async function deleteTrip(tripId) {
    actionLoading.value = true
    error.value = null
    try {
      await dispatchOrderTripService.delete(tripId)
      if (currentOrder.value) {
        await fetchOrder(currentOrder.value.id)
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف الحركة.'
      console.error(err)
      throw err
    } finally {
      actionLoading.value = false
    }
  }

  // ==========================================================
  // 3. معالجة الأخطاء (Helpers)
  // ==========================================================

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

  // مسح الأخطاء يدوياً عند إغلاق النوافذ المنبثقة (Modals)
  function clearErrors() {
    error.value = null
    validationErrors.value = {}
  }

  return {
    // State
    dispatchOrders,
    trips,
    pagination,
    currentOrder,
    loading,
    actionLoading,
    error,
    validationErrors,

    // Order Actions
    fetchTrips,
    fetchOrders,
    fetchOrder,
    createOrder,
    updateOrder,
    deleteOrder,

    // Trip Actions
    createTrip,
    updateTripStatus,
    deleteTrip,

    // Helpers
    clearErrors,
  }
})
